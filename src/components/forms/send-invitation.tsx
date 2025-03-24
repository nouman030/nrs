"use client"

import type React from "react"
import { useState } from "react"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Button } from "../ui/button"
import Loading from "../global/loading"
import { seveActivityLogsNotification, sendInvitation } from "@/lib/queries"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"

interface SendInvitationProps {
  agencyId: string
}

const SendInvitation: React.FC<SendInvitationProps> = ({ agencyId }) => {
  const { toast } = useToast()
  const [invitationStatus, setInvitationStatus] = useState<{
    status: "idle" | "success" | "error" | "alreadyInvited"
    message: string
  }>({ status: "idle", message: "" })

  // Define the schema for form validation
  const userDataSchema = z.object({
    email: z.string().email("Invalid email address"),
    role: z.enum(["AGENCY_ADMIN", "SUBACCOUNT_USER", "SUBACCOUNT_GUEST"]),
  })

  // Support for multiple email addresses
  const multipleEmailsSchema = z.object({
    emails: z.string().refine(
      (val) => {
        const emails = val.split(",").map((e) => e.trim())
        return emails.every((email) => z.string().email().safeParse(email).success)
      },
      { message: "One or more email addresses are invalid" },
    ),
    role: z.enum(["AGENCY_ADMIN", "SUBACCOUNT_USER", "SUBACCOUNT_GUEST"]),
  })

  // Initialize the form with React Hook Form and Zod
  const form = useForm<z.infer<typeof userDataSchema>>({
    resolver: zodResolver(userDataSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      role: "SUBACCOUNT_USER",
    },
  })

  const multipleEmailsForm = useForm<z.infer<typeof multipleEmailsSchema>>({
    resolver: zodResolver(multipleEmailsSchema),
    mode: "onChange",
    defaultValues: {
      emails: "",
      role: "SUBACCOUNT_USER",
    },
  })

  const [useMultipleEmails, setUseMultipleEmails] = useState(false)

  // Form submission handler for single email
  const onSubmit = async (values: z.infer<typeof userDataSchema>) => {
    try {
      setInvitationStatus({ status: "idle", message: "" })

      // Send the invitation
      const res = await sendInvitation(values.role, values.email, agencyId)

      // Log the activity
      await seveActivityLogsNotification({
        agencyId,
        description: `Invited ${res.email}`,
        subaccountId: undefined,
      })

      // Reset the form
      form.reset({ email: "", role: "SUBACCOUNT_USER" })

      // Update status based on response
      if (res.alreadyInvited) {
        setInvitationStatus({
          status: "alreadyInvited",
          message: `${res.email} already has a pending invitation.`,
        })
      } else {
        setInvitationStatus({
          status: "success",
          message: `Invitation sent to ${res.email}`,
        })
      }

      // Show a success message
      toast({
        title: "Success",
        description: res.alreadyInvited
          ? "User already has a pending invitation"
          : "Invitation created and sent successfully",
      })
    } catch (error) {
      console.error("Error sending invitation:", error)
      setInvitationStatus({
        status: "error",
        message: "Failed to send invitation. Please try again.",
      })

      // Show an error message
      toast({
        variant: "destructive",
        title: "Oops!",
        description: "Could not send the invitation. Please try again.",
      })
    }
  }

  // Form submission handler for multiple emails
  const onSubmitMultiple = async (values: z.infer<typeof multipleEmailsSchema>) => {
    try {
      setInvitationStatus({ status: "idle", message: "" })

      const emails = values.emails.split(",").map((e) => e.trim())
      const results = []

      for (const email of emails) {
        // Send the invitation
        const res = await sendInvitation(values.role, email, agencyId)
        results.push(res)

        // Log the activity
        await seveActivityLogsNotification({
          agencyId,
          description: `Invited ${email}`,
          subaccountId: undefined,
        })
      }

      // Reset the form
      multipleEmailsForm.reset({ emails: "", role: "SUBACCOUNT_USER" })

      // Count successes and already invited
      const successCount = results.filter((r) => !r.alreadyInvited).length
      const alreadyInvitedCount = results.filter((r) => r.alreadyInvited).length

      // Set status message
      let statusMessage = ""
      if (successCount > 0) {
        statusMessage += `Successfully sent ${successCount} invitation(s). `
      }
      if (alreadyInvitedCount > 0) {
        statusMessage += `${alreadyInvitedCount} email(s) already had pending invitations.`
      }

      setInvitationStatus({
        status: successCount > 0 ? "success" : "alreadyInvited",
        message: statusMessage,
      })

      // Show a success message
      toast({
        title: "Success",
        description: statusMessage || "Invitations processed successfully",
      })
    } catch (error) {
      console.error("Error sending invitations:", error)
      setInvitationStatus({
        status: "error",
        message: "Failed to send invitations. Please try again.",
      })

      // Show an error message
      toast({
        variant: "destructive",
        title: "Oops!",
        description: "Could not send the invitations. Please try again.",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Invitation</CardTitle>
        <CardDescription>
          Invite users to your agency. Users can be part of multiple agencies and will receive unique invitations.
        </CardDescription>
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant={useMultipleEmails ? "outline" : "default"}
            size="sm"
            onClick={() => setUseMultipleEmails(false)}
          >
            Single Email
          </Button>
          <Button
            variant={useMultipleEmails ? "default" : "outline"}
            size="sm"
            onClick={() => setUseMultipleEmails(true)}
          >
            Multiple Emails
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {invitationStatus.status !== "idle" && (
          <Alert
            className={`mb-4 ${
              invitationStatus.status === "success"
                ? "bg-green-50 text-green-800 border-green-200"
                : invitationStatus.status === "alreadyInvited"
                  ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                  : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {invitationStatus.status === "success"
                ? "Success"
                : invitationStatus.status === "alreadyInvited"
                  ? "Information"
                  : "Error"}
            </AlertTitle>
            <AlertDescription>{invitationStatus.message}</AlertDescription>
          </Alert>
        )}

        {!useMultipleEmails ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter user email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role Field */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value)} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AGENCY_ADMIN">Agency Admin</SelectItem>
                        <SelectItem value="SUBACCOUNT_USER">Sub Account User</SelectItem>
                        <SelectItem value="SUBACCOUNT_GUEST">Sub Account Guest</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Loading /> : "Send Invitation"}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...multipleEmailsForm}>
            <form onSubmit={multipleEmailsForm.handleSubmit(onSubmitMultiple)} className="flex flex-col gap-6">
              {/* Multiple Emails Field */}
              <FormField
                control={multipleEmailsForm.control}
                name="emails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emails</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter emails separated by commas" {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">Example: user1@example.com, user2@example.com</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role Field */}
              <FormField
                control={multipleEmailsForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value)} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AGENCY_ADMIN">Agency Admin</SelectItem>
                        <SelectItem value="SUBACCOUNT_USER">Sub Account User</SelectItem>
                        <SelectItem value="SUBACCOUNT_GUEST">Sub Account Guest</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button type="submit" disabled={multipleEmailsForm.formState.isSubmitting}>
                {multipleEmailsForm.formState.isSubmitting ? <Loading /> : "Send Invitations"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  )
}

export default SendInvitation

