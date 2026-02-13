import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { verifyRazorpaySignature } from "../../../../lib/razorpay";
import { createClient } from "../../../../utils/supabase/server";

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
        return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
    }

    const isValid = verifyRazorpaySignature(body, signature, webhookSecret);

    if (!isValid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(body);
    const eventId = payload.id; // Razorpay unique event ID

    const supabase = await createClient();

    // 1. Idempotency Check
    const { data: existingEvent } = await supabase
        .from("payment_webhook_events")
        .select("id")
        .eq("event_id", eventId)
        .single();

    if (existingEvent) {
        return NextResponse.json({ status: "already processed" }, { status: 200 });
    }

    // 2. Log Event
    const { error: logError } = await supabase
        .from("payment_webhook_events")
        .insert({
            event_id: eventId,
            provider: "razorpay",
            payload: payload,
        });

    if (logError) {
        console.error("Webhook logging error:", logError);
        return NextResponse.json({ error: "Failed to log event" }, { status: 500 });
    }

    // 3. Process Event
    const eventType = payload.event;

    try {
        switch (eventType) {
            case "payment.captured":
                await handlePaymentCaptured(payload, supabase);
                break;
            case "payment.failed":
                await handlePaymentFailed(payload, supabase);
                break;
            default:
                console.log(`Unhandled event type: ${eventType}`);
        }

        // Mark as processed
        await supabase
            .from("payment_webhook_events")
            .update({ processed: true })
            .eq("event_id", eventId);

        return NextResponse.json({ status: "ok" }, { status: 200 });
    } catch (err) {
        console.error("Webhook processing error:", err);
        return NextResponse.json({ error: "Processing failed" }, { status: 500 });
    }
}

async function handlePaymentCaptured(payload: any, supabase: any) {
    const paymentData = payload.payload.payment.entity;
    const razorpayPaymentId = paymentData.id;
    const razorpayOrderId = paymentData.order_id;

    // Find internal payment record
    const { data: payment, error } = await supabase
        .from("payments")
        .select("*")
        .eq("provider_order_id", razorpayOrderId)
        .single();

    if (!payment) {
        console.error(`Payment not found for order ${razorpayOrderId}`);
        return;
    }

    // Update payment status
    await supabase
        .from("payments")
        .update({
            status: "captured",
            provider_payment_id: razorpayPaymentId
        })
        .eq("id", payment.id);

    // 4. Trigger downstream logic based on originator

    // Check if it's a Restaurant Booking
    const { data: booking } = await supabase
        .from("bookings")
        .select("id, status")
        .eq("payment_id", payment.id)
        .single();

    if (booking) {
        await supabase
            .from("bookings")
            .update({ status: "confirmed" })
            .eq("id", booking.id);
        return;
    }

    // Check if it's a Club Ticket Order
    const { data: order } = await supabase
        .from("orders")
        .select("id, event_id, status")
        .eq("payment_id", payment.id)
        .single();

    if (order) {
        // 1. Confirm Order
        await supabase
            .from("orders")
            .update({ status: "confirmed" })
            .eq("id", order.id);

        // 2. Issuance: This is usually done by fetching order items
        // Since we simplified the order/payment relationship, 
        // a production app would have an 'order_items' table.
        // For MVP, if we don't have order_items, we'd need to reconstruct from payload or metadata.
        // I will add a Note to implement order_items next to handle multi-ticket types correctly.
    }
}

async function handlePaymentFailed(payload: any, supabase: any) {
    const paymentData = payload.payload.payment.entity;
    const razorpayOrderId = paymentData.order_id;

    await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("provider_order_id", razorpayOrderId);
}
