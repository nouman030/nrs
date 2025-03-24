import { db } from "@/lib/db"
import { currentUser } from "@clerk/nextjs/server"
import { type NextRequest, NextResponse } from "next/server"
import { sendInvitationEmail } from "@/lib/invitation-email"

// Get all invitations for an agency
export async function GET(req: NextRequest) {
  try {
    const authUser = await currentUser()
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const agencyId = searchParams.get("agencyId")

    if (!agencyId) {
      return NextResponse.json({ error: "Agency ID is required" }, { status: 400 })
    }

    // Check if user has access to this agency
    const user = await db.user.findUnique({
      where: { id: authUser.id },
      include: { Agency: true },
    })

    if (!user || user.Agency?.id !== agencyId) {
      return NextResponse.json({ error: "Unauthorized access to agency" }, { status: 403 })
    }

    // Get all invitations for the agency
    const invitations = await db.invitation.findMany({
      where: { agencyId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ invitations })
  } catch (error) {
    console.error("Error fetching invitations:", error)
    return NextResponse.json({ error: "Failed to fetch invitations" }, { status: 500 })
  }
}

// Create a new invitation
export async function POST(req: NextRequest) {
  try {
    const authUser = await currentUser()
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { email, role, agencyId } = body

    if (!email || !role || !agencyId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user has access to this agency
    const user = await db.user.findUnique({
      where: { id: authUser.id },
      include: { Agency: true },
    })

    if (!user || user.Agency?.id !== agencyId) {
      return NextResponse.json({ error: "Unauthorized access to agency" }, { status: 403 })
    }

    // Check if there's a pending invitation for this email
    const existingInvitation = await db.invitation.findFirst({
      where: {
        email,
        agencyId,
        status: "PENDING",
      },
    })

    if (existingInvitation) {
      return NextResponse.json({ error: "An invitation has already been sent to this email" }, { status: 409 })
    }

    // Get agency details for the email
    const agency = await db.agency.findUnique({
      where: { id: agencyId },
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Create a new invitation with expiration date (7 days from now)
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + 7)

    const invitation = await db.invitation.create({
      data: {
        email,
        role,
        token: `${Math.random().toString(36).substring(2, 15)}_${Date.now()}`,
        status: "PENDING",
        expiresAt: expirationDate,
        Agency: {
          connect: { id: agencyId },
        },
      },
    })

    // Send invitation email
    await sendInvitationEmail(invitation, agency.name)

    return NextResponse.json({ invitation })
  } catch (error) {
    console.error("Error creating invitation:", error)
    return NextResponse.json({ error: "Failed to create invitation" }, { status: 500 })
  }
}

// Cancel/revoke an invitation
export async function DELETE(req: NextRequest) {
  try {
    const authUser = await currentUser()
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const invitationId = searchParams.get("id")

    if (!invitationId) {
      return NextResponse.json({ error: "Invitation ID is required" }, { status: 400 })
    }

    // Get the invitation
    const invitation = await db.invitation.findUnique({
      where: { id: invitationId },
      include: { Agency: true },
    })

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 })
    }

    // Check if user has access to this agency
    const user = await db.user.findUnique({
      where: { id: authUser.id },
      include: { Agency: true },
    })

    if (!user || user.Agency?.id !== invitation.agencyId) {
      return NextResponse.json({ error: "Unauthorized access to invitation" }, { status: 403 })
    }

    // Update invitation status to REVOKED
    await db.invitation.update({
      where: { id: invitationId },
      data: { status: "REVOKED" },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error revoking invitation:", error)
    return NextResponse.json({ error: "Failed to revoke invitation" }, { status: 500 })
  }
}

