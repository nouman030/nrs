import React from 'react'

const page = async (params: { params: { agencyid: string } }) => {
  const { agencyid } = await params.params;
  return (
    <div>
      <h1>Agency id: {agencyid}</h1>
    </div>
  )
}

export default page
