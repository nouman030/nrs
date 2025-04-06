"use server"

import { clerkClient, currentUser, EmailAddress } from "@clerk/nextjs/server"
import { db } from "./db"
import { redirect } from "next/navigation"
import { Agency, Lane, Plan, Prisma, Role, SubAccount, Tag, Ticket, User } from "@prisma/client"
import { v4 } from "uuid"
import { CreateFunnelFormSchema, CreateMediaType, UpsertFunnelPage } from "./types"
import { z } from "zod"
import { revalidatePath } from "next/cache"


export const getAuthUserDetails = async () => {
  const user = await currentUser()
  if (!user) {
    return
  }

  const userData = await db.user.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    include: {
      Agency: {
        include: {
          SidebarOption: true,
          SubAccount: {
            include: {
              SidebarOption: true,
            },
          },
        },
      },
      Permissions: true,
    },
  })

  return userData
}

export const seveActivityLogsNotification = async ({
  agencyId,
  description,
  subaccountId,
}: {
  agencyId?: string
  description: string
  subaccountId?: string
}) => {
  const authUser = await currentUser()
  let userData
  if (!authUser) {
    const response = await db.user.findFirst({
      where: {
        Agency: {
          SubAccount: {
            some: { id: subaccountId },
          },
        },
      },
    })
    if (response) {
      userData = response
    }
  } else {
    userData = await db.user.findUnique({
      where: { email: authUser?.emailAddresses[0].emailAddress },
    })
  }

  if (!userData) {
    console.log('Could not find a user')
    return
  }

  let foundAgencyId = agencyId
  if (!foundAgencyId) {
    if (!subaccountId) {
      throw new Error(
        'You need to provide atleast an agency Id or subaccount Id'
      )
    }
    const response = await db.subAccount.findUnique({
      where: { id: subaccountId },
    })
    if (response) foundAgencyId = response.agencyId
  }
  if (subaccountId) {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Agency: {
          connect: {
            id: foundAgencyId,
          },
        },
        SubAccount: {
          connect: { id: subaccountId },
        },
      },
    })
  } else {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Agency: {
          connect: {
            id: foundAgencyId,
          },
        },
      },
    })
  }
}

export const createTeamUser = async (agencyId: string, user: User) => {
  if (user.role === 'AGENCY_OWNER') return null
  const response = await db.user.create({ data: { ...user } })
  return response
}

export const verifyAndAcceptInvitation = async () => {
  const user = await currentUser();
  if (!user) return redirect('/sign-in')
  const invitationExists = await db.invitation.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
      status: 'PENDING',
    },
  })

  if (invitationExists) {
    const userDetails = await createTeamUser(invitationExists.agencyId, {
      email: invitationExists.email,
      agencyId: invitationExists.agencyId,
      avatarUrl: user.imageUrl,
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      role: invitationExists.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    await seveActivityLogsNotification({
      agencyId: invitationExists?.agencyId,
      description: `Joined`,
      subaccountId: undefined,
    })

    if (userDetails) {
      const clark = await clerkClient();
      await clark.users.updateUserMetadata(user.id, {
        privateMetadata: {
          role: userDetails.role || 'SUBACCOUNT_USER',
        },
      })

      await db.invitation.delete({
        where: { email: userDetails.email },
      })

      return userDetails.agencyId
    } else return null
  } else {
    const agency = await db.user.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
    })
    return agency ? agency.agencyId : null
  }
}

export const updateAgencyDetails = async (
  agencyId: string,
  agencyDetails: Partial<Agency>
) => {
  const response = await db.agency.update({
    where: { id: agencyId },
    data: { ...agencyDetails },
  })
  return response
}

export const deleteAgency = async (agencyId: string) => {
  const response = await db.agency.delete({ where: { id: agencyId } })
  return response
}

export const initUser = async (newUser: Partial<User>) => {
  const user = await currentUser()
  if (!user) return

  const userData = await db.user.upsert({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    update: newUser,
    create: {
      id: user.id,
      avatarUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
      name: `${user.firstName} ${user.lastName}`,
      role: newUser.role || 'SUBACCOUNT_USER',
    },
  })
  const clark = await clerkClient();
  await clark.users.updateUserMetadata(user.id, {
    privateMetadata: {
      role: newUser.role || 'SUBACCOUNT_USER',
    },
  })

  return userData
}

