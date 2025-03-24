'use client'
import CreatePipelineForm from '@/components/forms/create-pipeline-form'
import CustomModal from '@/components/global/custom-modal'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useModal } from '@/providers/modal-provider'
import { Pipeline } from '@prisma/client'
import { ChevronsUpDown, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

type Props = {
    pipelineId: string
    subAccountId: string
    pipelines: Pipeline[]
}

function PipelineInfobar({pipelineId, subAccountId, pipelines}: Props) {
    const router = useRouter()
    const {setOpen: setOpenModal} = useModal()
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(pipelineId)

    const handleClickCreatePipeline = () => {
        setOpenModal(
            <CustomModal 
                title='Create A Pipeline' 
                subheading='Pipelines allows you to group tickets into lanes and track your business processes all in one place.'
            >
                <CreatePipelineForm subAccountId={subAccountId} />
            </CustomModal>
        )
    }

    const pipelinesList = Array.isArray(pipelines) ? pipelines : []
    const selectedPipeline = pipelinesList.find((pipeline) => pipeline.id === value)

    return (
        <div>
            <div className='flex gap-2 items-end'>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant='outline'
                            role='combobox'
                            aria-expanded={open}
                            className="w-[200px] justify-between"
                        >
                            {selectedPipeline?.name || 'Select a Pipeline...'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                        <div className="max-h-[300px] overflow-auto">
                            {pipelinesList.length > 0 ? (
                                <div className="py-1">
                                    {pipelinesList.map((pipeline) => (
                                        <div
                                            key={pipeline.id}
                                            className={cn(
                                                "relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-primary data-[selected=true]:text-accent-white data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
                                                {
                                                    "bg-primary text-accent-white": value === pipeline.id,
                                                    "text-gray-900 dark:text-gray-100": value !== pipeline.id
                                                }
                                            )}
                                            onClick={() => {
                                                setValue(pipeline.id)
                                                setOpen(false)
                                                router.push(`/subaccount/${subAccountId}/pipelines/${pipeline.id}`)
                                            }}
                                        >
                                            {pipeline.name}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-4 py-2 text-sm text-gray-500">
                                    No pipelines available
                                </div>
                            )}
                        </div>
                        <Button
                            variant="secondary"
                            className="flex gap-2 w-full mt-2"
                            onClick={handleClickCreatePipeline}
                        >
                            <Plus size={15} />
                            Create Pipeline
                        </Button>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}

export default PipelineInfobar