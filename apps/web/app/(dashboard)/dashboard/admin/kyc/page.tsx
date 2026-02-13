import { AdminService } from "@/lib/services/admin-service";
import { DashboardHeader } from "@/components/dashboard-header";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Badge,
    Button,
    Card,
    CardContent
} from "@doossh/ui";
import { format } from "date-fns";
import { ExternalLink, ShieldCheck, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function KYCQueuePage() {
    const queue = await AdminService.getKYCQueue();

    const stats = {
        pending: queue.length,
        verified: 0, // In a real app, we'd fetch these as well
        urgent: queue.filter((k: any) => {
            const days = (new Date().getTime() - new Date(k.created_at).getTime()) / (1000 * 3600 * 24);
            return days > 2;
        }).length
    };

    return (
        <div className="space-y-6">
            <DashboardHeader
                heading="KYC Verification Queue"
                text="Review and verify vendor business documents to grant marketplace access."
            />

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="pt-6 flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold">{stats.pending}</div>
                            <p className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Pending Reviews
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-destructive">
                    <CardContent className="pt-6 flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold">{stats.urgent}</div>
                            <p className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> Overdue (&gt;48h)
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-emerald-500">
                    <CardContent className="pt-6 flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold">Verified</div>
                            <p className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" /> History
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Document Type</TableHead>
                            <TableHead>Submitted On</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {queue.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    Queue is empty. All vendors are verified! 🚀
                                </TableCell>
                            </TableRow>
                        ) : (
                            queue.map((req: any) => (
                                <TableRow key={req.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell>
                                        <div className="font-semibold">{req.vendor?.name}</div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider">{req.vendor?.category}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {req.document_type.replace(/_/g, " ")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {format(new Date(req.created_at), "MMM dd, yyyy")}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="warning" className="animate-pulse">Pending</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="ghost" asChild>
                                            <Link href={`/dashboard/admin/kyc/${req.id}`}>
                                                Review Details <ExternalLink className="ml-2 h-3 w-3" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
