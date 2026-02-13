import { createClient } from "@/utils/supabase/server";
import { AdminService } from "@/lib/services/admin-service";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Badge
} from "@doossh/ui";
import {
    Store,
    TrendingUp,
    ShieldCheck,
    ArrowRight
} from "lucide-react";
import Link from "next/link";
import { RevenueAreaChart, MarketplaceSunburstChart } from "@/components/dashboard/analytics-charts";

export default async function AdminDashboardPage() {
    const stats = await AdminService.getSalesOverview();
    const breakdown = await AdminService.getRevenueBreakdown();
    const supabase = await createClient();

    // Fetch pending vendors for verification queue
    const { data: pendingVendors } = await supabase
        .from("vendors")
        .select("*")
        .eq("is_verified", false)
        .limit(5);

    return (
        <div className="flex flex-col gap-8 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Admin Intelligence
                </h1>
                <p className="text-muted-foreground text-lg">Real-time marketplace oversight and performance metrics.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="relative overflow-hidden border-none shadow-xl bg-primary text-primary-foreground group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-16 w-16" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium opacity-80 uppercase tracking-widest italic">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">₹{(stats.totalRevenue).toLocaleString()}</div>
                        <p className="text-xs opacity-70 mt-1 flex items-center gap-1">
                            <ArrowRight className="h-3 w-3" /> +12.5% vs last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-muted/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Commission (10%)</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">₹{(stats.totalRevenue * 0.1).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1 tracking-tight">Net platform earnings</p>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-muted/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Vendors</CardTitle>
                        <Store className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeVendors}</div>
                        <p className="text-xs text-muted-foreground mt-1">Spanning 3 verticals</p>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-muted/50 bg-muted/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">System Health</CardTitle>
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Active</div>
                        <p className="text-xs text-muted-foreground mt-1">AWS Core - AP North</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Revenue Chart */}
                <Card className="col-span-4 shadow-xl border-muted/50 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between bg-muted/30 border-b">
                        <CardTitle className="text-lg">Revenue Growth</CardTitle>
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                            Details <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <RevenueAreaChart />
                    </CardContent>
                </Card>

                {/* Marketplace Split (Sunburst Report) */}
                <Card className="col-span-3 shadow-xl border-muted/50 overflow-hidden bg-gradient-to-tr from-background to-muted/10">
                    <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Marketplace Intel</CardTitle>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Multi-level Distribution</p>
                        </div>
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 animate-pulse">Live Sunburst</Badge>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <MarketplaceSunburstChart data={breakdown} />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 shadow-lg border-muted/50">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Marketplace Activity</CardTitle>
                        <Badge variant="outline">Live Feed</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { user: "Rahul S.", action: "booked table at", target: "The Blue Room", time: "2m ago", amount: "₹500" },
                                { user: "Priya V.", action: "purchased ticket for", target: "Mirage Saturday", time: "15m ago", amount: "₹2,500" },
                                { user: "Amit K.", action: "unlocked leads for", target: "Regency Hall", time: "45m ago", amount: "₹1,800" },
                            ].map((activity, i) => (
                                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                                            {activity.user[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                <span className="text-primary">{activity.user}</span> {activity.action} <span className="font-bold">{activity.target}</span>
                                            </p>
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{activity.time}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-emerald-600">{activity.amount}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 shadow-lg border-muted/50">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>KYC Verification Center</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/dashboard/admin/kyc" className="text-primary hover:text-primary">
                                View All
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {pendingVendors?.length === 0 ? (
                                <div className="text-center py-8">
                                    <ShieldCheck className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm text-muted-foreground">Queue is clean!</p>
                                </div>
                            ) : (
                                pendingVendors?.map((vendor: any) => (
                                    <div key={vendor.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0 group">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium group-hover:text-primary transition-colors">{vendor.name}</p>
                                            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest">{vendor.category}</Badge>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link href={`/dashboard/admin/vendors/${vendor.id}`}>
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
