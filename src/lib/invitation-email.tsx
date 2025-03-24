import type { Invitation } from "@prisma/client"

// This is a placeholder for your email sending implementation
// You would typically use a service like SendGrid, Mailgun, etc.
export async function sendInvitationEmail(invitation: Invitation, agencyName: string) {
  try {
    // Example implementation using a hypothetical email service
    const invitationLink = `${process.env.NEXT_PUBLIC_URL}/api/invitations/accept?token=${invitation.token}`

    const emailContent = `
      <h1>You've been invited to join ${agencyName}</h1>
      <p>You have been invited to join as a ${formatRole(invitation.role)}.</p>
      <p>Click the link below to accept the invitation:</p>
      <a href="${invitationLink}" style="display: inline-block; padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
      <p>This invitation will expire in 7 days.</p>
    `

    // Here you would call your email service API
    // For example with SendGrid:
    /*
    const msg = {
      to: invitation.email,
      from: 'your-verified-sender@example.com',
      subject: `Invitation to join ${agencyName}`,
      html: emailContent,
    };
    await sgMail.send(msg);
    */

    console.log(`Email would be sent to ${invitation.email} with content:`, emailContent)

    return true
  } catch (error) {
    console.error("Error sending invitation email:", error)
    return false
  }
}

// Helper function to format role names for display
function formatRole(role: string): string {
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