export const upsertAgency = async (agency: Agency, price?: Plan) => {
  if (!agency.companyEmail) return null
  try {
    const agencyDetails = await db.agency.upsert({
      where: {
        id: agency.id,
      },
      update: agency,
      create: {
        users: {
          connect: { email: agency.companyEmail },
        },
        ...agency,
        SidebarOption: {
          create: [
            {
              name: 'Dashboard',
              icon: 'category',
              link: `/agency/${agency.id}`,
            },
            {
              name: 'Launchpad',
              icon: 'clipboardIcon',
              link: `/agency/${agency.id}/launchpad`,
            },
            {
              name: 'Billing',
              icon: 'payment',
              link: `/agency/${agency.id}/billing`,
            },
            {
              name: 'Settings',
              icon: 'settings',
              link: `/agency/${agency.id}/settings`,
            },
            {
              name: 'Sub Accounts',
              icon: 'person',
              link: `/agency/${agency.id}/all-subaccounts`,
            },
            {
              name: 'Team',
              icon: 'shield',
              link: `/agency/${agency.id}/team`,
            },
          ],
        },
      },
    })
    return agencyDetails
  } catch (error) {
    console.log(error)
  }
}

export const getNotificationAndUser = async (agencyId: string) => {
  try {
    const response = await db.notification.findMany({
      where: { agencyId },
      include: { User: true },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return response
  } catch (error) {
    console.log(error)
  }
}

export const upsertSubAccount = async (subAccount: any) => {
  if (!subAccount.companyEmail) return null

  // Find the agency owner
  const agencyOwner = await db.user.findFirst({
    where: {
      Agency: {
        id: subAccount.agencyId,
      },
      role: "AGENCY_OWNER",
    },
  })

  if (!agencyOwner) {
    console.log("🔴Error could not create subaccount: Agency owner not found")
    return null
  }

  try {
    // Find all users who have access to this agency (agency admins and owner)
    const agencyUsers = await db.user.findMany({
      where: {
        Agency: {
          id: subAccount.agencyId,
        },
        OR: [{ role: "AGENCY_OWNER" }, { role: "AGENCY_ADMIN" }],
      },
    })

    // Create the subaccount with initial permissions for the agency owner
    const response = await db.subAccount.upsert({
      where: { id: subAccount.id },
      update: subAccount,
      create: {
        ...subAccount,
        Pipeline: {
          create: { name: "Lead Cycle" },
        },
        SidebarOption: {
          create: [
            {
              name: "Launchpad",
              icon: "clipboardIcon",
              link: `/subaccount/${subAccount.id}/launchpad`,
            },
            {
              name: "Settings",
              icon: "settings",
              link: `/subaccount/${subAccount.id}/settings`,
            },
            {
              name: "Funnels",
              icon: "pipelines",
              link: `/subaccount/${subAccount.id}/funnels`,
            },
            {
              name: "Media",
              icon: "database",
              link: `/subaccount/${subAccount.id}/media`,
            },
            // {
            //   name: "Automations",
            //   icon: "chip",
            //   link: `/subaccount/${subAccount.id}/automations`,
            // },
            {
              name: "Pipelines",
              icon: "flag",
              link: `/subaccount/${subAccount.id}/pipelines`,
            },
            {
              name: "Contacts",
              icon: "person",
              link: `/subaccount/${subAccount.id}/contacts`,
            },
            {
              name: "Dashboard",
              icon: "category",
              link: `/subaccount/${subAccount.id}`,
            },
          ],
        },
      },
    })

    // Create permissions for all agency users
    for (const user of agencyUsers) {
      // Check if permission already exists
      const existingPermission = await db.permissions.findFirst({
        where: {
          userId: user.id,
          subAccountId: response.id,
        },
      })

      if (!existingPermission) {
        await db.permissions.create({
          data: {
            access: true,
            email: user.email,
            User: {
              connect: { id: user.id },
            },
            SubAccount: {
              connect: { id: response.id },
            },
          },
        })
      }
    }

    // Find all users with SUBACCOUNT_USER or SUBACCOUNT_GUEST roles who have permissions to this agency
    const subaccountUsers = await db.user.findMany({
      where: {
        Permissions: {
          some: {
            SubAccount: {
              agencyId: subAccount.agencyId,
            },
          },
        },
        OR: [{ role: "SUBACCOUNT_USER" }, { role: "SUBACCOUNT_GUEST" }],
      },
    })

    // Create permissions for subaccount users based on their role
    for (const user of subaccountUsers) {
      // Check if permission already exists
      const existingPermission = await db.permissions.findFirst({
        where: {
          userId: user.id,
          subAccountId: response.id,
        },
      })

      if (!existingPermission) {
        await db.permissions.create({
          data: {
            // SUBACCOUNT_USER gets full access, SUBACCOUNT_GUEST gets limited access
            access: user.role === "SUBACCOUNT_USER",
            email: user.email,
            User: {
              connect: { id: user.id },
            },
            SubAccount: {
              connect: { id: response.id },
            },
          },
        })
      }
    }

    return response
  } catch (error) {
    console.error("Error in upsertSubAccount:", error)
    return null
  }
}
export const getUserPermissions = async (userId: string) => {
  const response = await db.user.findUnique({
    where: { id: userId },
    select: { Permissions: { include: { SubAccount: true } } },
  })

  return response
}

export const changeUserPermissions = async (
  permissionId: string | undefined,
  userEmail: string,
  subAccountId: string,
  permission: boolean
) => {
  try {
    // First get the user by email
    const user = await db.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const response = await db.permissions.upsert({
      where: { id: permissionId },
      update: { access: permission },
      create: {
        access: permission,
        email: userEmail,
        subAccountId: subAccountId,
        userId: user.id, // Add the required userId field
      },
    })
    return response
  } catch (error) {
    console.log('🔴Could not change permission', error)
    return null
  }
}


export const getSubaccountDetails = async (subaccountId: string) => {
  const response = await db.subAccount.findUnique({
    where: {
      id: subaccountId,
    },
  })
  return response
}

export const deleteSubAccount = async (subaccountId: string) => {
  const response = await db.subAccount.delete({
    where: {
      id: subaccountId,
    },
  })
  return response
}

export const deleteUser = async (userId: string) => {
  const clark = await clerkClient();
  await clark.users.updateUserMetadata(userId, {
    privateMetadata: {
      role: undefined,
    },
  })
  const deletedUser = await db.user.delete({ where: { id: userId } })

  return deletedUser
}

export const getUser = async (id: string) => {
  const user = await db.user.findUnique({
    where: {
      id,
    },
  })

  return user
}

export const sendInvitation = async (
  role: Role,
  email: string,
  agencyId: string
) => {
  const resposne = await db.invitation.create({
    data: { email, agencyId, role },
  })

  try {
    const clark = await clerkClient();
    const invitation = await clark.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: process.env.NEXT_PUBLIC_URL,
      publicMetadata: {
        throughInvitation: true,
        role,
      },
    })
  } catch (error) {
    console.log(error)
    throw error
  }

  return resposne
}

