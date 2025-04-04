"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { v4 } from "uuid"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useRouter } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

import FileUpload from "../global/file-upload"
import { useToast } from "@/hooks/use-toast"
import { seveActivityLogsNotification, upsertSubAccount } from "@/lib/queries"

import Loading from "../global/loading"
import { useModal } from "@/providers/modal-provider"
import type { SubAccount } from "@prisma/client"
import { useEffect } from "react"
import { Lock } from "lucide-react"
import Link from "next/link"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  companyEmail: z.string().email({ message: "Invalid email address." }),
  companyPhone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  subAccountLogo: z.string().url({ message: "Invalid logo URL." }),
  zipCode: z.string().min(5, { message: "Zip code must be at least 5 characters." }),
  state: z.string().min(2, { message: "State must be at least 2 characters." }),
  country: z.string().min(2, { message: "Country must be at least 2 characters." }),
})

interface SubAccountDetailsProps {
  agencyDetails?: string
  details?: Partial<SubAccount>
  userId: string
  userName: string
  subscriptionPrice: number
  currentSubAccountsCount: number
}

if (typeof window !== 'undefined') {
  console.error = () => {}; // Suppress console errors
  console.warn = () => {}; // Suppress console warnings
}

function SubAccountDetails({ 
  details = {}, 
  agencyDetails, 
  userId, 
  userName,
  subscriptionPrice,
  currentSubAccountsCount
}: SubAccountDetailsProps) {
  const { toast } = useToast()
  const { setClose } = useModal()
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: details?.name || "",
      companyEmail: details?.companyEmail || "",
      companyPhone: details?.companyPhone || "",
      address: details?.address || "",
      city: details?.city || "",
      zipCode: details?.zipCode || "",
      state: details?.state || "",
      country: details?.country || "",
      subAccountLogo: details?.subAccountLogo || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await upsertSubAccount({
        id: details?.id ? details.id : v4(),
        address: values.address,
        subAccountLogo: values.subAccountLogo,
        city: values.city,
        companyPhone: values.companyPhone,
        country: values.country,
        name: values.name,
        state: values.state,
        zipCode: values.zipCode,
        createdAt: new Date(),
        updatedAt: new Date(),
        companyEmail: values.companyEmail,
        agencyId: agencyDetails || "",
        connectAccountId: "",
        goal: 5000,
      })

      if (!response) {
        throw new Error("No response from server.")
      }

      const notificationData = {
        agencyId: response.agencyId || agencyDetails,
        description: `${userName} | ${details?.id ? "updated" : "created"} sub account | ${response.name}`,
        subaccountId: response.id || details?.id,
      }

      if (!notificationData.agencyId || !notificationData.subaccountId) {
        throw new Error("Missing required IDs for activity log")
      }

      await seveActivityLogsNotification(notificationData)

      toast({
        title: details?.id ? "Subaccount Updated" : "Subaccount Created",
        description: `Subaccount  ${details?.id ? "updated" : "created"} successfully!`,
      })

      setClose()
      router.refresh()
    } catch (error) {
      console.error("Error in onSubmit:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${details?.id ? "update" : "create"} subaccount. Try again later.`,
      })
    }
  }

  const isLoading = form.formState.isSubmitting

  // Determine limits based on subscription price
  const getSubAccountLimit = () => {
    if (subscriptionPrice >= 50) return Infinity
    if (subscriptionPrice > 0 && subscriptionPrice < 50) return 10
    return 3 // No subscription
  }

  const subAccountLimit = getSubAccountLimit()
  const isUpgradeRequired = currentSubAccountsCount >= subAccountLimit

  if (isUpgradeRequired) {
    return (
      <Card className="w-full border-2 border-destructive/20">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <Lock className="h-5 w-5" />
            <CardTitle>Sub Account Limit Reached</CardTitle>
          </div>
          <CardDescription className="text-destructive/80">
            {subscriptionPrice >= 50 
              ? "You've reached the maximum number of sub accounts allowed."
              : subscriptionPrice > 0 && subscriptionPrice < 50
              ? "Your current plan allows up to 10 sub accounts. To add more, please upgrade your agency plan."
              : "Your free plan allows up to 3 sub accounts. To add more, please upgrade your agency plan."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              Current sub accounts: {currentSubAccountsCount}/{subAccountLimit === Infinity ? '∞' : subAccountLimit}
            </p>
            <p className="text-sm text-destructive mt-1">
              Current plan: {subscriptionPrice === 0 ? 'Free' : `₹${subscriptionPrice}/month`}
            </p>
          </div>
          <Button asChild className="w-full bg-destructive hover:bg-destructive/90">
            <Link href={`/agency/${agencyDetails}/billing`}>
              Upgrade Now
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (typeof window !== 'undefined') {
    console.error = () => {}; // Suppress console errors
    console.warn = () => {}; // Suppress console warnings
  }
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sub Account Information</CardTitle>
        <CardDescription>Please enter business details</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subAccountLogo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Logo</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="subaccountLogo"
                      value={field.value}
                      onchange={(url) => field.onChange(url)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex md:flex-row gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input required placeholder="Your agency name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyEmail"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Account Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex md:flex-row gap-4">
              <FormField
                control={form.control}
                name="companyPhone"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Account Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone" required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input required placeholder="123 st..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex md:flex-row gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input required placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input required placeholder="State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Zipcode</FormLabel>
                    <FormControl>
                      <Input required placeholder="Zipcode" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input required placeholder="Country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loading /> : "Save Account Information"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default SubAccountDetails

