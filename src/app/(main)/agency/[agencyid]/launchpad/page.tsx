import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/lib/db'
import { CheckCircleIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

type Props = {
    params: {
        agencyid: string
    }
    searchParams: {
        code: string
    }
}

const LaunchpadPage = async ({params, searchParams}: Props) => {
    const { agencyid } = await params
    const agencyDetails = await db.agency.findUnique({
        where:{
            id: agencyid
        }
    })
    if(!agencyDetails) return 

    const allDetailsExist =
    agencyDetails.address &&
    agencyDetails.address &&
    agencyDetails.agencyLogo &&
    agencyDetails.city &&
    agencyDetails.companyEmail &&
    agencyDetails.companyPhone &&
    agencyDetails.country &&
    agencyDetails.name &&
    agencyDetails.state &&
    agencyDetails.zipCode

  return (
    <div className='flex flex-col justify-center items-center' >
        <div className='w-full h-full max-w-[800px]'>
            <Card className='border-none'>
                <CardHeader>
                    <CardTitle>Let's get started</CardTitle>
                    <CardDescription>
                        follow the steps below to get your account setup
                    </CardDescription>
                </CardHeader>
                
                <CardContent className='flex flex-col gap-4 '>
                    <div className='flex justify-between items-center w-full border 
                    p-4 rounded-lg gap-2'>
                        <div className='flex md:items-center gap-4 flex-col md:flex-row '>
                            <Image src="/appstore.png" alt='app logo'
                             width={80} height={80}
                             className='rounded-md object-contain'/>
                             <p> Save the Website as a shortcut on your mobile device</p>
                        </div>
                             <Button>Start</Button>
                    </div>

                    <div className='flex justify-between items-center w-full border 
                    p-4 rounded-lg gap-2'>
                        <div className='flex md:items-center gap-4 flex-col md:flex-row '>
                            <Image src="/stripelogo.png" alt='app logo'
                             width={80} height={80}
                             className='rounded-md object-contain'/>
                             <p> Connect your Stripe account to account payments and see your dashboard</p>
                        </div>
                             <Button>Start</Button>
                    </div>

                    <div className='flex justify-between items-center w-full border 
                    p-4 rounded-lg gap-2'>
                        <div className='flex md:items-center gap-4 flex-col md:flex-row '>
                            <Image src={agencyDetails.agencyLogo} alt='app logo'
                             width={80} height={80}
                             className='rounded-md object-contain'/>
                             <p> Fill in all your business details</p>
                        </div>
                        {allDetailsExist ? <CheckCircleIcon 
                        size={50}
                        className='text-primary p-2 flex-shrink-0'/> : <Link 
                        className='bg-primary p-2 px-4 rounded-md text-white'
                        href={`/agency/${params.agencyid}/settings`}>Start</Link>}
                             
                    </div>
                </CardContent>
            </Card>
        </div>
        </div>
  )
}

export default LaunchpadPage