import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";
import { getRazorpay, getRazorpayCheckoutKey, isRazorpayConfigured } from "../../../lib/razorpay";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { restaurantId, slotId, date, guestCount } = await req.json();

        // 1. Fetch restaurant and slot info for validation & pricing
        const { data: restaurant, error: rError } = await supabase
            .from("restaurants")
            .select("name, vendor_id")
            .eq("id", restaurantId)
            .single();

        const { data: slot, error: sError } = await supabase
            .from("restaurant_time_slots")
            .select("capacity")
            .eq("id", slotId)
            .single();

        if (rError || sError || !restaurant || !slot) {
            return NextResponse.json({ error: "Invalid restaurant or time slot" }, { status: 400 });
        }

        // 2. Concurrency Check: Validate remaining capacity for that date/slot
        const { data: existingBookings, error: bError } = await supabase
            .from("bookings")
            .select("guest_count")
            .eq("slot_id", slotId)
            .eq("booking_date", date)
            .not("status", "eq", "cancelled");

        const totalReserved = existingBookings?.reduce((acc, curr) => acc + curr.guest_count, 0) || 0;

        // Note: In a production app, we'd use a transaction or RPC with 'FOR UPDATE' for strict safety.
        // For now, we perform a read-then-write check.
        if (totalReserved + guestCount > slot.capacity) {
            return NextResponse.json({ error: "No capacity available for this slot" }, { status: 409 });
        }

        const bookingFee = 50 * 100; // In paise
        const paymentGatewayEnabled = isRazorpayConfigured();
        const checkoutKey = getRazorpayCheckoutKey();
        let providerOrderId = `mock_booking_${Date.now()}`;

        if (paymentGatewayEnabled) {
            const razorpay = getRazorpay();
            const razorpayOrder = await razorpay.orders.create({
                amount: bookingFee,
                currency: "INR",
                receipt: `rcpt_${Date.now()}`,
            });
            providerOrderId = razorpayOrder.id;
        }

        // 4. Create internal Payment record
        const { data: payment, error: pError } = await supabase
            .from("payments")
            .insert({
                amount: bookingFee / 100,
                currency: "INR",
                provider: "razorpay",
                provider_order_id: providerOrderId,
                user_id: user.id,
                status: paymentGatewayEnabled ? "pending" : "captured",
            })
            .select()
            .single();

        if (pError) throw pError;

        // 5. Create Pending Booking
        const { data: booking, error: bookingErr } = await supabase
            .from("bookings")
            .insert({
                vendor_id: restaurant.vendor_id,
                restaurant_id: restaurantId,
                user_id: user.id,
                slot_id: slotId,
                guest_count: guestCount,
                booking_date: date,
                status: paymentGatewayEnabled ? "pending" : "confirmed",
                payment_id: payment.id,
            })
            .select()
            .single();

        if (bookingErr) throw bookingErr;

        return NextResponse.json({
            orderId: providerOrderId,
            amount: bookingFee,
            bookingId: booking.id,
            restaurantName: restaurant.name,
            checkoutMode: paymentGatewayEnabled ? "razorpay" : "manual",
            checkoutKey,
        });

    } catch (err: any) {
        console.error("Booking API error:", err);
        return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
    }
}
