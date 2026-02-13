import { createClient } from "@/utils/supabase/server";
import { AdminService } from "@/lib/services/admin-service";
import { DashboardHeader } from "@/components/dashboard-header";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Badge,
    Button,
    Input
} from "@doossh/ui";
import {
    TrendingUp,
    Download,
    Filter,
    Search,
    ArrowUpRight,
    CreditCard,
    ShoppingBag
} from "lucide-react";
import { format } from "date-fns";
import { RevenueAreaChart } from "@/components/dashboard/analytics-charts";

export default async function GlobalSalesPage() {
    const stats = await AdminService.getSalesOverview();
    const supabase = await createClient();

    // Fetch recent transactions
    const { data: transactions } = await supabase
        .from("payments")
        .select(`
            *,
            orders(status, customer_id, profiles(full_name, email))
        `)
        .order("created_at", { ascending: false })
        .limit(20);

    return (
        <div className="flex flex-col gap-8 pb-12">
            <div className="flex items-center justify-between">
                <DashboardHeader
                    heading="Global Sales Analytics"
                    text="Detailed financial oversight across all marketplaces and vendors."
                />
                <Button variant="outline" className="shadow-sm">
                    <Download className="mr-2 h-4 w-4" /> Export Ledger
                </Button>
            </div>

            {/* Quick Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-80">Gross Trade Volume</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs opacity-70 mt-1 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> +18.2% vs last quarter
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-muted-foreground uppercase text-[10px] font-bold">Total Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalTransactions}</div>
                        <p className="text-xs text-muted-foreground">Successful settlements</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-primary">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-muted-foreground uppercase text-[10px] font-bold">Avg. Order Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{(stats.totalRevenue / (stats.totalTransactions || 1)).toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Per successful trade</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-muted-foreground uppercase text-[10px] font-bold">Platform Take Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{(stats.totalRevenue * 0.1).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">10% Standard commission</p>
                    </CardContent>
                </Card>
            </div>

            {/* Visual Analytics */}
            <div className="grid gap-6 md:grid-cols-1">
                <Card className="shadow-md border-muted/50">
                    <CardHeader className="flex flex-row items-center justify-between bg-muted/20 border-b">
                        <CardTitle className="text-lg">Revenue Velocity (Time Series)</CardTitle>
                        <div className="flex gap-2">
                            <Badge variant="secondary">7 Days</Badge>
                            <Badge variant="outline" className="opacity-50">30 Days</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <RevenueAreaChart />
                    </CardContent>
                </Card>
            </div>

            {/* Transaction Ledger */}
            <Card className="shadow-lg">
                <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Transaction Ledger</CardTitle>
                        <div className="flex items-center gap-4">
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by ID or Customer..."
                                    className="pl-9 h-9"
                                />
                            </div>
                            <Button variant="ghost" size="sm">
                                <Filter className="mr-2 h-4 w-4" /> Filter
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow>
                            <TableHead>Transaction ID</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground italic">
                                    No transactions recorded yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions?.map((t) => (
                                <TableRow key={t.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
                                    <TableCell className="font-mono text-xs text-primary font-semibold">
                                        #{t.id.slice(0, 8).toUpperCase()}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {format(new Date(t.created_at), "MMM dd, HH:mm")}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-sm">{t.orders?.profiles?.full_name || "Guest"}</div>
                                        <div className="text-[10px] text-muted-foreground">{t.orders?.profiles?.email || "Unknown Customer"}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[10px] flex w-fit items-center gap-1">
                                            <CreditCard className="h-3 w-3" /> {t.payment_method || "RAZORPAY"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={t.status === "captured" ? "success" : "warning"}
                                            className="text-[10px] uppercase font-bold tracking-widest"
                                        >
                                            {t.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-emerald-600">
                                        ₹{t.amount?.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
