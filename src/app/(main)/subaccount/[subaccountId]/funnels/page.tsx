import { getFunnels } from '@/lib/queries'
import React from 'react'
import { Plus } from 'lucide-react'
import { columns } from './columns'
import { db } from '@/lib/db'
import BlurPage from '@/components/global/blur-page'
import FunnelsDataTable from './data-table'
import FunnelForm from '@/components/forms/funnel-form'

const Funnels = async ({ params }: { params: { subaccountId: string } }) => {
  const pr = await params
  const funnels = await getFunnels(pr.subaccountId)
  if (!funnels) return null

  // Get subaccount details to fetch agency ID
  const subaccountDetails = await db.subAccount.findUnique({
    where: {
      id: pr.subaccountId,
    },
    include: {
      Agency: {
        include: {
          Subscription: true
        }
      }
    }
  })

  if (!subaccountDetails) return null

  const subscriptionPrice = Number(subaccountDetails.Agency?.Subscription?.price || 0)
  const currentFunnelsCount = funnels.length

  return (
    <BlurPage>
      <FunnelsDataTable
        actionButtonText={
          <>
            <Plus size={15} />
            Create Funnel
          </>
        }
        modalChildren={
          <FunnelForm 
            subAccountId={pr.subaccountId}
            subscriptionPrice={subscriptionPrice}
            currentFunnelsCount={currentFunnelsCount}
            agencyId={subaccountDetails.Agency?.id || ''}
          />
        }
        filterValue="name"
        columns={columns}
        data={funnels}
      />
    </BlurPage>
  )
}

export default Funnels
