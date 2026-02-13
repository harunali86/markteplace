import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import { getRazorpay, getRazorpayCheckoutKey, isRazorpayConfigured } from "../../../../lib/razorpay";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { leadId } = await req.json();

        // 1. Fetch lead for validation
        const { data: lead } = await supabase
            .from("leads")
            .select("customer_name, vendor_id")
            .eq("id", leadId)
            .single();

        if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

        // 2. Pricing: Fixed nominal fee to unlock lead
        const unlockFeePaise = 99 * 100;

        const paymentGatewayEnabled = isRazorpayConfigured();
        const checkoutKey = getRazorpayCheckoutKey();
        let providerOrderId = `mock_lead_${Date.now()}`;

        if (paymentGatewayEnabled) {
            const razorpay = getRazorpay();
            const razorpayOrder = await razorpay.orders.create({
                amount: unlockFeePaise,
                currency: "INR",
                receipt: `lead_rcpt_${Date.now()}`,
            });
            providerOrderId = razorpayOrder.id;
        }

        // 4. Create Internal Payment
        const { error: paymentError } = await supabase
            .from("payments")
            .insert({
                amount: unlockFeePaise / 100,
                currency: "INR",
                provider: "razorpay",
                provider_order_id: providerOrderId,
                user_id: user.id,
                status: paymentGatewayEnabled ? "pending" : "captured",
            });

        if (paymentError) throw paymentError;

        if (!paymentGatewayEnabled) {
            let vendorId = lead.vendor_id as string | null;
            if (!vendorId) {
                const { data: membership } = await supabase
                    .from("vendor_memberships")
                    .select("vendor_id")
                    .eq("user_id", user.id)
                    .limit(1)
                    .maybeSingle();
                vendorId = membership?.vendor_id ?? null;
            }

            if (!vendorId) {
                return NextResponse.json({ error: "No vendor profile found for unlock" }, { status: 400 });
            }

            const { error: unlockError } = await supabase
                .from("lead_unlocks")
                .upsert(
                    {
                        lead_id: leadId,
                        vendor_id: vendorId,
                    },
                    { onConflict: "lead_id,vendor_id" }
                );

            if (unlockError) throw unlockError;
        }

        return NextResponse.json({
            orderId: providerOrderId,
            amount: unlockFeePaise,
            leadName: lead.customer_name,
            checkoutMode: paymentGatewayEnabled ? "razorpay" : "manual",
            checkoutKey,
        });

    } catch (err: any) {
        console.error("Lead unlock error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
