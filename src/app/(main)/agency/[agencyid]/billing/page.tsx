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

const BillingContent = async ({ agencyid, customerId, hasActiveSubscription, agencyDetails }: any) => {
    const subscriptionId = await agencyDetails.Subscription?.id
    return (
        <div className="flex flex-col justify-center items-center py-10 bg-gradient-to-b from-slate-900 to-slate-800 min-h-screen">
            {hasActiveSubscription ? (
                <div className="w-full max-w-4xl mb-8 p-6 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 rounded-xl text-center backdrop-blur-sm shadow-xl transition-all hover:shadow-emerald-500/10">
                    <h2 className="text-2xl font-bold text-emerald-400 mb-3">Active Subscription</h2>
                    <p className="text-slate-200 text-lg">
                        Your subscription is active until <span className="text-emerald-400 font-semibold">{agencyDetails.Subscription?.currentPeriodEndDate.toLocaleDateString()}</span>
                        <br />
                        <span className="text-sm text-slate-400">Auto-renews monthly for up to 12 months</span>
                    </p>
                </div>
            ) : (
                <div className="w-full max-w-4xl p-6  rounded-xl backdrop-blur-sm">
                    <RazorpaySubscription agencyId={agencyid} customerId={customerId} />
                </div>
            )}

            {hasActiveSubscription && (
                <div className="w-full max-w-4xl mt-8 px-4 sm:px-6">
                    <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg backdrop-blur-sm border border-slate-700">
                        <h3 className="text-2xl font-bold text-slate-100 mb-6 text-center">
                            Subscription Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors">
                                <p className="text-sm text-slate-400">Plan Id</p>
                                <p className="font-semibold text-slate-200 truncate">
                                    {agencyDetails.Subscription?.planId || 'Standard'}
                                </p>
                            </div>
                            <div className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors">
                                <p className="text-sm text-slate-400">Status</p>
                                <p className="font-semibold text-emerald-400">Active</p>
                            </div>
                            <div className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors">
                                <p className="text-sm text-slate-400">Start Date</p>
                                <p className="font-semibold text-slate-200">
                                    {agencyDetails.Subscription?.createdAt?.toLocaleDateString()}
                                </p>
                            </div>
                            <div className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors">
                                <p className="text-sm text-slate-400">Next Billing Date</p>
                                <p className="font-semibold text-slate-200">
                                    {agencyDetails.Subscription?.currentPeriodEndDate?.toLocaleDateString()}
                                </p>
                            </div>
                            <div className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors">
                                <p className="text-sm text-slate-400">Amount</p>
                                <p className="font-semibold text-emerald-400">
                                    ₹{agencyDetails.Subscription?.price || 0}/month
                                </p>
                            </div>
                            <div className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors">
                                <p className="text-sm text-slate-400">Customer ID</p>
                                <p className="font-semibold text-slate-200 text-wrap truncate">
                                    {customerId}
                                </p>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-center">
                            <RemoveSubscription subscriptionId={subscriptionId} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const BillingPage = async ({ params, searchParams }: Props) => {
    const { agencyid } = await params
    const user = await currentUser()

    if (!user) {
        return redirect("/sign-in")
    }

    const agencyDetails = await db.agency.findUnique({
        where: {
            id: agencyid,
        },
        include: {
            Subscription: true,
        },
    })

    if (!agencyDetails) {
        return redirect("/")
    }

    const customerId = agencyDetails.customerId
    const hasActiveSubscription = agencyDetails.Subscription?.active

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
