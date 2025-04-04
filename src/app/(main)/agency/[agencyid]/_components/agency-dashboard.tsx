import { Building2, Contact2, Goal, Plus, Users } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import CreateSubaccountButton from '../all-subaccounts/_components/create-subaccount-btn'
import { Agency, AgencySidebarOption, SubAccount, User } from '@prisma/client'

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

export default function AgencyDashboard({ agencyDetails, user }: AgencyDashboardProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 relative">
            <Image 
              src={agencyDetails.agencyLogo || "/placeholder.svg?height=100&width=100"} 
              alt={agencyDetails.name} 
              fill 
              className="rounded-md object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{agencyDetails.name}</h1>
            <p className="text-sm text-muted-foreground">{agencyDetails.companyEmail}</p>
          </div>
        </div>
        <CreateSubaccountButton 
          user={user}
          id={agencyDetails.id}
          className="w-[200px] self-end m-6"
        />
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subaccounts</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agencyDetails.SubAccount.length}</div>
            <p className="text-xs text-muted-foreground">
              Total client subaccounts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agencyDetails.users.length}</div>
            <p className="text-xs text-muted-foreground">
              Active team members
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            <Contact2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agencyDetails.Subscription ? `₹${agencyDetails.Subscription.price}` : "Free"}
            </div>
            <p className="text-xs text-muted-foreground">
              {agencyDetails.Subscription?.active ? `Renews on ${formatDate(agencyDetails.Subscription.currentPeriodEndDate)}` : "No active subscription"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agency Goal</CardTitle>
            <Goal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agencyDetails.SubAccount.length}/{agencyDetails.goal} Clients</div>
            <Progress value={(agencyDetails.SubAccount.length / agencyDetails.goal) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subaccounts</CardTitle>
            <CardDescription>Manage your client subaccounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agencyDetails.SubAccount.length > 0 ? (
                agencyDetails.SubAccount.map((subaccount) => (
                  <div key={subaccount.id} className="flex items-center justify-between rounded-lg border p-4">
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
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Building2 className="h-10 w-10 text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">No subaccounts yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">Create your first client subaccount to get started</p>
                  <Button className="mt-4" asChild>
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

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Manage your agency team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agencyDetails.users.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Badge variant={user.role === "AGENCY_OWNER" ? "default" : "outline"}>
                    {user.role === "AGENCY_OWNER" ? "Owner" : "Admin"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 