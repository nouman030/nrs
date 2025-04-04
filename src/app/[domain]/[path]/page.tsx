import FunnelEditor from '@/app/(main)/subaccount/[subaccountId]/funnels/[funnelId]/editor/[funnelPageId]/_components/funnel-editor'
import { db } from '@/lib/db'
import { getDomainContent } from '@/lib/queries'
import EditorProvider from '@/providers/editor/editor-provider'
import { notFound } from 'next/navigation'
import React from 'react'
import { Metadata } from 'next'

export async function generateMetadata({ 
  params 
}: { 
  params: { domain: string; path: string } 
}): Promise<Metadata> {
  const domainData = await getDomainContent(params.domain.slice(0, -1))
  
  if (!domainData) {
    return {
      title: 'Not Found',
    }
  }

  const pageData = domainData.FunnelPages.find(
    (page) => page.pathName === params.path
  )

  return {
    title: pageData ? `${domainData.name} - ${pageData.name}` : domainData.name,
    icons: {
      icon: domainData.favicon || '/favicon.ico',
    },
  }
}

const Page = async ({
  params,
}: {
  params: { domain: string; path: string }
}) => {
  const pr = await params
  const domainData = await getDomainContent(pr.domain.slice(0, -1))
  const pageData = domainData?.FunnelPages.find(
    (page) => page.pathName === pr.path
  )

 
  if (!pageData || !domainData) return notFound()

  return (
    <EditorProvider
      subaccountId={domainData.subAccountId}
      pageDetails={pageData}
      funnelId={domainData.id}
    >
      <FunnelEditor
        funnelPageId={pageData.id}
        liveMode={true}
      />
    </EditorProvider>
  )
}

export default Page
