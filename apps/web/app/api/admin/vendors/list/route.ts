import { NextResponse } from "next/server";
import { AdminService } from "../../../../../lib/services/admin-service";

export async function GET() {
    try {
        const supabase = (await import("../../../../../utils/supabase/server")).createClient();
        const client = await supabase;

        const { data: vendors } = await client
            .from("vendors")
            .select("*")
            .order("created_at", { ascending: false });

        return NextResponse.json({
            success: true,
            data: vendors || []
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: { code: "VENDORS_FETCH_FAILED", message: error.message }
        }, { status: 500 });
    }
}
