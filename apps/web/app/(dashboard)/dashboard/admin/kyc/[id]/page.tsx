import { createClient } from "@/utils/supabase/server";
import { AdminService } from "@/lib/services/admin-service";
import { DashboardHeader } from "@/components/dashboard-header";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Badge,
    Separator,
    Textarea
} from "@doossh/ui";
import {
    ShieldCheck,
    ShieldAlert,
    ArrowLeft,
    FileText,
    Building2,
    Calendar
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";

export default async function KYCDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: kyc } = await supabase
        .from("vendor_kyc")
        .select(`
            *,
            vendor:vendors(*)
        `)
        .eq("id", id)
        .single();

    if (!kyc) {
        redirect("/dashboard/admin/kyc");
    }

    return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild className="rounded-full">
                    <Link href="/dashboard/admin/kyc">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">KYC Review: {kyc.vendor?.name}</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <Building2 className="h-4 w-4" /> {kyc.vendor?.category} Section
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Document Viewer Section */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="overflow-hidden border-2">
                        <CardHeader className="bg-muted/30 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                {kyc.document_type.toUpperCase()} Verification
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 bg-zinc-900 aspect-[4/3] flex items-center justify-center group relative cursor-zoom-in">
                            {/* In a real app, this would be an iframe or IMG with kyc.document_url */}
                            <div className="text-center space-y-4">
                                <ShieldAlert className="h-16 w-16 text-yellow-500/50 mx-auto" />
                                <div className="space-y-1">
                                    <p className="text-white font-medium">Internal Document Viewer</p>
                                    <p className="text-zinc-500 text-sm">Secure link: {kyc.document_url.slice(0, 30)}...</p>
                                </div>
                                <Button variant="secondary" size="sm" asChild>
                                    <a href={kyc.document_url} target="_blank" rel="noopener noreferrer">
                                        Open in New Tab
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-md">Audit Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Submission received on {format(new Date(kyc.created_at), "PPP p")}.
                            No previous review attempts found for this vendor.
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>Decision Center</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Reviewer Note (Internal)</label>
                                <Textarea
                                    placeholder="Add any internal remarks regarding this verification..."
                                    className="resize-none h-24"
                                />
                            </div>

                            <Separator />

                            <div className="flex flex-col gap-3">
                                <form action={async (formData: FormData) => {
                                    "use server";
                                    // In a full implementation, we'd handle rejection with reasons
                                    await AdminService.updateKYCStatus(id, "verified");
                                    redirect("/dashboard/admin/kyc");
                                }}>
                                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20">
                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                        Approve & Verify
                                    </Button>
                                </form>

                                <form action={async (formData: FormData) => {
                                    "use server";
                                    await AdminService.updateKYCStatus(id, "rejected", "Document unclear or invalid.");
                                    redirect("/dashboard/admin/kyc");
                                }}>
                                    <Button type="submit" variant="destructive" className="w-full">
                                        <ShieldAlert className="mr-2 h-4 w-4" />
                                        Reject Submission
                                    </Button>
                                </form>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-muted rounded-lg">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Submitted</p>
                                    <p className="text-sm font-medium">{format(new Date(kyc.created_at), "MMM dd, yyyy")}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
