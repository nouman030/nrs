import { db } from '@/lib/db'
import EditorProvider from '@/providers/editor/editor-provider'
import { redirect } from 'next/navigation'
import React from 'react'
import FunnelEditorNavigation from './_components/funnel-editor-navigation'
import FunnelEditor from './_components/funnel-editor'
import FunnelEditorSidebar from './_components/funnel-editor-sidebar'

type Props = {
    params: {
        subaccountId: string
        funnelId: string
        funnelPageId: string
    }
}

const page = async ({ params }: Props) => {
    const pr = await params

    const funnelPageDetails = await db.funnelPage.findFirst({
        where: {
            id: pr.funnelPageId,
        },

    })

    if (!funnelPageDetails) {
        return redirect(
            `/subaccount/${params.subaccountId}/funnels/${params.funnelId}`
        )
    }


    return (
        <div className="fixed top-0 bottom-0 left-0 right-0 z-[20] bg-background/95 backdrop-blur-sm overflow-hidden">
            <EditorProvider
                subaccountId={pr.subaccountId}
                funnelId={pr.funnelId}
                pageDetails={funnelPageDetails}
            >
                <FunnelEditorNavigation
                    funnelId={pr.funnelId}
                    funnelPageDetails={funnelPageDetails}
                    subaccountId={pr.subaccountId}
                />
                <div className="h-[calc(100vh-97px)] flex justify-center items-start pt-6 overflow-x-hidden">
                    <FunnelEditor funnelPageId={pr.funnelPageId} />
                </div>

                <FunnelEditorSidebar subaccountId={pr.subaccountId} />
            </EditorProvider>
        </div>
    )
}

export default page