import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
    params : {
        subaccountId: string
    }
}

const Pipelines = async ({params}: Props) => {

    const pr= await params

     const piplineExists = await db.pipeline.findFirst({
        where:{
            subAccountId: pr.subaccountId
        },
    })

    if(piplineExists){
        return redirect(`/subaccount/${pr.subaccountId}/pipelines/${piplineExists.id}`) 
    }

    try{
        const pipeline = await db.pipeline.create({
            data:{
                name: 'First Pipeline',
                subAccountId: pr.subaccountId
            }
        })
        return redirect(`/subaccount/${pr.subaccountId}/pipelines/${pipeline.id}`)
    }
    catch(e){
        console.log(e)
    }


}

export default Pipelines