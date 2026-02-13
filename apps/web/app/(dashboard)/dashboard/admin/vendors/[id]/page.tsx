import { createClient } from "@/utils/supabase/server";
import { AdminService } from "@/lib/services/admin-service";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button
} from "@doossh/ui";
import {
    ShieldCheck,
    ShieldAlert,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function VendorVerificationPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: vendor } = await supabase
        .from("vendors")
        .select("*")
        .eq("id", id)
        .single();

    if (!vendor) {
        redirect("/dashboard/admin");
    }

    return (
        <div className="flex flex-col gap-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/admin">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Verify Vendor: {vendor.name}</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Business Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Category</p>
                            <p className="text-lg capitalize">{vendor.category}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Description</p>
                            <p className="text-sm">{vendor.description}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Contact</p>
                            <p className="text-sm">{vendor.contact_phone || "Not provided"}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Onboarding Documents</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-md">
                        <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground text-center">
                            KYC documents will be visible here once uploaded by the vendor.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end gap-4">
                <form action={async () => {
                    "use server";
                    await AdminService.verifyVendor(id);
                    redirect("/dashboard/admin");
                }}>
                    <Button variant="outline" className="text-destructive">Reject Application</Button>
                    <Button type="submit" className="ml-2 bg-green-600 hover:bg-green-700">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Approve & Go Live
                    </Button>
                </form>
            </div>
        </div>
    );
}
