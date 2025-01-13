'use client'
import { useModal } from '@/providers/modal-provider'
import React from 'react'
import { Dialog, DialogContent, DialogHeader } from '../ui/dialog'
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog'

type Props = {
    title : string
    subheading : string
    children: React.ReactNode
    defaultOpen?: boolean
}

const CustomModal = ({title , subheading ,children,defaultOpen}: Props) => {
  const {isOpen , setClose} = useModal() 
    return (
    <Dialog open={isOpen || defaultOpen}
    onOpenChange={setClose} >
        <DialogContent className='p-4 overflow-auto md:max-h-[90%] 
        md:h-fit max-h-[90%] h-fit w-full bg-card'> 
            <DialogHeader className='pt-8 text-left'>
                <DialogTitle className='text-2xl font-bold'>
                    {title}
                </DialogTitle>
                <DialogDescription>{subheading}</DialogDescription>
                {children}
            </DialogHeader>
        </DialogContent>
    </Dialog> 
  )
}

export default CustomModal