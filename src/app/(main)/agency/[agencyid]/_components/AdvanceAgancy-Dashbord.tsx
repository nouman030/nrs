import { Building2, Contact2, Goal, Plus, Users } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Agency, AgencySidebarOption, SubAccount, User } from '@prisma/client'
import CreateSubaccountButton from '../all-subaccounts/_components/create-subaccount-btn'

interface AgencyDashboardProps {
  agencyDetails: {
    id: string
    name: string
    agencyLogo: string | null
    companyEmail: string
    SubAccount: SubAccount[]
    users: User[]
    Subscription: any
    goal: number
  }
  user: User & {
    Agency: (Agency & {
      SubAccount: SubAccount[]
      SideBarOption?: AgencySidebarOption[]
    }) | null
  }
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export default function ProAgencyDashboard({ agencyDetails, user }: AgencyDashboardProps) {
  // Calculate goal percentage
  const goalPercentage = (agencyDetails.SubAccount.length / agencyDetails.goal) * 100;
  
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-card rounded-xl p-6 border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 relative rounded-lg overflow-hidden border shadow-sm">
            <Image 
              src={agencyDetails.agencyLogo || "/placeholder.svg?height=100&width=100"} 
              alt={agencyDetails.name} 
              fill 
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{agencyDetails.name}</h1>
            <p className="text-sm text-muted-foreground">{agencyDetails.companyEmail}</p>
          </div>
        </div>
        <CreateSubaccountButton
          user={user}
          id={agencyDetails.id}
          className="w-full md:w-auto"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Subaccounts</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{agencyDetails.SubAccount.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total client subaccounts
            </p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{agencyDetails.users.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active team members
            </p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-l-4 border-l-violet-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            <Contact2 className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {agencyDetails.Subscription ? `₹${agencyDetails.Subscription.price}` : "Free"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {agencyDetails.Subscription?.active 
                ? `Renews on ${formatDate(agencyDetails.Subscription.currentPeriodEndDate)}` 
                : "No active subscription"}
            </p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Agency Goal</CardTitle>
            <Goal className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{agencyDetails.SubAccount.length}/{agencyDetails.goal}</div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={goalPercentage} className="h-2" />
              <span className="text-xs font-medium">{Math.round(goalPercentage)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subaccounts" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 mb-6">
          <TabsTrigger value="subaccounts">Subaccounts</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
        </TabsList>
        
        <TabsContent value="subaccounts" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Client Subaccounts</CardTitle>
                  <CardDescription>Manage your client subaccounts and their dashboards</CardDescription>
                </div>
                {agencyDetails.SubAccount.length > 0 && (
                  <Button asChild size="sm">
                    <Link href={`/agency/${agencyDetails.id}/subaccount-create`}>
                      <Plus className="mr-2 h-4 w-4" />
                      New Subaccount
                    </Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agencyDetails.SubAccount.length > 0 ? (
                  <div className="grid gap-4">
                    {agencyDetails.SubAccount.map((subaccount) => (
                      <div key={subaccount.id} className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                        <div className="flex items-center space-x-4">
                          <div className="rounded-md bg-primary/10 p-2">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{subaccount.name}</p>
                            <p className="text-sm text-muted-foreground">Created on {formatDate(subaccount.createdAt)}</p>
                          </div>
                        </div>
                        <Link href={`/subaccount/${subaccount.id}`}>
                          <Button variant="outline" size="sm">
                            View Dashboard
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="rounded-full bg-muted p-3 mb-3">
                      <Building2 className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No subaccounts yet</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                      Create your first client subaccount to get started with managing client projects
                    </p>
                    <Button className="mt-6" asChild>
                      <Link href={`/agency/${agencyDetails.id}/subaccount-create`}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Subaccount
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage your agency team and permissions</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/agency/${agencyDetails.id}/team-invite`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Invite Member
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agencyDetails.users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.name}</p>
                          <Badge variant={user.role === "AGENCY_OWNER" ? "default" : "outline"} className="text-xs">
                            {user.role === "AGENCY_OWNER" ? "Owner" : "Admin"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Manage
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
