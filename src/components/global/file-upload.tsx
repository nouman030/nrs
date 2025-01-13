import { FileIcon, X } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import { Button } from '../ui/button'
import { UploadDropzone } from '@/lib/uploadthing'

type Props = {
    apiEndpoint : 'agencyLogo' | 'avatar' | "subaccountLogo"
    onchange: (url?:string) => void
    value? : string
}

const FileUpload = ( {apiEndpoint , onchange , value}: Props) => {
    const type = value?.split('.').pop();
    if(value){
        return <div className=' flex flex-col justify-center items-center'>
            {type !== 'pdf' ? <div className='relative w-40 h-40'>
                <Image src={value} alt="upload image"
                className='object-cover' 
                width={120} height={120}
                />
                 </div>:(
                    <div className='relative flex items-center p-2 mt-2 rounded-md
                    bg-background/10'>
                        <FileIcon />
                        <a href={value}
                        target='_blank'
                        rel ="noopener_noreferrer"
                        className='ml-2 text-sm text-indigo-500 dark:text-indigo-400'>
                            View PDF
                        </a>
                    </div>
                 ) }
                <Button
                onClick={()=> onchange('')}
                variant="ghost"
                type='button'><X className='h-4 w-4' />Remove Logo</Button>
        </div>
    }
  return (
    <div className='w-full bg-muted/30 '>
        <UploadDropzone endpoint={apiEndpoint}
        onClientUploadComplete={(res) => {
            onchange(res[0].url)
        }}
        onUploadProgress={(p) => console.log(p)}
        />
    </div>
  )
}

export default FileUpload