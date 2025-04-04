'use client'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { useEditor } from '@/providers/editor/editor-provider'
import clsx from 'clsx'
import React from 'react'
import TabList from './tabs'
import SettingsTab from './tabs/settings-tab'
import MediaBucketTab from './tabs/media-bucket-tab'
import ComponentsTab from './tabs/components-tab'
import LayersTab from './tabs/layers-tab'

type Props = {
  subaccountId: string
}

const FunnelEditorSidebar = ({ subaccountId }: Props) => {
  const { state, dispatch } = useEditor()

  return (
    <div className="fixed right-0 top-0 h-[100vh]">
      <Sheet
        open={true}
        modal={false}
      >
        <Tabs
          className="w-full h-full"
          defaultValue="Settings"
        >
          <SheetContent
            showX={false}
            side="right"
            className={clsx(
              'fixed right-0 mt-[97px] w-16 z-[80] shadow-lg border-l border-border/50 p-0 focus:border-none transition-all overflow-hidden bg-background/95 backdrop-blur-sm',
              { hidden: state.editor.previewMode }
            )}
          >
            <TabList />
          </SheetContent>
          <SheetContent
            showX={false}
            side="right"
            className={clsx(
              'fixed right-16 mt-[97px] w-80 z-[40] shadow-lg border-l border-border/50 p-0 bg-background/95 backdrop-blur-sm h-[calc(100vh-97px)] transition-all overflow-hidden',
              { hidden: state.editor.previewMode }
            )}
          >
            <div className="grid gap-4 h-full pb-36 overflow-y-auto overflow-x-hidden">
              <TabsContent value="Settings" className="mt-0">
                <SheetHeader className="text-left p-6 border-b border-border/50">
                  <SheetTitle className="text-xl font-semibold">Styles</SheetTitle>
                  <SheetDescription className="text-sm text-muted-foreground">
                    Show your creativity! You can customize every component as you
                    like.
                  </SheetDescription>
                </SheetHeader>
                <SettingsTab />
              </TabsContent>
              <TabsContent value="Media" className="mt-0">
                <MediaBucketTab subaccountId={subaccountId} />
              </TabsContent>
              <TabsContent value="Components" className="mt-0">
                <SheetHeader className="text-left p-6 border-b border-border/50">
                  <SheetTitle className="text-xl font-semibold">Components</SheetTitle>
                  <SheetDescription className="text-sm text-muted-foreground">
                    You can drag and drop components on the canvas
                  </SheetDescription>
                </SheetHeader>
                <ComponentsTab />
              </TabsContent>
              <TabsContent value="Layers" className="mt-0">
                <LayersTab />
              </TabsContent>
            </div>
          </SheetContent>
        </Tabs>
      </Sheet>
    </div>
  )
}

export default FunnelEditorSidebar
