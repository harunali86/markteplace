"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, toast } from "@doossh/ui";
import { getTimeSlots } from "../../app/(dashboard)/dashboard/restaurants/[id]/slots/actions";

interface Slot {
    id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    capacity: number;
}

export function BookingForm({ restaurantId }: { restaurantId: string }) {
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [slots, setSlots] = useState<Slot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string>("");
    const [guestCount, setGuestCount] = useState(2);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function loadSlots() {
            const allSlots = await getTimeSlots(restaurantId);
            const day = new Date(date).getDay();
            const filtered = allSlots.filter((s: Slot) => s.day_of_week === day);
            setSlots(filtered);
        }
        loadSlots();
    }, [date, restaurantId]);

    async function handleBooking() {
        if (!selectedSlot) {
            toast.error("Please select a time slot");
            return;
        }

        setLoading(true);
        try {
            // 1. Create Checkout Session (Razorpay Order) + Pending Booking
            const response = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    restaurantId,
                    slotId: selectedSlot,
                    date,
                    guestCount,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Booking failed");

            if (data.checkoutMode === "manual") {
                toast.success("Booking created in manual mode.");
                window.location.href = `/browse/restaurants/${restaurantId}/success?booking_id=${data.bookingId}`;
                return;
            }

            const checkoutKey =
                data.checkoutKey || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
            if (!checkoutKey) {
                throw new Error("Payment gateway key is missing.");
            }
            if (!(window as any).Razorpay) {
                throw new Error("Payment SDK not loaded. Please refresh and try again.");
            }

            // 2. Open Razorpay Checkout
            const options = {
                key: checkoutKey,
                amount: data.amount,
                currency: "INR",
                name: "Doossh Marketplace",
                description: `Booking at ${data.restaurantName}`,
                order_id: data.orderId,
                handler: function (response: any) {
                    toast.success("Payment successful! Your booking is being confirmed.");
                    // Redirect or refresh
                    window.location.href = `/browse/restaurants/${restaurantId}/success?booking_id=${data.bookingId}`;
                },
                prefill: {
                    name: "",
                    email: "",
                },
                theme: {
                    color: "#000000",
                },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Book a Table</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                        id="date"
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Available Slots</Label>
                    <Select onValueChange={setSelectedSlot} value={selectedSlot}>
                        <SelectTrigger>
                            <SelectValue placeholder={slots.length > 0 ? "Choose a time" : "No slots available for this day"} />
                        </SelectTrigger>
                        <SelectContent>
                            {slots.map((slot) => (
                                <SelectItem key={slot.id} value={slot.id}>
                                    {slot.start_time} - {slot.end_time}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="guests">Number of Guests</Label>
                    <Input
                        id="guests"
                        type="number"
                        min="1"
                        max="20"
                        value={guestCount}
                        onChange={(e) => setGuestCount(parseInt(e.target.value))}
                    />
                </div>

                <Button
                    className="w-full"
                    disabled={loading || slots.length === 0}
                    onClick={handleBooking}
                >
                    {loading ? "Processing..." : "Continue to Payment"}
                </Button>
            </CardContent>
            {/* Script for Razorpay */}
            <script src="https://checkout.razorpay.com/v1/checkout.js" async />
        </Card>
    );
}
