import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import crypto from "crypto"

// This is a webhook handler for Razorpay events
export async function POST(request: Request) {
  try {
    const body = await request.text()
    const razorpaySignature = request.headers.get("x-razorpay-signature")

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (!webhookSecret || !razorpaySignature) {
      return NextResponse.json({ error: "Missing webhook secret or signature" }, { status: 400 })
    }

    const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex")

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Parse the webhook payload
    const payload = JSON.parse(body)
    const event = payload.event

    // Handle different webhook events
    if (event === "subscription.charged") {
      // Subscription payment was successful
      const subscriptionId = payload.payload.subscription.entity.id

      // Update subscription in database
      await db.subscription.updateMany({
        where: {
          subscritiptionId: subscriptionId,
        },
        data: {
          active: true,
          status: "ACTIVE",
          lastPaymentStatus: "CAPTURED",
          lastPaymentDate: new Date(),
          // Update the current period end date
          currentPeriodEndDate: new Date(payload.payload.subscription.entity.current_end * 1000),
        },
      })

      return NextResponse.json({ success: true, message: "Subscription activated" })
    } else if (event === "subscription.cancelled") {
      // Subscription was cancelled
      const subscriptionId = payload.payload.subscription.entity.id

      // Update subscription in database
      await db.subscription.updateMany({
        where: {
          subscritiptionId: subscriptionId,
        },
        data: {
          active: false,
          status: "CANCELLED",
          lastPaymentStatus: "CANCELLED",
          lastPaymentDate: new Date(),
        },
      })

      return NextResponse.json({ success: true, message: "Subscription deactivated" })
    }

    // For other events, just acknowledge receipt
    return NextResponse.json({ success: true, message: "Webhook received" })
  } catch (error: any) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

