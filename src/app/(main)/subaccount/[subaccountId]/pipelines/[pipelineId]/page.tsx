import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { db } from '@/lib/db'
import { getLanesWithTicketAndTags, getPipeLineDetails, updateLanesOrder, updateTicketsOrder } from '@/lib/queries'
import { LaneDetail } from '@/lib/types'
import { redirect } from 'next/navigation'
import React from 'react'
import PipelineInfobar from '../_components/pipeline-infobar'
import PipelineSettings from '../_components/pipeline-settings'
import PipelineView from '../_components/pipeline-view'

type Props = {
    params : {
        subaccountId: string
        pipelineId: string
    }
}

const PipelinePage = async ({params}: Props) => {

    const pr = await params

    const pipelineDetails= await getPipeLineDetails(pr.pipelineId)
    if(!pipelineDetails){
        return redirect(`/subaccount/${pr.subaccountId}/pipelines`)
    }

   const pipelines = await db.pipeline.findMany({
    where: { subAccountId : pr.subaccountId }
   })

   const lanes = (await getLanesWithTicketAndTags(pr.pipelineId)) as LaneDetail[]

  return (
    <Tabs defaultValue='view'
    className='w-full'
    >
        <TabsList className='bg-transparent border-b-2 h-16 w-full justify-between' >
            <PipelineInfobar
            pipelineId = {pr.pipelineId}
            subAccountId = {pr.subaccountId}
            pipelines = {pipelines}
           />
           <div>
            <TabsTrigger value='view' >
                Pipeline View
            </TabsTrigger>
            <TabsTrigger value='settings' >
                Settings
            </TabsTrigger>
           </div>
        </TabsList>
        <TabsContent value='view'>
            <PipelineView
             lanes={lanes}
             pipelineDetails={pipelineDetails}
             pipelineId={pr.pipelineId}
             subaccountId={pr.subaccountId}
             updateLanesOrder={updateLanesOrder}
             updateTicketsOrder={updateTicketsOrder}
            />
        </TabsContent>
        <TabsContent value='settings'>
            <PipelineSettings
             pipelineId={pr.pipelineId}
             pipelines={pipelines}
             subaccountId={pr.subaccountId}
            />
        </TabsContent>
    </Tabs>
  )
}

export default PipelinePage