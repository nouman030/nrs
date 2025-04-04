import { Contact2, FileText, FolderKanban, Layers, Plus, BarChart3, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Contact, Funnel, Lane, Pipeline, SubAccount, Tag, Ticket as TicketType } from "@prisma/client"

interface SubaccountDashboardProps {
  subaccountDetails: SubAccount & {
    Funnels: (Funnel & {
      FunnelPages: { visits: number }[]
    })[]
    Contact: Contact[]
    Pipeline: (Pipeline & {
      Lane: (Lane & {
        Tickets: (TicketType & {
          Tags: Tag[]
        })[]
      })[]
    })[]
    Media: any[]
  }
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function ProSubaccountDashboard({ subaccountDetails }: SubaccountDashboardProps) {
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
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-card rounded-xl p-6 border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 relative rounded-lg overflow-hidden border shadow-sm">
            <Image
              src={subaccountDetails.subAccountLogo || "/placeholder.svg?height=100&width=100"}
              alt={subaccountDetails.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{subaccountDetails.name}</h1>
            <p className="text-sm text-muted-foreground">{subaccountDetails.companyEmail}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/subaccount/${subaccountDetails.id}/settings`}>Settings</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Funnels</CardTitle>
            <Layers className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{subaccountDetails.Funnels.length}</div>
            <div className="flex items-center mt-1">
              <p className="text-xs text-muted-foreground">
                {subaccountDetails.Funnels.filter((f) => f.published).length} published
              </p>
              {subaccountDetails.Funnels.length > 0 && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {Math.round(
                    (subaccountDetails.Funnels.filter((f) => f.published).length / subaccountDetails.Funnels.length) *
                      100,
                  )}
                  % live
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Contacts</CardTitle>
            <Contact2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{subaccountDetails.Contact.length}</div>
            <div className="flex items-center gap-1 mt-1">
              <p className="text-xs text-muted-foreground">Total contacts</p>
              {subaccountDetails.Contact.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{totalPipelineValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {totalTickets} {totalTickets === 1 ? "ticket" : "tickets"}
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Funnel Visits</CardTitle>
            <FileText className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalFunnelVisits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total page visits</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="funnels" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3 mb-6">
          <TabsTrigger value="funnels">Funnels</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
        </TabsList>

        <TabsContent value="funnels" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Marketing Funnels</CardTitle>
                  <CardDescription>Your marketing and sales funnels</CardDescription>
                </div>
                {subaccountDetails.Funnels.length > 0 && (
                  <Button asChild size="sm">
                    <Link href={`/subaccount/${subaccountDetails.id}/funnels/create`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Funnel
                    </Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subaccountDetails.Funnels.length > 0 ? (
                  <div className="grid gap-4">
                    {subaccountDetails.Funnels.map((funnel) => (
                      <div
                        key={funnel.id}
                        className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                      >
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
                          <Badge variant={funnel.published ? "default" : "outline"} className="capitalize">
                            {funnel.published ? "Published" : "Draft"}
                          </Badge>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/subaccount/${subaccountDetails.id}/funnels/${funnel.id}`}>Edit</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="rounded-full bg-muted p-3 mb-3">
                      <Layers className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No funnels yet</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                      Create your first funnel to start collecting leads and driving conversions
                    </p>
                    <Button className="mt-6" asChild>
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
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Customer Contacts</CardTitle>
                  <CardDescription>Your customer contact database</CardDescription>
                </div>
                {subaccountDetails.Contact.length > 0 && (
                  <Button asChild size="sm">
                    <Link href={`/subaccount/${subaccountDetails.id}/contacts/create`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Contact
                    </Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {subaccountDetails.Contact.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Added</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subaccountDetails.Contact.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell className="font-medium">{contact.name}</TableCell>
                          <TableCell>{contact.email}</TableCell>
                          <TableCell>{formatDate(contact.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/subaccount/${subaccountDetails.id}/contacts/${contact.id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="rounded-full bg-muted p-3 mb-3">
                    <Contact2 className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No contacts yet</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md">
                    Add your first contact to start building your customer database
                  </p>
                  <Button className="mt-6" asChild>
                    <Link href={`/subaccount/${subaccountDetails.id}/contacts/create`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Contact
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipelines" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pipeline Overview</CardTitle>
                  <CardDescription>Your sales pipeline and tickets</CardDescription>
                </div>
                {subaccountDetails.Pipeline.length > 0 && (
                  <Button asChild size="sm">
                    <Link href={`/subaccount/${subaccountDetails.id}/pipelines/create`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Pipeline
                    </Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {subaccountDetails.Pipeline.length > 0 ? (
                <div className="space-y-8">
                  {subaccountDetails.Pipeline.map((pipeline) => (
                    <div key={pipeline.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FolderKanban className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold text-lg">{pipeline.name}</h3>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/subaccount/${subaccountDetails.id}/pipelines/${pipeline.id}`}>
                            View Pipeline
                          </Link>
                        </Button>
                      </div>

                      <ScrollArea className="w-full whitespace-nowrap pb-3">
                        <div className="flex gap-4 pb-2">
                          {pipeline.Lane.map((lane) => (
                            <Card key={lane.id} className="min-w-[300px] max-w-[300px]">
                              <CardHeader className="bg-muted/50 p-3">
                                <CardTitle className="text-sm flex items-center justify-between">
                                  {lane.name}
                                  <Badge variant="outline" className="ml-2">
                                    {lane.Tickets.length}
                                  </Badge>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="p-3 max-h-[300px] overflow-auto">
                                {lane.Tickets.length > 0 ? (
                                  <div className="space-y-2">
                                    {lane.Tickets.map((ticket) => (
                                      <div key={ticket.id} className="rounded-md border p-3 bg-card">
                                        <div className="flex justify-between items-center">
                                          <p className="font-medium text-sm">{ticket.name}</p>
                                          {ticket.value && (
                                            <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">
                                              ₹{Number(ticket.value).toLocaleString()}
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {ticket.Tags.map((tag) => (
                                            <Badge
                                              key={tag.id}
                                              variant="outline"
                                              className="text-xs"
                                              style={{
                                                backgroundColor: `${tag.color}20`,
                                                borderColor: tag.color,
                                                color: tag.color,
                                              }}
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
                      </ScrollArea>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="rounded-full bg-muted p-3 mb-3">
                    <FolderKanban className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No pipelines yet</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md">
                    Create your first pipeline to track sales and manage your deals
                  </p>
                  <Button className="mt-6" asChild>
                    <Link href={`/subaccount/${subaccountDetails.id}/pipelines/create`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Pipeline
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

