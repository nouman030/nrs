import { getFunnels } from '@/lib/queries'
import React from 'react'
import { Plus } from 'lucide-react'
import { columns } from './columns'

import BlurPage from '@/components/global/blur-page'
import FunnelsDataTable from './data-table'
import FunnelForm from '@/components/forms/funnel-form'

const Funnels = async ({ params }: { params: { subaccountId: string } }) => {
    const pr = await params
  const funnels = await getFunnels(pr.subaccountId)
  if (!funnels) return null

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
          <FunnelForm subAccountId={pr.subaccountId}></FunnelForm> 
       
        }
        filterValue="name"
        columns={columns}
        data={funnels}
      />
    </BlurPage>
  )
}

export default Funnels
