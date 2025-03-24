import BlurPage from '@/components/global/blur-page'
import MediaComponent from '@/components/media'
import { getMedia } from '@/lib/queries'
import React from 'react'

type Props = {
    params : {subaccountId: string}
}

const MediaPage = async ({params}: Props) => {
    const pr = await params;
    const data = await getMedia(pr.subaccountId)
  return (
    <BlurPage>
        <MediaComponent data={data}  subaccountId={pr.subaccountId}/>
    </BlurPage>
  )
}

export default MediaPage