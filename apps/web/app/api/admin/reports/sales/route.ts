import { NextResponse } from "next/server";
import { AdminService } from "../../../../../lib/services/admin-service";
import { createClient } from "../../../../../utils/supabase/server";

export async function GET() {
    const supabase = await createClient();

    // Rule 2.2: Ensure auth and role check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "super_admin") {
        return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Forbidden" } }, { status: 403 });
    }

    // Fetch all captured payments for the report
    const { data: payments } = await supabase
        .from("payments")
        .select("*")
        .eq("status", "captured")
        .order("created_at", { ascending: false });

    if (!payments) {
        return NextResponse.json({ success: true, data: "" });
    }

    // Convert to CSV
    const headers = ["ID", "Amount", "Currency", "Status", "Provider Order ID", "Created At"];
    const rows = payments.map(p => [
        p.id,
        p.amount / 100, // Convert to INR
        p.currency,
        p.status,
        p.provider_order_id,
        p.created_at
    ]);

    const csvContent = [
        headers.join(","),
        ...rows.map(r => r.join(","))
    ].join("\n");

    return new Response(csvContent, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": 'attachment; filename="sales_report.csv"',
        },
    });
}
