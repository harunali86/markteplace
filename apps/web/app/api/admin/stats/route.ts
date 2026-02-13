import { NextResponse } from "next/server";
import { AdminService } from "../../../../lib/services/admin-service";

export async function GET() {
    try {
        const stats = await AdminService.getSalesOverview();
        const breakdown = await AdminService.getRevenueBreakdown();

        return NextResponse.json({
            success: true,
            data: {
                ...stats,
                breakdown
            }
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: { code: "STATS_FETCH_FAILED", message: error.message }
        }, { status: 500 });
    }
}
