import { NextResponse } from "next/server";
import { BillingService } from "../../../../lib/services/billing-service";
import { createClient } from "../../../../utils/supabase/server";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // In dev bypass we might have no user, handle that
        if (!user) {
            return NextResponse.json({
                success: true,
                data: { totalPaid: 0, pending: 0, history: [] }
            });
        }

        // Normally we'd resolve vendorId from memberships
        // For MVP we handle it via service logic
        const stats = await BillingService.getVendorPayoutStats(user.id);

        return NextResponse.json({ success: true, data: stats });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: { code: "PAYOUT_FETCH_FAILED", message: error.message }
        }, { status: 500 });
    }
}
