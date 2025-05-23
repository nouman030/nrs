import BlurPage from '@/components/global/blur-page'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getFunnel } from '@/lib/queries'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'
import FunnelSteps from './_components/funnel-steps'
import FunnelSettings from './_components/funnel-settings'

type Props = {
  params: { funnelId: string; subaccountId: string }
}

const FunnelPage = async ({ params }: Props) => {
  const pr = await params
  const funnelPages = await getFunnel(pr.funnelId)
  if (!funnelPages)
    return redirect(`/subaccount/${pr.subaccountId}/funnels`)

  return (
    <BlurPage>
      <Link
        href={`/subaccount/${pr.subaccountId}/funnels`}
        className="flex justify-between gap-4 mb-4 text-muted-foreground"
      >
        Back
      </Link>
      <h1 className="text-3xl mb-8">{funnelPages.name}</h1>
      <Tabs
        defaultValue="steps"
        className="w-full"
      >
        <TabsList className="grid  grid-cols-2 w-[50%] bg-transparent ">
          <TabsTrigger value="steps">Steps</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="steps">
          <FunnelSteps
            funnel={funnelPages}
            subaccountId={pr.subaccountId}
            pages={funnelPages.FunnelPages}
            funnelId={pr.funnelId}
          />
        </TabsContent>
        <TabsContent value="settings">
          <FunnelSettings
            subaccountId={pr.subaccountId}
            defaultData={funnelPages}
          />
        </TabsContent>
      </Tabs>
    </BlurPage>
  )
}

export default FunnelPage
