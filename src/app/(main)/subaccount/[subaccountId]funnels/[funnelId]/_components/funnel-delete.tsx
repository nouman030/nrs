'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { deleteFunnel, seveActivityLogsNotification } from '@/lib/queries'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface FunnelDeleteProps {
  funnelId: string
  subaccountId: string
}

const FunnelDelete: React.FC<FunnelDeleteProps> = ({ funnelId, subaccountId }) => {
  const router = useRouter()

  const handleDelete = async () => {
    try {
      await deleteFunnel(funnelId)
      
      await seveActivityLogsNotification({
        agencyId: undefined,
        description: `Deleted funnel | ID: ${funnelId}`,
        subaccountId: subaccountId,
      })

      toast.success('Funnel deleted successfully')
      router.push(`/subaccount/${subaccountId}/funnels`)
    } catch (error) {
      toast.error('Failed to delete funnel')
    }
  }

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Delete Funnel</CardTitle>
        <CardDescription>
          This action cannot be undone. This will permanently delete your funnel and all its pages.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Deleting this funnel will remove all associated pages and data. This action cannot be reversed.
          </AlertDescription>
        </Alert>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              Delete Funnel
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your funnel
                and remove all associated pages and data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}

export default FunnelDelete