export const getMedia = async (subaccountId: string) => {
  const mediafiles = await db.subAccount.findUnique({
    where: {
      id: subaccountId
    },
    include: {
      Media: true
    },

  })
  return mediafiles
}


export const createMedia = async (subaccountId: string, mediafile: CreateMediaType) => {
  const response = await db.media.create({
    data: {
      link: mediafile.link,
      name: mediafile.name,
      subAccountId: subaccountId
    }
  })
  return response
}

export const deleteMedia = async (mediaId: string) => {
  const response = await db.media.delete({
    where: {
      id: mediaId
    }
  })
  return response
}


export const getPipeLineDetails = async (pipelineId: string) => {
  const response = await db.pipeline.findUnique({
    where: {
      id: pipelineId
    }
  })
  return response
}

export const getLanesWithTicketAndTags = async (pipelineId: string) => {
  const response = await db.lane.findMany({
    where: {
      pipelineId: pipelineId
    },

    orderBy: {
      order: 'asc'
    },

    include: {
      Tickets: {
        orderBy: {
          order: 'asc'
        },
        include: {
          Tags: true,
          Assigned: true,
          Customer: true,
        },
      },
    }
  })
  return response
}

export const upsertFunnel = async (
  subaccountId: string,
  funnel: z.infer<typeof CreateFunnelFormSchema> & { liveProducts: string },
  funnelId: string
) => {
  const response = await db.funnel.upsert({
    where: { id: funnelId },
    update: funnel,
    create: {
      ...funnel,
      id: funnelId || v4(),
      subAccountId: subaccountId,
    },
  })

  return response
}

