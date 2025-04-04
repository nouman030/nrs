import { db } from '@/lib/db'
import React from 'react'
import DataTable from './data-table'
import { Plus } from 'lucide-react'
import { currentUser } from '@clerk/nextjs/server'
import { columns } from './columns'
import SendInvitation from '@/components/forms/send-invitation'

type Props = {
    params: { agencyid: string }
}

const TeamPage = async ({ params }: Props) => {
    const authUser = await currentUser()
    if (!authUser) return null

    const { agencyid } = await params

    const agencyDetails = await db.agency.findUnique({
        where: {
            id: agencyid,
        },
        include: {
            SubAccount: true,
            Subscription: true,
        },
    })

    if (!agencyDetails) {
        return <div>Agency not found</div>
    }

    const teamMembers = await db.user.findMany({
        where: {
            Agency: {
                id: agencyid,
            },
        },
        include: {
            Agency: {
                include: {
                    SubAccount: true
                }
            },
            Permissions: {
                include: {
                    SubAccount: true
                }
            },
        }
    })

    return (
        <DataTable 
            actionButtonText={<><Plus size={15}/></>}
            modalChildren={
                <SendInvitation 
                    agencyId={agencyDetails.id}
                    teamMembersCount={teamMembers.length}
                    subscriptionPrice={Number(agencyDetails.Subscription?.price || 0)}
                />
            }
            filterValue='name'
            columns={columns}
            data={teamMembers}
        />
    )
}

export default TeamPage

