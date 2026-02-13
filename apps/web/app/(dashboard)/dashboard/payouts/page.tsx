import { createClient } from "@/utils/supabase/server";
import { DashboardHeader } from "@/components/dashboard-header";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Badge
} from "@doossh/ui";
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";

export default async function PayoutsPage() {
    const supabase = await createClient();

    // In a real system, we'd fetch actual payout logs. 
    // Here we'll show balance stats and a placeholder for transactions.

    return (
        <div className="space-y-8">
            <DashboardHeader
                heading="Payouts & Wallet"
                text="Monitor your earnings, platform commissions, and settlement history."
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-primary text-primary-foreground">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium opacity-80 uppercase tracking-wider">Available Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">₹{(42500).toLocaleString()}</div>
                        <p className="text-xs opacity-70 mt-1">Next settlement scheduled for Monday</p>
                        <Button variant="secondary" className="w-full mt-4 bg-white/20 hover:bg-white/30 border-0 text-white">
                            Request Payout
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Earned</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">₹{(215400).toLocaleString()}</div>
                        <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1 font-medium">
                            <ArrowUpRight className="h-3 w-3" />
                            +18% from last month
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Platform Fees</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">₹{(21540).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Flat 10% marketplace commission</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold px-1">Recent Transactions</h3>
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden divide-y">
                    {[
                        { id: 1, type: "payout", amount: -15000, date: "2026-02-10", status: "completed" },
                        { id: 2, type: "sale", amount: 2500, date: "2026-02-12", status: "cleared" },
                        { id: 3, type: "payout", amount: -12000, date: "2026-02-05", status: "completed" },
                    ].map((tx) => (
                        <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-2 rounded-full",
                                    tx.type === "payout" ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600"
                                )}>
                                    {tx.type === "payout" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                                </div>
                                <div>
                                    <p className="text-sm font-medium capitalize">{tx.type} Request</p>
                                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={cn(
                                    "text-sm font-bold",
                                    tx.type === "payout" ? "text-orange-600" : "text-emerald-600"
                                )}>
                                    {tx.amount > 0 ? "+" : ""}
                                    ₹{Math.abs(tx.amount).toLocaleString()}
                                </p>
                                <div className="flex items-center gap-1 justify-end text-[10px] uppercase font-bold text-muted-foreground/60">
                                    <Clock className="h-2 w-2" />
                                    {tx.status}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Helper to avoid build error on cn
import { cn } from "@doossh/ui";
