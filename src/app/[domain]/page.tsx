import { db } from '@/lib/db'
import { getDomainContent } from '@/lib/queries'
import EditorProvider from '@/providers/editor/editor-provider'
import { notFound } from 'next/navigation'
import React from 'react'
import FunnelEditorNavigation from '../(main)/subaccount/[subaccountId]/funnels/[funnelId]/editor/[funnelPageId]/_components/funnel-editor-navigation'
import FunnelEditor from '../(main)/subaccount/[subaccountId]/funnels/[funnelId]/editor/[funnelPageId]/_components/funnel-editor'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { domain: string } }): Promise<Metadata> {
  const domainData = await getDomainContent(params.domain.slice(0, -1))
  
  if (!domainData) {
    return {
      title: 'Not Found',
    }
  }

  return {
    title: domainData.name,
    icons: {
      icon: [
        { url: domainData.favicon || '/favicon.ico', type: domainData.favicon?.endsWith('.ico') ? 'image/x-icon' : 'image/png' }
      ],
    },
  }
}

const Page = async ({ params }: { params: { domain: string } }) => {

  const pr = await params
  const domainData = await getDomainContent(pr.domain.slice(0, -1))
  if (!domainData) return notFound()

  const pageData = domainData.FunnelPages.find((page) => !page.pathName)

  if (!pageData) return notFound()

  await db.funnelPage.update({
    where: {
      id: pageData.id,
    },
    data: {
      visits: {
        increment: 1,
      },
    },
  })

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
