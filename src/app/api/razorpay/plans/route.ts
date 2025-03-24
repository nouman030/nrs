import { NextResponse } from "next/server"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})
const plan_199 = process.env.RAZORPAY_PLAN_199 || "plan_PwNt8gRjS5XuhW"
const plan_49 = process.env.RAZORPAY_PLAN_49 || "plan_PwIBp5z4YxevI3"
export async function GET() {
  try {
    const plan1 = await razorpay.plans.fetch(plan_199);
    const plan2 = await razorpay.plans.fetch(plan_49);
    const plans = [plan1, plan2];
    return NextResponse.json(plans);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch plans", details: error.message }, { status: 500 });
  }
}

