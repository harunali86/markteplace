import { NextResponse } from "next/server";
import { AdminService } from "../../../../lib/services/admin-service";

export async function GET() {
    try {
        const queue = await AdminService.getKYCQueue();
        return NextResponse.json({ success: true, data: queue });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: { code: "KYC_FETCH_FAILED", message: error.message }
        }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { kycId, status, reason } = await req.json();
        const result = await AdminService.updateKYCStatus(kycId, status, reason);
        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: { code: "KYC_UPDATE_FAILED", message: error.message }
        }, { status: 400 });
    }
}
