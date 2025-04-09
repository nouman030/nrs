'use client'

import { memo, useCallback, useEffect, FocusEventHandler } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { seveActivityLogsNotification, upsertFunnelPage } from '@/lib/queries'
import { DeviceTypes, useEditor } from '@/providers/editor/editor-provider'
import { FunnelPage } from '@prisma/client'
import clsx from 'clsx'
import {
    ArrowLeftCircle,
    EyeIcon,
    Laptop,
    Redo2,
    Smartphone,
    Tablet,
    Undo2,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'  // Make sure this import exists

type Props = {
    funnelId: string
    funnelPageDetails: FunnelPage
    subaccountId: string
}

const FunnelEditorNavigation = memo(({ funnelId, funnelPageDetails, subaccountId }: Props) => {
    const router = useRouter()
    const { state, dispatch } = useEditor()

    useEffect(() => {
        dispatch({
            type: 'SET_FUNNELPAGE_ID',
            payload: { funnelPageId: funnelPageDetails.id },
        })
    }, [dispatch, funnelPageDetails])

    const handleOnBlurTitleChange: FocusEventHandler<HTMLInputElement> = useCallback(async (
        event
    ) => {
        const newTitle = event.target.value
        if (newTitle === funnelPageDetails.name) return

        if (newTitle) {
            try {
                await upsertFunnelPage(
                    subaccountId,
                    {
                        id: funnelPageDetails.id,
                        name: newTitle,
                        order: funnelPageDetails.order,
                    },
                    funnelId
                )
                toast('Success', { description: 'Saved Funnel Page title' })
                router.refresh()
            } catch (error) {
                toast('Error', { description: 'Failed to update title' })
                event.target.value = funnelPageDetails.name
            }
        } else {
            toast('Error', { description: 'Title cannot be empty' })
            event.target.value = funnelPageDetails.name
        }
    }, [funnelPageDetails, funnelId, subaccountId, router])

    const handlePreviewClick = useCallback(() => {
        dispatch({ type: 'TOGGLE_PREVIEW_MODE' })
        dispatch({ type: 'TOGGLE_LIVE_MODE' })
    }, [dispatch])

    const handleUndo = useCallback(() => {
        dispatch({ type: 'UNDO' })
    }, [dispatch])

    const handleRedo = useCallback(() => {
        dispatch({ type: 'REDO' })
    }, [dispatch])

    const handleOnSave = useCallback(async () => {
        const content = JSON.stringify(state.editor.elements)
        try {
            const response = await upsertFunnelPage(
                subaccountId,
                {
                    ...funnelPageDetails,
                    content,
                },
                funnelId
            )
            await seveActivityLogsNotification({
                agencyId: undefined,
                description: `Updated a funnel page | ${response?.name}`,
                subaccountId: subaccountId,
            })
            toast.success('Changes saved successfully', {
                description: 'Your funnel page has been updated',
                duration: 3000,
            })
        } catch (error) {
            toast.error('Could not save changes', {
                description: 'Please try again or contact support if the issue persists',
                duration: 5000,
            })
        }
    }, [state.editor.elements, funnelPageDetails, funnelId, subaccountId])

    const handleDeviceChange = useCallback((value: string) => {
        dispatch({
            type: 'CHANGE_DEVICE',
            payload: { device: value as DeviceTypes },
        })
    }, [dispatch])

    const DeviceButton = memo(({ value, icon: Icon }: { value: string, icon: any }) => (
        <Tooltip>
            <TooltipTrigger>
                <TabsTrigger
                    value={value}
                    className={`w-10 h-10 p-0 ${value === 'Desktop' ? 'data-[state=active]:bg-muted' : 'data-[state=active]:bg-muted'}`}
                >
                    <Icon />
                </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent>
                <p>{value}</p>
            </TooltipContent>
        </Tooltip>
    ))

    return (
        <TooltipProvider>
            <nav className={clsx(
                'border-b border-border/50 flex items-center justify-between p-6 gap-2 transition-all bg-background/95 backdrop-blur-sm shadow-sm',
                { '!h-0 !p-0 !overflow-hidden': state.editor.previewMode }
            )}>
                <aside className="flex items-center gap-4 max-w-[260px] w-[300px]">
                    <Link href={`/subaccount/${subaccountId}/funnels/${funnelId}`} className="hover:opacity-80 transition-opacity">
                        <ArrowLeftCircle className="w-6 h-6 text-muted-foreground" />
                    </Link>
                    <div className="flex flex-col w-full">
                        <Input
                            defaultValue={funnelPageDetails.name}
                            className="border-none h-6 m-0 p-0 text-lg font-medium focus-visible:ring-0 focus-visible:ring-offset-0"
                            onBlur={handleOnBlurTitleChange}
                        />
                        <span className="text-sm text-muted-foreground">
                            Path: /{funnelPageDetails.pathName}
                        </span>
                    </div>
                </aside>

                <aside>
                    <Tabs
                        defaultValue="Desktop"
                        className="w-fit"
                        value={state.editor.device}
                        onValueChange={handleDeviceChange}
                    >
                        <TabsList className="grid w-full grid-cols-3 bg-background/95 backdrop-blur-sm border border-border/50 h-fit rounded-lg p-1">
                            <DeviceButton value="Desktop" icon={Laptop} />
                            <DeviceButton value="Tablet" icon={Tablet} />
                            <DeviceButton value="Mobile" icon={Smartphone} />
                        </TabsList>
                    </Tabs>
                </aside>

                <aside className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-slate-800"
                        onClick={handlePreviewClick}
                    >
                        <EyeIcon />
                    </Button>
                    <Button
                        disabled={!(state.history.currentIndex > 0)}
                        onClick={handleUndo}
                        variant="ghost"
                        size="icon"
                        className="hover:bg-slate-800"
                    >
                        <Undo2 />
                    </Button>
                    <Button
                        disabled={!(state.history.currentIndex < state.history.history.length - 1)}
                        onClick={handleRedo}
                        variant="ghost"
                        size="icon"
                        className="hover:bg-slate-800 mr-4"
                    >
                        <Redo2 />
                    </Button>
                    <div className="flex flex-col item-center mr-4">
                        <div className="flex flex-row items-center gap-4">
                            Draft
                            <Switch disabled defaultChecked={true} />
                            Publish
                        </div>
                        <span className="text-muted-foreground text-sm">
                            Last updated {funnelPageDetails.updatedAt.toLocaleDateString()}
                        </span>
                    </div>
                    <Button onClick={handleOnSave}>Save</Button>
                </aside>
            </nav>
        </TooltipProvider>
    )
})

FunnelEditorNavigation.displayName = 'FunnelEditorNavigation'

export default FunnelEditorNavigation
