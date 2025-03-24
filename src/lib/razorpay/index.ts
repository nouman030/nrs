import axios from "axios";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID!;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;
const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
export const fetchPlanDetails = async (planId: string) => {
  try {
    console.log(`Fetching plan: ${planId}`); // Debugging

    const response = await axios.get(`https://api.razorpay.com/v1/plans/${planId}`, {
      headers: { Authorization: `Basic ${auth}` },
    });

    console.log(`Fetched plan ${planId}:`, response.data); // Debugging

    return response.data;
  } catch (error: any) {
    console.log(`Error fetching plan ${planId}:`, error.response?.data || error.message);
    return null;
  }
};
