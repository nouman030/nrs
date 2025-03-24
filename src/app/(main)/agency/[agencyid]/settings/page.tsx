import AgencyDetails from '@/components/forms/agency-details'
import UserDetails from '@/components/forms/user-details'
import { db } from '@/lib/db'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ agencyid: string }>
}

const SettingsPage = async ({ params }: PageProps) => {
  // Await the params object
  const { agencyid } = await params

  const authUser = await currentUser()
  if (!authUser) return redirect('/sign-in')

  const userDetails = await db.user.findUnique({
    where: {
      email: authUser.emailAddresses[0].emailAddress,
    },
  })

  if (!userDetails) return redirect('/sign-in')

  if (!agencyid || typeof agencyid !== 'string') {
    return redirect('/agency')
  }

  const agencyDetails = await db.agency.findUnique({
    where: {
      id: agencyid,
    },
    include: {
      SubAccount: true,
    },
  })

  if (!agencyDetails) {
    return redirect('/agency')
  }

  return (
    <div className="flex lg:!flex-row flex-col gap-4">
      <AgencyDetails data={agencyDetails} />
      
      <UserDetails
        type="agency"
        id={agencyid}
        subAccounts={agencyDetails.SubAccount}
        userData={userDetails}
      />
    </div>
  )
}

export default SettingsPage

