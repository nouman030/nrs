import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import Razorpay from "razorpay"
import { db } from "@/lib/db"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: Request) {
  try {
    const { plan_id, agencyId, customerId } = await request.json()

    if (!plan_id || !agencyId || !customerId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Verify user authentication
    const user = await currentUser()
    if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
      return NextResponse.json({ error: "User not authenticated or email not found" }, { status: 401 })
    }

    // Check for existing active subscription
    const existingSubscription = await db.subscription.findFirst({
      where: {
        OR: [
          { customerId, active: true },
          { agencyId, active: true },
          { 
            customerId,
            active: false,
            createdAt: { gt: new Date(Date.now() - 15 * 60 * 1000) } // Within last 15 minutes
          },
          {
            agencyId,
            active: false,
            createdAt: { gt: new Date(Date.now() - 15 * 60 * 1000) } // Within last 15 minutes
          }
        ]
      },
    })

    if (existingSubscription?.active) {
      return NextResponse.json({ error: "Active subscription already exists" }, { status: 400 })
    }

    // Delete any pending subscriptions
    if (existingSubscription && !existingSubscription.active) {
      await db.subscription.delete({
        where: {
          id: existingSubscription.id
        }
      })
    }

    try {
      // Create Subscription in Razorpay
      const subscription = await razorpay.subscriptions.create({
        plan_id,
        customer_notify: 1,
        total_count: 12, // 12-month subscription
      })

      // Get plan details to save price
      const plan = await razorpay.plans.fetch(plan_id)
      const price = typeof plan.item.amount === 'number' ? (plan.item.amount / 100).toString() : null

      // Calculate current period end date (1 month from now)
      const currentPeriodEndDate = new Date()
      currentPeriodEndDate.setMonth(currentPeriodEndDate.getMonth() + 1)

      // Create subscription record in database
      let dbSubscription;
      
      // Check if agency already has a subscription
      const existingAgencySubscription = await db.subscription.findUnique({
        where: { agencyId }
      });
      
      if (existingAgencySubscription) {
        // Update existing subscription instead of creating new one
        dbSubscription = await db.subscription.update({
          where: { id: existingAgencySubscription.id },
          data: {
            price,
            active: false,
            planId: plan_id,
            customerId,
            subscritiptionId: subscription.id,
            currentPeriodEndDate,
            status: "PENDING",
            lastPaymentStatus: "PENDING",
            lastPaymentDate: new Date(),
            updatedAt: new Date()
          }
        });
      } else {
        // Create new subscription
        dbSubscription = await db.subscription.create({
          data: {
            price,
            active: false,
            planId: plan_id,
            customerId,
            subscritiptionId: subscription.id,
            currentPeriodEndDate,
            agencyId,
            status: "PENDING",
            lastPaymentStatus: "PENDING",
            createdAt: new Date(),
          },
        });
      }

      // Return complete response with all required fields
      return NextResponse.json({
        subscription_id: subscription.id,
        razorpay_key: process.env.RAZORPAY_KEY_ID || "rzp_test_Fzmh1XKTh4eaXs",
        dbSubscriptionId: dbSubscription.id,
      })
    } catch (razorpayError: any) {
      console.error("Razorpay API error:", razorpayError ? razorpayError.message || razorpayError : "Unknown error")
      return NextResponse.json({ 
        error: razorpayError && razorpayError.message ? razorpayError.message : "Failed to create subscription with payment provider" 
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Subscription creation error:", error ? error.message || String(error) : "Unknown error")
    const errorMessage = error && error.message ? error.message : "Subscription creation failed"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get("customerId")

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }

    // Check for existing active subscription
    const existingSubscription = await db.subscription.findFirst({
      where: {
        customerId,
        active: true,
      },
    })

    return NextResponse.json({
      hasActiveSubscription: !!existingSubscription,
      subscription: existingSubscription,
    })
  } catch (error: any) {
    console.error("Subscription check error:", error ? error.message || String(error) : "Unknown error")
    return NextResponse.json(
      { error: error && error.message ? error.message : "Failed to check subscription status" },
      { status: 500 }
    )
  }
}