export const upsertPipeline = async (
  pipeline: Prisma.PipelineUncheckedCreateWithoutLaneInput
) => {
  const response = await db.pipeline.upsert({
    where: { id: pipeline.id || v4() },
    update: pipeline,
    create: pipeline,
  })

  return response
}

export const deletePipeline = async (pipelineId: string) => {
  const response = await db.pipeline.delete({
    where: { id: pipelineId },
  })

  return response
}


export const updateLanesOrder = async (lanes: Lane[]) => {
  try {
    const updateTrans = lanes.map((lane) =>
      db.lane.update({
        where: {
          id: lane.id,
        },
        data: {
          order: lane.order,
        }
      })
    )
    await db.$transaction(updateTrans)
  } catch (error) {
    console.log("🔴Could not update lanes order ", error)
  }
}

export const updateTicketsOrder = async (Tickets: Ticket[]) => {
  try {
    const upadteTrans = Tickets.map((ticket) =>
      db.ticket.update({
        where: {
          id: ticket.id,
        },
        data: {
          order: ticket.order,
          laneId: ticket.laneId,
        },
      })
    )
    await db.$transaction(upadteTrans)
  } catch (error) {
    console.log('🔴Could not update tickets order', error)
  }
}

export const upsertLane = async (lane: Prisma.LaneUncheckedCreateInput) => {
  let order: number

  if (!lane.order) {
    const lanes = await db.lane.findMany({
      where: {
        pipelineId: lane.pipelineId,
      },
    })

    order = lanes.length
  } else {
    order = lane.order
  }

  const response = await db.lane.upsert({
    where: { id: lane.id || v4() },
    update: lane,
    create: { ...lane, order },
  })

  return response
}

export const getPipelineDetails = async (pipelineId: string) => {
  const response = await db.pipeline.findUnique({
    where: {
      id: pipelineId,
    },
  })
  return response
}


export const deleteLane = async (laneId: string) => {
  const response = await db.lane.delete(
    {
      where: { id: laneId },
    }
  )
  return response

}

export const getTicketsWithTags = async (pipelineId: string) => {
  const response = await db.ticket.findMany({
    where: {
      Lane: {
        pipelineId,
      },
    },
    include: { Tags: true, Assigned: true, Customer: true },
  })
  return response
}



export const _getTicketsWithAllRelations = async (laneId: string) => {
  const response = await db.ticket.findMany({
    where: { laneId: laneId },
    include: {
      Assigned: true,
      Customer: true,
      Lane: true,
      Tags: true,
    },
  })
  return response
}

export const getSubAccountTeamMembers = async (subaccountId: string) => {
  const subaccountUsersWithAccess = await db.user.findMany({
    where: {
      Agency: {
        SubAccount: {
          some: {
            id: subaccountId,
          },
        },
      },
      role: 'SUBACCOUNT_USER',
      Permissions: {
        some: {
          subAccountId: subaccountId,
          access: true,
        },
      },
    },
  })
  return subaccountUsersWithAccess
}

export const searchContacts = async (searchTerms: string) => {
  const response = await db.contact.findMany({
    where: {
      name: {
        contains: searchTerms,
      },
    },
  })
  return response
}

export const upsertTicket = async (
  ticket: Prisma.TicketUncheckedCreateInput,
  tags: Tag[]
) => {
  let order: number
  if (!ticket.order) {
    const tickets = await db.ticket.findMany({
      where: { laneId: ticket.laneId },
    })
    order = tickets.length
  } else {
    order = ticket.order
  }

  const response = await db.ticket.upsert({
    where: {
      id: ticket.id || v4(),
    },
    update: { ...ticket, Tags: { set: tags } },
    create: { ...ticket, Tags: { connect: tags }, order },
    include: {
      Assigned: true,
      Customer: true,
      Tags: true,
      Lane: true,
    },
  })

  return response
}

