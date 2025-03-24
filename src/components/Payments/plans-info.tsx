"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Script from "next/script"
import { Check, Shield, Users, Zap, Clock, Award } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import Loading from "@/components/global/loading"

declare global {
    interface Window {
        Razorpay: any
    }
}

interface Props {
    agencyId: string
    customerId: string
}

interface Plan {
    id: string
    item: {
        name: string
        amount: number
    }
    period: string
    interval: number
}

export default function RazorpaySubscription({ agencyId, customerId }: Props) {
    const [plans, setPlans] = useState<Plan[]>([])
    const [message, setMessage] = useState("")
    const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false)
    const [loading, setLoading] = useState<string | null>(null)
    const [isLoadingPlans, setIsLoadingPlans] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        fetchPlans()
    }, [])

    const fetchPlans = async () => {
        setIsLoadingPlans(true)
        try {
            const response = await fetch("/api/razorpay/plans")
            const data = await response.json()
            if (data.error) {
                throw new Error(data.error)
            }
            setPlans(data)
        } catch (error: any) {
            setMessage("Failed to fetch plans.")
            toast({
                title: "Error",
                description: error.message || "Failed to fetch subscription plans. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoadingPlans(false)
        }
    }

    const subscribe = async (planId: string) => {
        if (isProcessing) {
            toast({
                title: "Please wait",
                description: "A subscription request is already in progress.",
                variant: "default",
            })
            return
        }

        setLoading(planId)
        setIsProcessing(true)
        try {
            // Check if user already has an active subscription
            const checkResponse = await fetch(`/api/razorpay/subscribe?customerId=${customerId}`)
            const checkData = await checkResponse.json()
            
            if (checkData.hasActiveSubscription) {
                toast({
                    title: "Subscription exists",
                    description: "You already have an active subscription.",
                    variant: "default",
                })
                return
            }

            const response = await fetch("/api/razorpay/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    plan_id: planId,
                    agencyId,
                    customerId,
                }),
            })

            const data = await response.json()

            if (data.error) {
                throw new Error(data.error)
            }

            if (data.subscription_id) {
                openRazorpayCheckout(data?.subscription_id, data?.razorpay_key, data?.dbSubscriptionId)
            } else {
                throw new Error("Failed to create subscription")
            }
        } catch (error: any) {
            setMessage(error.message || "Failed to create subscription.")
            toast({
                title: "Error",
                description: error.message || "Failed to create subscription. Please try again.",
                variant: "destructive",
            })
        } finally {
            setLoading(null)
            setIsProcessing(false)
        }
    }

    const openRazorpayCheckout = (subscriptionId: string, key: string, dbSubscriptionId: string) => {
        if (!isRazorpayLoaded) {
            setMessage("Razorpay is still loading. Please try again in a moment.")
            toast({
                title: "Payment Gateway",
                description: "Payment gateway is still loading. Please try again in a moment.",
                variant: "destructive",
            })
            return
        }

        try {
            const options = {
                key,
                subscription_id: subscriptionId,
                name: "Agency Platform",
                description: "Subscription Payment",
                theme: { color: "#6366F1" },
                handler: async (response: any) => {
                    const paymentId = response.razorpay_payment_id

                    try {
                        const updateResponse = await fetch("/api/razorpay/verify-payment", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                paymentId,
                                subscriptionId,
                                dbSubscriptionId,
                            }),
                        })

                        const result = await updateResponse.json()

                        if (result.success) {
                            setMessage("Payment successful! Your subscription is now active.")
                            toast({
                                title: "Payment Successful",
                                description: "Your subscription has been activated successfully!",
                                variant: "default",
                            })
                            // Refresh the page after successful payment
                            setTimeout(() => {
                                window.location.reload()
                            }, 2000)
                        } else {
                            throw new Error(result.error || "Payment verification failed")
                        }
                    } catch (error: any) {
                        setMessage("Payment was successful, but we couldn't update your subscription status.")
                        toast({
                            title: "Update Error",
                            description: error.message || "Payment was successful, but we couldn't update your subscription status.",
                            variant: "destructive",
                        })
                        // Clean up the failed subscription
                        cleanupSubscription(dbSubscriptionId)
                    }
                },
                modal: {
                    ondismiss: async () => {
                        setMessage("Payment cancelled by user")
                        toast({
                            title: "Payment Cancelled",
                            description: "You cancelled the payment process.",
                            variant: "default",
                        })
                        // Clean up the cancelled subscription
                        cleanupSubscription(dbSubscriptionId)
                        setIsProcessing(false)
                    },
                },
            }

            const rzp = new window.Razorpay(options)
            rzp.open()
        } catch (error: any) {
            console.error("Razorpay error:", error)
            setMessage("Failed to open payment gateway. Please try again.")
            toast({
                title: "Payment Gateway Error",
                description: error.message || "Failed to open payment gateway. Please try again.",
                variant: "destructive",
            })
            // Clean up the failed subscription
            cleanupSubscription(dbSubscriptionId)
            setIsProcessing(false)
        }
    }

    // Function to clean up cancelled or failed subscriptions
    const cleanupSubscription = async (dbSubscriptionId: string) => {
        try {
            const response = await fetch(`/api/razorpay/verify-payment?dbSubscriptionId=${dbSubscriptionId}`, {
                method: 'DELETE',
            })
            const data = await response.json()
            if (!data.success) {
                console.error('Failed to cleanup subscription:', data.error)
            }
        } catch (error) {
            console.error('Error cleaning up subscription:', error)
        }
    }

    const handleRazorpayLoad = () => {
        setIsRazorpayLoaded(true)
    }

    const getPlanFeatures = (planName: string) => {
        if (planName === "Basic") {
            return [
                { icon: <Shield className="h-4 w-4 text-primary" />, text: "Basic Agency Dashboard" },
                { icon: <Users className="h-4 w-4 text-primary" />, text: "Up to 5 Team Members" },
                { icon: <Clock className="h-4 w-4 text-primary" />, text: "24/7 Support" },
                { icon: <Check className="h-4 w-4 text-primary" />, text: "Automated Billing" },
            ]
        } else {
            return [
                { icon: <Shield className="h-4 w-4 text-primary" />, text: "Advanced Agency Dashboard" },
                { icon: <Users className="h-4 w-4 text-primary" />, text: "Unlimited Team Members" },
                { icon: <Zap className="h-4 w-4 text-primary" />, text: "Unlimited Sub Accounts" },
                { icon: <Award className="h-4 w-4 text-primary" />, text: "Priority Support" },
                { icon: <Check className="h-4 w-4 text-primary" />, text: "Advanced Analytics" },
            ]
        }
    }

    if (isLoadingPlans) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loading />
                <p className="mt-4 text-muted-foreground">Loading subscription plans...</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-5xl p-4">
            {/* Load Razorpay script */}
            <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={handleRazorpayLoad} strategy="lazyOnload" />

            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold mb-2">Choose Your Subscription Plan</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Select the plan that best fits your agency's needs. All plans include our core features with different levels
                    of access and support.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {plans.map((plan) => {
                    const isPopular = plan.item.name !== "Basic"
                    const features = getPlanFeatures(plan.item.name)

                    return (
                        <Card key={plan.id} className={`overflow-hidden ${isPopular ? "border-primary shadow-lg" : ""}`}>
                            {isPopular && (
                                <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                                    MOST POPULAR
                                </div>
                            )}
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-2xl">{plan.item.name}</CardTitle>
                                    {isPopular && (
                                        <Badge variant="outline" className="ml-2">
                                            Recommended
                                        </Badge>
                                    )}
                                </div>
                                <CardDescription className="pt-1.5">
                                    Perfect for {plan.item.name === "Basic" ? "small agencies" : "growing agencies"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <span className="text-3xl font-bold">₹{plan.item.amount / 100}</span>
                                    <span className="text-muted-foreground ml-1">/ {plan.period}</span>
                                </div>

                                <p className="text-sm text-muted-foreground">
                                    Billed every {plan.interval} {plan.period}(s)
                                </p>

                                <div className="space-y-3 pt-2">
                                    {features.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            {feature.icon}
                                            <span className="text-sm">{feature.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    onClick={() => subscribe(plan.id)}
                                    className="w-full relative"
                                    variant={isPopular ? "default" : "outline"}
                                    disabled={loading === plan.id || isProcessing}
                                >
                                    {loading === plan.id ? (
                                        <div className="flex items-center justify-center">
                                            <Loading />
                                            <span className="ml-2">Processing...</span>
                                        </div>
                                    ) : (
                                        "Subscribe Now"
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>

            {message && <div className="mt-6 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-md">{message}</div>}

            <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>
                    Need help choosing the right plan? Contact our sales team at{" "}
                    <span className="font-medium">support@agency.com</span>
                </p>
            </div>
        </div>
    )
}

