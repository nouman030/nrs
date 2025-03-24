"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Loader2, RefreshCw, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Invitation {
  id: string
  email: string
  role: string
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED"
  createdAt: string
  expiresAt: string | null
}

interface InvitationsListProps {
  agencyId: string
}

const InvitationsList: React.FC<InvitationsListProps> = ({ agencyId }) => {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [revoking, setRevoking] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchInvitations = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/invitations?agencyId=${agencyId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch invitations")
      }

      const data = await response.json()
      setInvitations(data.invitations)
    } catch (error) {
      console.error("Error fetching invitations:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load invitations",
      })
    } finally {
      setLoading(false)
    }
  }, [agencyId, toast])

  useEffect(() => {
    fetchInvitations()
  }, [fetchInvitations])

  const handleRevokeInvitation = async (id: string) => {
    try {
      setRevoking(id)
      const response = await fetch(`/api/invitations?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to revoke invitation")
      }

      // Update the local state
      setInvitations(invitations.map((inv) => (inv.id === id ? { ...inv, status: "REVOKED" } : inv)))

      toast({
        title: "Success",
        description: "Invitation has been revoked",
      })
    } catch (error) {
      console.error("Error revoking invitation:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to revoke invitation",
      })
    } finally {
      setRevoking(null)
    }
  }

  const formatRole = (role: string) => {
    switch (role) {
      case "AGENCY_OWNER":
        return "Agency Owner"
      case "AGENCY_ADMIN":
        return "Agency Admin"
      case "SUBACCOUNT_USER":
        return "Subaccount User"
      case "SUBACCOUNT_GUEST":
        return "Subaccount Guest"
      default:
        return role
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "ACCEPTED":
        return "bg-green-100 text-green-800 border-green-200"
      case "EXPIRED":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "REVOKED":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>Manage your agency invitations</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={fetchInvitations} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No pending invitations found</div>
        ) : (
          <div className="space-y-4">
            {invitations
              .filter((inv) => inv.status === "PENDING")
              .map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{invitation.email}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatRole(invitation.role)} • Invited on {formatDate(invitation.createdAt)}
                    </div>
                    {invitation.expiresAt && (
                      <div className="text-xs text-muted-foreground">Expires on {formatDate(invitation.expiresAt)}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(invitation.status)}>{invitation.status}</Badge>
                    {invitation.status === "PENDING" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRevokeInvitation(invitation.id)}
                        disabled={revoking === invitation.id}
                      >
                        {revoking === invitation.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default InvitationsList

