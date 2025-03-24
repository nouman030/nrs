import { Contact2, FileText, FolderKanban, Layers, Plus, Ticket } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { db } from "@/lib/db"
import BlurPage from "@/components/global/blur-page"

type SubaccountProps = {
  params: { subaccountId: string }
}

export default async function SubaccountDashboard({ params }: SubaccountProps) {
  // Fetch subaccount data from database using Prisma
  const subaccountDetails = await db.subAccount.findUnique({
    where: {
      id: params.subaccountId,
    },
    include: {
      Funnels: {
        include: {
          FunnelPages: true,
        },
      },
      Contact: true,
      Pipeline: {
        include: {
          Lane: {
            include: {
              Tickets: {
                include: {
                  Tags: true,
                },
              },
            },
          },
        },
      },
      Media: true,
    },
  })

  if (!subaccountDetails) {
    return <div className="p-6">Subaccount not found</div>
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Calculate total funnel visits
  const totalFunnelVisits = subaccountDetails.Funnels.reduce((total, funnel) => {
    return total + funnel.FunnelPages.reduce((pageTotal, page) => pageTotal + page.visits, 0)
  }, 0)

  // Calculate total pipeline value
  const totalPipelineValue = subaccountDetails.Pipeline.reduce((total, pipeline) => {
    return (
      total +
      pipeline.Lane.reduce((laneTotal, lane) => {
        return (
          laneTotal +
          lane.Tickets.reduce((ticketTotal, ticket) => {
            return ticketTotal + (ticket.value ? Number(ticket.value) : 0)
          }, 0)
        )
      }, 0)
    )
  }, 0)

  // Count total tickets
  const totalTickets = subaccountDetails.Pipeline.reduce((total, pipeline) => {
    return (
      total +
      pipeline.Lane.reduce((laneTotal, lane) => {
        return laneTotal + lane.Tickets.length
      }, 0)
    )
  }, 0)

  return (
    <BlurPage>
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 relative">
            <Image
              src={subaccountDetails.subAccountLogo || "/placeholder.svg?height=100&width=100"}
              alt={subaccountDetails.name}
              fill
              className="rounded-md object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{subaccountDetails.name}</h1>
            <p className="text-sm text-muted-foreground">{subaccountDetails.companyEmail}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/subaccount/${subaccountDetails.id}/settings`}>Settings</Link>
          </Button>
          
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funnels</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subaccountDetails.Funnels.length}</div>
            <p className="text-xs text-muted-foreground">
              {subaccountDetails.Funnels.filter((f) => f.published).length} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacts</CardTitle>
            <Contact2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subaccountDetails.Contact.length}</div>
            <p className="text-xs text-muted-foreground">Total contacts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalPipelineValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across {totalTickets} tickets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funnel Visits</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFunnelVisits}</div>
            <p className="text-xs text-muted-foreground">Total page visits</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Funnels</CardTitle>
            <CardDescription>Your marketing and sales funnels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subaccountDetails.Funnels.length > 0 ? (
                subaccountDetails.Funnels.map((funnel) => (
                  <div key={funnel.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center space-x-4">
                      <div className="rounded-md bg-primary/10 p-2">
                        <Layers className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{funnel.name}</p>
                        <p className="text-sm text-muted-foreground">{funnel.description || "No description"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={funnel.published ? "default" : "outline"}>
                        {funnel.published ? "Published" : "Draft"}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/subaccount/${subaccountDetails.id}/funnels/${funnel.id}`}>Edit</Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Layers className="h-10 w-10 text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">No funnels yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create your first funnel to start collecting leads
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href={`/subaccount/${subaccountDetails.id}/funnels/create`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Funnel
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contacts</CardTitle>
            <CardDescription>Your customer contacts</CardDescription>
          </CardHeader>
          <CardContent>
            {subaccountDetails.Contact.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Added</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subaccountDetails.Contact.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">{contact.name}</TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>{formatDate(contact.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Contact2 className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No contacts yet</h3>
                <p className="text-sm text-muted-foreground mt-1">Add your first contact to get started</p>
                <Button className="mt-4" asChild>
                  <Link href={`/subaccount/${subaccountDetails.id}/contacts/create`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Contact
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline Overview</CardTitle>
          <CardDescription>Your sales pipeline and tickets</CardDescription>
        </CardHeader>
        <CardContent>
          {subaccountDetails.Pipeline.length > 0 ? (
            <div className="space-y-6">
              {subaccountDetails.Pipeline.map((pipeline) => (
                <div key={pipeline.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{pipeline.name}</h3>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/subaccount/${subaccountDetails.id}/pipelines/${pipeline.id}`}>View Pipeline</Link>
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pipeline.Lane.map((lane) => (
                      <Card key={lane.id} className="overflow-hidden">
                        <CardHeader className="bg-muted/50 p-3">
                          <CardTitle className="text-sm">{lane.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3">
                          {lane.Tickets.length > 0 ? (
                            <div className="space-y-2">
                              {lane.Tickets.map((ticket) => (
                                <div key={ticket.id} className="rounded-md border p-2">
                                  <div className="flex justify-between items-center">
                                    <p className="font-medium text-sm">{ticket.name}</p>
                                    {ticket.value && (
                                      <Badge className="bg-green-500">₹{Number(ticket.value).toLocaleString()}</Badge>
                                    )}
                                  </div>
                                  <div className="flex gap-1 mt-1">
                                    {ticket.Tags.map((tag) => (
                                      <Badge
                                        key={tag.id}
                                        variant="outline"
                                        style={{ backgroundColor: `${tag.color}20`, borderColor: tag.color }}
                                      >
                                        {tag.name}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-2">No tickets</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <FolderKanban className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No pipelines yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Create your first pipeline to track sales</p>
              <Button className="mt-4" asChild>
                <Link href={`/subaccount/${subaccountDetails.id}/pipelines/create`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Pipeline
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </BlurPage>
  )
}
