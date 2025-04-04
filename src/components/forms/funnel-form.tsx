'use client'
import React, { useEffect } from 'react'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { Funnel, Subscription } from '@prisma/client'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import Loading from '../global/loading'
import { CreateFunnelFormSchema } from '@/lib/types'
import { seveActivityLogsNotification, upsertFunnel } from '@/lib/queries'
import { v4 } from 'uuid'
import { toast } from '@/hooks/use-toast'
import { useModal } from '@/providers/modal-provider'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import FileUpload from '../global/file-upload'
import { Lock } from 'lucide-react'
import Link from 'next/link'

interface CreateFunnelProps {
  defaultData?: Funnel
  subAccountId: string
  subscriptionPrice: number
  currentFunnelsCount: number
  agencyId: string
}

//CHALLENGE: Use favicons

const FunnelForm: React.FC<CreateFunnelProps> = ({
  defaultData,
  subAccountId,
  subscriptionPrice,
  currentFunnelsCount,
  agencyId
}) => {
  const { setClose } = useModal()
  const router = useRouter()
  const form = useForm<z.infer<typeof CreateFunnelFormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(CreateFunnelFormSchema),
    defaultValues: {
      name: defaultData?.name || '',
      description: defaultData?.description || '',
      favicon: defaultData?.favicon || '',
      subDomainName: defaultData?.subDomainName || '',
    },
  })

  useEffect(() => {
    if (defaultData) {
      form.reset({
        description: defaultData.description || '',
        favicon: defaultData.favicon || '',
        name: defaultData.name || '',
        subDomainName: defaultData.subDomainName || '',
      })
    }
  }, [defaultData])

  const isLoading = form.formState.isLoading

  // Determine limits based on subscription price
  const getFunnelLimit = () => {
    if (subscriptionPrice >= 50) return Infinity
    if (subscriptionPrice > 0 && subscriptionPrice < 50) return 5
    return 1 // No subscription
  }

  const funnelLimit = getFunnelLimit()
  const isUpgradeRequired = currentFunnelsCount >= funnelLimit

  if (isUpgradeRequired) {
    return (
      <Card className="w-full border-2 border-destructive/20">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <Lock className="h-5 w-5" />
            <CardTitle>Funnel Limit Reached</CardTitle>
          </div>
          <CardDescription className="text-destructive/80">
            {subscriptionPrice >= 50 
              ? "You've reached the maximum number of funnels allowed."
              : subscriptionPrice > 0 && subscriptionPrice < 50
              ? "Your current plan allows up to 5 funnels. To add more, please upgrade your agency plan."
              : "Your free plan allows up to 1 funnel. To add more, please upgrade your agency plan."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              Current funnels: {currentFunnelsCount}/{funnelLimit === Infinity ? '∞' : funnelLimit}
            </p>
            <p className="text-sm text-destructive mt-1">
              Current plan: {subscriptionPrice === 0 ? 'Free' : `₹${subscriptionPrice}/month`}
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

  const onSubmit = async (values: z.infer<typeof CreateFunnelFormSchema>) => {
    if (!subAccountId) return
    const response = await upsertFunnel(
      subAccountId,
      { ...values, liveProducts: defaultData?.liveProducts || '[]' },
      defaultData?.id || v4()
    )
    await seveActivityLogsNotification({
      agencyId: undefined,
      description: `Update funnel | ${response.name}`,
      subaccountId: subAccountId,
    })
    if (response)
      toast({
        title: 'Success',
        description: 'Saved funnel details',
      })
    else
      toast({
        variant: 'destructive',
        title: 'Oppse!',
        description: 'Could not save funnel details',
      })
    setClose()
    router.refresh()
  }

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Funnel Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              disabled={isLoading}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Funnel Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Name"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Funnel Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little bit more about this funnel."
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="subDomainName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub domain</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Sub domain for funnel"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="favicon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Favicon</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="subaccountLogo"
                      value={field.value}
                      onchange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="w-20 mt-4"
              disabled={isLoading}
              type="submit"
            >
              {form.formState.isSubmitting ? <Loading /> : 'Save'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default FunnelForm
