'use client'
import React from 'react'
import { z } from 'zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Button } from '../ui/button'
import Loading from '../global/loading'
import { seveActivityLogsNotification, sendInvitation } from '@/lib/queries'
import { useToast } from '@/hooks/use-toast'
import { Lock } from 'lucide-react'
import Link from 'next/link'

interface SendInvitationProps {
  agencyId: string
  teamMembersCount: number
  subscriptionPrice: number
}

const SendInvitation: React.FC<SendInvitationProps> = ({ 
  agencyId, 
  teamMembersCount,
  subscriptionPrice 
}) => {
  const { toast } = useToast()
  const userDataSchema = z.object({
    email: z.string().email(),
    role: z.enum(['AGENCY_ADMIN', 'SUBACCOUNT_USER', 'SUBACCOUNT_GUEST']),
  })

  const form = useForm<z.infer<typeof userDataSchema>>({
    resolver: zodResolver(userDataSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      role: 'SUBACCOUNT_USER',
    },
  })

  const onSubmit = async (values: z.infer<typeof userDataSchema>) => {
    try {
      const res = await sendInvitation(values.role, values.email, agencyId)
      await seveActivityLogsNotification({
        agencyId: agencyId,
        description: `Invited ${res.email}`,
        subaccountId: undefined,
      })
      toast({
        title: 'Success',
        description: 'Created and sent invitation',
      })
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Oppse!',
        description: 'Invitation already sent to this email , but now it is updated Role',
      })
    }
  }

  const isUpgradeRequired = teamMembersCount >= 5 && subscriptionPrice < 50 || subscriptionPrice === 0

  if (isUpgradeRequired) {
    return (
      <Card className="border-2 border-destructive/20">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <Lock className="h-5 w-5" />
            <CardTitle>Team Member Limit Reached</CardTitle>
          </div>
          <CardDescription className="text-destructive/80">
            Your current plan allows up to 5 team members. To add more team members, please upgrade your agency plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              Current team members: {teamMembersCount}/5
            </p>
            <p className="text-sm text-destructive mt-1">
              Current plan: ₹{subscriptionPrice}/month
            </p>
          </div>
          <Button asChild className="w-full bg-destructive hover:bg-destructive/90">
            <Link href={`/agency/${agencyId}/billing`}>
              Upgrade Now
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invitation</CardTitle>
        <CardDescription>
          An invitation will be sent to the user. Users who already have an
          invitation sent out to their email, will not receive another
          invitation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>User role</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user role..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AGENCY_ADMIN">Agency Admin</SelectItem>
                      <SelectItem value="SUBACCOUNT_USER">
                        Sub Account User
                      </SelectItem>
                      <SelectItem value="SUBACCOUNT_GUEST">
                        Sub Account Guest
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={form.formState.isSubmitting}
              type="submit"
            >
              {form.formState.isSubmitting ? <Loading /> : 'Send Invitation'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default SendInvitation
