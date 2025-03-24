import { db } from "@/lib/db"
import { currentUser } from "@clerk/nextjs/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Invalid invitation token" }, { status: 400 })
    }

    // Get the current authenticated user
    const authUser = await currentUser()
    if (!authUser) {
      // Redirect to sign-in page if not authenticated
      return NextResponse.redirect(new URL("/sign-in", req.url))
    }

    // Find the invitation by token
    const invitation = await db.invitation.findUnique({
      where: { token },
      include: { Agency: true },
    })

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found or has expired" }, { status: 404 })
    }

    if (invitation.status !== "PENDING") {
      return NextResponse.json({ error: "Invitation has already been used or revoked" }, { status: 400 })
    }

    // Check if the invitation email matches the authenticated user's email
    const userEmail = authUser.emailAddresses[0].emailAddress
    if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
      return NextResponse.json({ error: "This invitation was sent to a different email address" }, { status: 403 })
    }

    // Find or create the user
    let user = await db.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      // Create a new user
      user = await db.user.create({
        data: {
          avatarUrl: "",
          email: userEmail,
          name: authUser.firstName ? `${authUser.firstName} ${authUser.lastName || ""}` : userEmail.split("@")[0],
          role: invitation.role,
          id: authUser.id,
          Agency: {
            connect: { id: invitation.agencyId },
          },
        },
      })
    } else {
      // For existing users, handle based on role
      if (invitation.role === "AGENCY_OWNER" || invitation.role === "AGENCY_ADMIN") {
        // Connect user to the agency
        await db.user.update({
          where: { id: user.id },
          data: {
            Agency: {
              connect: { id: invitation.agencyId },
            },
          },
        })
      }

      // For subaccount roles, create permissions
      if (invitation.role === "SUBACCOUNT_USER" || invitation.role === "SUBACCOUNT_GUEST") {
        // Get all subaccounts for the agency
        const subaccounts = await db.subAccount.findMany({
          where: { agencyId: invitation.agencyId },
        })

        // Create permissions for each subaccount
        for (const subaccount of subaccounts) {
          // Check if permission already exists
          const existingPermission = await db.permissions.findFirst({
            where: {
              userId: user.id,
              subAccountId: subaccount.id,
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
                  connect: { id: subaccount.id },
                },
              },
            })
          }
        }
      }
    }

    // Mark invitation as accepted
    await db.invitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    })

    // Log the activity
    await db.notification.create({
      data: {
        notification: `${user.name} accepted invitation`,
        User: {
          connect: { id: user.id },
        },
        Agency: {
          connect: { id: invitation.agencyId },
        },
      },
    })

    // Redirect to the appropriate page based on role
    if (invitation.role === "AGENCY_OWNER" || invitation.role === "AGENCY_ADMIN") {
      return NextResponse.redirect(new URL(`/agency/${invitation.agencyId}`, req.url))
    } else {
      return NextResponse.redirect(new URL("/subaccount", req.url))
    }
  } catch (error) {
    console.error("Error accepting invitation:", error)
    return NextResponse.json({ error: "Failed to process invitation" }, { status: 500 })
  }
}

