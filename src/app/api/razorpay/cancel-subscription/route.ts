import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: Request) {
  try {
    const { subscriptionId } = await request.json()

    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 })
    }

    // Get subscription details from database
    const subscription = await db.subscription.findUnique({
      where: { id: subscriptionId },
    })

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    // Cancel subscription in Razorpay
    if (subscription.subscritiptionId) {
      try {
        await razorpay.subscriptions.cancel(subscription.subscritiptionId)
      } catch (error: any) {
        console.error("Razorpay cancellation error:", error)
        // Continue with local cancellation even if Razorpay fails
      }
    }

    // Update subscription status in database using the enum values as strings
    const deletedSubscription = await db.subscription.delete({
      where: { id: subscriptionId },
    })

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled successfully",
      subscription: deletedSubscription,
    })
  } catch (error: any) {
    console.error("Subscription cancellation error:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to cancel subscription",
      },
      { status: 500 }
    )
  }
} 