export const deleteTicket = async (ticketId: string) => {
  const response = await db.ticket.delete({
    where: {
      id: ticketId,
    },
  })

  return response
}


export const deleteTag = async (tagId: string) => {
  const response = await db.tag.delete({ where: { id: tagId } })
  return response
}


export const getTagsForSubaccount = async (subaccountId: string) => {
  const response = await db.subAccount.findUnique({
    where: { id: subaccountId },
    select: { Tags: true },
  })
  return response
}

export const upsertTag = async (
  subaccountId: string,
  tag: Prisma.TagUncheckedCreateInput
) => {
  const response = await db.tag.upsert({
    where: { id: tag.id || v4(), subAccountId: subaccountId },
    update: tag,
    create: { ...tag, subAccountId: subaccountId },
  })

  return response
}

export const upsertContact = async (
  contact: Prisma.ContactUncheckedCreateInput
) => {
  const response = await db.contact.upsert({
    where: { id: contact.id || v4() },
    update: contact,
    create: contact,
  })
  return response
}

export const getFunnels = async (subacountId: string) => {
  const funnels = await db.funnel.findMany({
    where: { subAccountId: subacountId },
    include: { FunnelPages: true },
  })

  return funnels
}

export const getFunnel = async (funnelId: string) => {
  const funnel = await db.funnel.findUnique({
    where: { id: funnelId },
    include: {
      FunnelPages: {
        orderBy: {
          order: 'asc',
        },
      },
    },
  })

  return funnel
}

export const upsertFunnelPage = async (
  subaccountId: string,
  funnelPage: UpsertFunnelPage,
  funnelId: string
) => {
  if (!subaccountId || !funnelId) return
  const response = await db.funnelPage.upsert({
    where: { id: funnelPage.id || '' },
    update: { ...funnelPage },
    create: {
      ...funnelPage,
      content: funnelPage.content
        ? funnelPage.content
        : JSON.stringify([
          {
            content: [],
            id: '__body',
            name: 'Body',
            styles: { backgroundColor: 'white' },
            type: '__body',
          },
        ]),
      funnelId,
    },
  })

  revalidatePath(`/subaccount/${subaccountId}/funnels/${funnelId}`, 'page')
  return response
}


export const deleteFunnelePage = async (funnelPageId: string) => {
  const response = await db.funnelPage.delete({ where: { id: funnelPageId } })

  return response
}

export const getFunnelPageDetails = async (funnelPageId: string) => {
  const response = await db.funnelPage.findUnique({
    where: {
      id: funnelPageId,
    },
  })

  return response
}


export const getDomainContent = async (subDomainName: string) => {
  const response = await db.funnel.findUnique({
    where: {
      subDomainName,
    },
    include: { FunnelPages: true },
  })
  return response
}


export const createSubscription = async (subscription: {
  planId: string
  customerId: string
  currentPeriodEndDate: Date
  subscritiptionId: string
  price?: string
  agencyId?: string
}) => {
  const response = await db.subscription.create({
    data: {
      planId: subscription.planId,
      customerId: subscription.customerId,
      currentPeriodEndDate: subscription.currentPeriodEndDate,
      subscritiptionId: subscription.subscritiptionId,
      price: subscription.price,
      agencyId: subscription.agencyId,
      active: true
    }
  })
  return response
}

export const updateSubscription = async (
  subscriptionId: string,
  subscription: Partial<{
    planId: string
    customerId: string
    currentPeriodEndDate: Date
    subscritiptionId: string
    price: string
    agencyId: string
    active: boolean
  }>
) => {
  const response = await db.subscription.update({
    where: { subscritiptionId: subscriptionId },
    data: subscription
  })
  return response
}

export const getSubscription = async (subscriptionId: string) => {
  const response = await db.subscription.findUnique({
    where: { subscritiptionId: subscriptionId }
  })
  return response
}

export const getPipelines = async (subaccountId: string) => {
  const response = await db.pipeline.findMany({
    where: { subAccountId: subaccountId },
    include: {
      Lane: {
        include: { Tickets: true },
      },
    },
  })
  return response
}

export const deleteFunnel = async (funnelId: string) => {
  const response = await db.funnel.delete({
    where: { id: funnelId },
  })
  return response
}


