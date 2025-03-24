import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: Request) {
  let paymentId, subscriptionId, dbSubscriptionId;
  
  try {
    // Parse request body once at the start
    const body = await request.json()
    paymentId = body.paymentId
    subscriptionId = body.subscriptionId
    dbSubscriptionId = body.dbSubscriptionId

    if (!paymentId || !subscriptionId || !dbSubscriptionId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Verify payment with Razorpay
    const payment = await razorpay.payments.fetch(paymentId)

    // Check if payment is successful
    if (payment.status === "captured" || payment.status === "authorized") {
      // Update subscription in database
      const updatedSubscription = await db.subscription.update({
        where: {
          id: dbSubscriptionId,
        },
        data: {
          active: true,
          paymentId: paymentId,
          status: "ACTIVE",
          lastPaymentStatus: payment.status.toUpperCase() as "CAPTURED" | "AUTHORIZED",
          lastPaymentDate: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        message: "Payment verified and subscription activated",
        subscription: updatedSubscription,
      })
    } else {
      // Payment failed or was cancelled - update the subscription
      const updatedSubscription = await db.subscription.update({
        where: {
          id: dbSubscriptionId,
        },
        data: {
          active: false,
          status: "FAILED",
          lastPaymentStatus: payment.status.toUpperCase() as "FAILED" | "ERROR",
          lastPaymentDate: new Date(),
        },
      })

      return NextResponse.json(
        {
          success: false,
          error: `Payment verification failed. Status: ${payment.status}`,
          subscription: updatedSubscription,
        },
        { status: 400 },
      )
    }
  } catch (error: any) {
    console.error("Payment verification error:", error)
    
    // Try to update subscription status if we have the dbSubscriptionId
    if (dbSubscriptionId) {
      try {
        await db.subscription.update({
          where: {
            id: dbSubscriptionId,
          },
          data: {
            active: false,
            status: "ERROR",
            lastPaymentStatus: "ERROR",
            lastPaymentDate: new Date(),
          },
        })
      } catch (updateError) {
        console.error("Failed to update subscription status:", updateError)
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Payment verification failed",
        details: error.message,
      },
      { status: 500 }
    )
  }
}

// Add endpoint to handle payment cancellation
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dbSubscriptionId = searchParams.get("dbSubscriptionId")

    if (!dbSubscriptionId) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 })
    }

    // Delete the subscription record if payment was cancelled
    await db.subscription.delete({
      where: {
        id: dbSubscriptionId,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled and cleaned up",
    })
  } catch (error: any) {
    console.error("Subscription cleanup error:", error)
    return NextResponse.json(
      {
        error: "Failed to cleanup subscription",
        details: error.message,
      },
      { status: 500 }
    )
  }
}

