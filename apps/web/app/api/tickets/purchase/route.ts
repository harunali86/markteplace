import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import { getRazorpay } from "../../../../lib/razorpay";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { eventId, items } = await req.json();

        // 1. Fetch Event and Ticket Types for price calculation
        const { data: event } = await supabase
            .from("events")
            .select("name")
            .eq("id", eventId)
            .single();

        const { data: ticketTypes } = await supabase
            .from("ticket_types")
            .select("*")
            .eq("event_id", eventId);

        if (!event || !ticketTypes) return NextResponse.json({ error: "Event not found" }, { status: 404 });

        // 2. Calculate Total & Check Inventory
        let totalAmountPaise = 0;
        const orderItems = [];

        for (const item of items) {
            const type = ticketTypes.find(t => t.id === item.ticketTypeId);
            if (!type) continue;

            if (type.sold_count + item.quantity > type.capacity) {
                return NextResponse.json({ error: `Not enough tickets available for ${type.name}` }, { status: 409 });
            }

            totalAmountPaise += (type.price * 100) * item.quantity;
            orderItems.push({ ...type, requestedQty: item.quantity });
        }

        // 3. Create Razorpay Order
        const razorpay = getRazorpay();
        const razorpayOrder = await razorpay.orders.create({
            amount: totalAmountPaise,
            currency: "INR",
            receipt: `event_rcpt_${Date.now()}`,
        });

        // 4. Create Internal Payment & Order
        const { data: payment } = await supabase
            .from("payments")
            .insert({
                amount: totalAmountPaise / 100,
                currency: "INR",
                provider: "razorpay",
                provider_order_id: razorpayOrder.id,
                user_id: user.id,
                status: "pending",
            })
            .select()
            .single();

        const { data: order } = await supabase
            .from("orders")
            .insert({
                user_id: user.id,
                event_id: eventId,
                payment_id: payment!.id,
                total_amount: totalAmountPaise / 100,
                status: "pending",
            })
            .select()
            .single();

        return NextResponse.json({
            orderId: razorpayOrder.id,
            amount: totalAmountPaise,
            internalOrderId: order!.id,
            eventName: event.name,
        });

    } catch (err: any) {
        console.error("Ticket purchase error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
