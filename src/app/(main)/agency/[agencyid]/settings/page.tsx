import AgencyDetails from '@/components/forms/agency-details'
import UserDetails from '@/components/forms/user-details'
import { db } from '@/lib/db'
import { currentUser } from '@clerk/nextjs/server'
import React from 'react'
import { nullable } from 'zod'

type Props = {
    params : { agencyId : string }
}

const SettingsPage = async ({ params }: Props) => {

    const authUser = await currentUser()
    if(!authUser) return null

    const userDetails = await db.user.findUnique({
        where:{
            email:authUser.emailAddresses[0].emailAddress,

        }
    })
    if(!userDetails) return nullable

    const agancyDetails = await db.agency.findUnique({
        where:{
            id: params.agencyId,
        },
        include:{
            SubAccount : true
        }
    })
    if(!agancyDetails) return null

    const subAccounts = agancyDetails.SubAccount

  return (
    <div className=' flex lg:!flex-row flex-col gap-4 '>
        <AgencyDetails data={agancyDetails}/>
        <UserDetails  type="agency" id = {params.agencyId}
        subAccounts= { subAccounts }
        userData = {userDetails} />
    </div>
  )
}

export default SettingsPage