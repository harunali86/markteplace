import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import { getRazorpay } from "../../../../lib/razorpay";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { leadId } = await req.json();

        // 1. Fetch lead for validation
        const { data: lead } = await supabase
            .from("leads")
            .select("customer_name")
            .eq("id", leadId)
            .single();

        if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

        // 2. Pricing: Fixed nominal fee to unlock lead
        const unlockFeePaise = 99 * 100;

        // 3. Create Razorpay Order
        const razorpay = getRazorpay();
        const razorpayOrder = await razorpay.orders.create({
            amount: unlockFeePaise,
            currency: "INR",
            receipt: `lead_rcpt_${Date.now()}`,
        });

        // 4. Create Internal Payment
        await supabase
            .from("payments")
            .insert({
                amount: unlockFeePaise / 100,
                currency: "INR",
                provider: "razorpay",
                provider_order_id: razorpayOrder.id,
                user_id: user.id,
                status: "pending",
                // We link this payment to the lead unlock via metadata or a field
            });

        return NextResponse.json({
            orderId: razorpayOrder.id,
            amount: unlockFeePaise,
            leadName: lead.customer_name,
        });

    } catch (err: any) {
        console.error("Lead unlock error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
