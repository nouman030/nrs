import { db } from "@/lib/db"
import BlurPage from "@/components/global/blur-page"
import ProSubaccountDashboard from "./_components/Advnace-Subaccount-Dashbord"
import SubaccountDashboard from "./_components/subaccount-dashboard"

type SubaccountProps = {
  params: { subaccountId: string }
}

export default async function SubaccountPage({ params }: SubaccountProps) {
  const pr = await params;

  // Fetch subaccount data from database using Prisma
  const subaccountDetails = await db.subAccount.findUnique({
    where: {
      id: pr.subaccountId,
    },
    include: {
      Funnels: {
        include: {
          FunnelPages: true,
        },
      },
      Contact: true,
      Pipeline: {
        include: {
          Lane: {
            include: {
              Tickets: {
                include: {
                  Tags: true,
                },
              },
            },
          },
        },
      },
      Media: true,
    },
  })

  if (!subaccountDetails) {
    return <div className="p-6">Subaccount not found</div>
  }

  const subscription = await db.subscription.findUnique({
    where: {
      agencyId: subaccountDetails.agencyId,
    },
  })

  return (
    <BlurPage>
      {Number(subscription?.price || 0) > 0 ? (
        <ProSubaccountDashboard subaccountDetails={subaccountDetails} />
      ) : (
        <SubaccountDashboard subaccountDetails={subaccountDetails} />
      )}
    </BlurPage>
  )
}
