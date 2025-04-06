import React from 'react'

import { Funnel, SubAccount } from '@prisma/client'
import { db } from '@/lib/db'
import FunnelForm from '@/components/forms/funnel-form'
import FunnelDelete from './funnel-delete'


interface FunnelSettingsProps {
  subaccountId: string
  defaultData: Funnel
}

const FunnelSettings: React.FC<FunnelSettingsProps> = async ({
  subaccountId,
  defaultData,
}) => {
  //CHALLENGE: go connect your stripe to sell products

  const subaccountDetails = await db.subAccount.findUnique({
    where: {
      id: subaccountId,
    },
  })

  if (!subaccountDetails) return
  
 

  return (
    <div className="flex gap-4 flex-col xl:!flex-col">
      <FunnelForm
        subAccountId={subaccountId}
        defaultData={defaultData}
        agencyId={subaccountDetails.agencyId}
        subscriptionPrice={0}
        currentFunnelsCount={0}
        mode="update"
      />
      <FunnelDelete
        funnelId={defaultData.id}
        subaccountId={subaccountId}
      />
    </div>
  )
}

export default FunnelSettings
