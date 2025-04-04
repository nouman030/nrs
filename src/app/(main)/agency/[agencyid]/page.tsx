import { db } from "@/lib/db"
import { currentUser } from '@clerk/nextjs/server'
import { getAuthUserDetails } from '@/lib/queries'
import AgencyDashboard from './_components/agency-dashboard'
import ProAgencyDashboard from './_components/AdvanceAgancy-Dashbord'

type AgencyProps = {
  params: { agencyid: string }
}

export default async function AgencyPage({ params }: AgencyProps) {
  const user = await getAuthUserDetails()
  if (!user) return
  const pr = await params;
  // Fetch agency data from database using Prisma
  const agencyDetails = await db.agency.findUnique({
    where: {
      id: pr.agencyid || '',
    },
    include: {
      SubAccount: true,
      users: true,
      Subscription: true,
    },
  })

  if (!agencyDetails) {
    return <div className="p-6">Agency not found</div>
  }

  return (
    <>
    {Number(agencyDetails.Subscription?.price || 0) > 0 ? (
      <ProAgencyDashboard agencyDetails={agencyDetails} user={user} />
    ) : (
      <AgencyDashboard agencyDetails={agencyDetails} user={user} />
    )}
    </>
  )
}
