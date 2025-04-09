'use server'
import RazorpaySubscription from "@/components/Payments/plans-info"
import { db } from "@/lib/db"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import LoadingPage from "@/components/global/loading-page"
import { Suspense } from "react"
import RemoveSubscription from "./_commponts/remove-subscription"

type Props = {
    params: {
        agencyid: string
    }
    searchParams: {
        code: string
    }
}

type BillingContentProps = {
    agencyid: string
    customerId: string
    hasActiveSubscription: boolean
    agencyDetails: {
        Subscription: {
            id: string
            status: string
            currentPeriodEndDate: Date
            createdAt: Date
            planId: string
            price: string | null
            active: boolean
            subscritiptionId: string
            updatedAt: Date
            agencyId: string | null
        } | null
        customerId: string
    }
}

const BillingContent = async ({ 
    agencyid, 
    customerId, 
    hasActiveSubscription, 
    agencyDetails 
}: BillingContentProps) => {
    const subscriptionId = agencyDetails.Subscription?.id
    return (
        <div className="flex flex-col justify-center items-center py-10 min-h-screen ">
            {hasActiveSubscription ? (
                <div className="w-full max-w-4xl mb-8 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl text-center shadow-lg transition-all hover:shadow-primary/10">
                    <h2 className="text-2xl font-bold text-primary mb-3">Active Subscription</h2>
                    <p className="text-foreground text-lg">
                        Your subscription is active until <span className="text-primary font-semibold">{agencyDetails.Subscription?.currentPeriodEndDate.toLocaleDateString()}</span>
                        <br />
                        <span className="text-sm text-muted-foreground">Auto-renews monthly for up to 12 months</span>
                    </p>
                </div>
            ) : (
                <div className="w-full  mx-auto p-4 sm:p-6 rounded-xl bg-card shadow-lg border border-border">
                    <RazorpaySubscription agencyId={agencyid} customerId={customerId} />
                </div>
            )}

            {hasActiveSubscription && (
                <div className="w-full max-w-4xl mt-8 px-4 sm:px-6">
                    <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
                        <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
                            Subscription Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                                <p className="text-sm text-muted-foreground">Plan Id</p>
                                <p className="font-semibold text-foreground truncate">
                                    {agencyDetails.Subscription?.planId || 'Standard'}
                                </p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="font-semibold text-primary">Active</p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                                <p className="text-sm text-muted-foreground">Start Date</p>
                                <p className="font-semibold text-foreground">
                                    {agencyDetails.Subscription?.createdAt?.toLocaleDateString()}
                                </p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                                <p className="text-sm text-muted-foreground">Next Billing Date</p>
                                <p className="font-semibold text-foreground">
                                    {agencyDetails.Subscription?.currentPeriodEndDate?.toLocaleDateString()}
                                </p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                                <p className="text-sm text-muted-foreground">Amount</p>
                                <p className="font-semibold text-primary">
                                    ₹{agencyDetails.Subscription?.price || 0}/month
                                </p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                                <p className="text-sm text-muted-foreground">Customer ID</p>
                                <p className="font-semibold text-foreground text-wrap truncate">
                                    {customerId}
                                </p>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-center">
                            <RemoveSubscription subscriptionId={subscriptionId || ""} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const BillingPage = async ({ params }: Props) => {
    const { agencyid } = params
    const user = await currentUser()

    if (!user) {
        return redirect("/sign-in")
    }

    const agencyDetails = await db.agency.findUnique({
        where: {
            id: agencyid
        },
        include: {
            Subscription: true
        }
    })

    if (!agencyDetails) {
        return redirect("/agency/unauthorized")
    }

    const hasActiveSubscription = agencyDetails.Subscription?.status === "ACTIVE"
    const customerId = agencyDetails.customerId || ""

    return (
        <Suspense fallback={<LoadingPage />}>
            <BillingContent 
                agencyid={agencyid}
                customerId={customerId}
                hasActiveSubscription={hasActiveSubscription}
                agencyDetails={agencyDetails}
            />
        </Suspense>
    )
}

export default BillingPage
