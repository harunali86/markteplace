"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, toast } from "@doossh/ui";
import { Ticket } from "lucide-react";

interface TicketType {
    id: string;
    name: string;
    price: number;
    capacity: number;
    sold_count: number;
}

export function TicketSelector({ eventId, ticketTypes, eventName }: { eventId: string; ticketTypes: TicketType[]; eventName: string }) {
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);

    const totalAmount = Object.entries(quantities).reduce((total, [id, qty]) => {
        const type = ticketTypes.find(t => t.id === id);
        return total + (type?.price || 0) * qty;
    }, 0);

    const totalTickets = Object.values(quantities).reduce((acc, qty) => acc + qty, 0);

    function updateQty(id: string, delta: number) {
        const type = ticketTypes.find(t => t.id === id);
        if (!type) return;

        const currentQty = quantities[id] || 0;
        const newQty = Math.max(0, Math.min(currentQty + delta, type.capacity - type.sold_count));

        setQuantities({ ...quantities, [id]: newQty });
    }

    async function handlePurchase() {
        if (totalTickets === 0) {
            toast.error("Please select at least one ticket");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/tickets/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    eventId,
                    items: Object.entries(quantities)
                        .filter(([_, qty]) => qty > 0)
                        .map(([ticketTypeId, quantity]) => ({ ticketTypeId, quantity })),
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Purchase failed");

            // Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: data.amount,
                currency: "INR",
                name: "Doossh Marketplace",
                description: `Tickets for ${eventName}`,
                order_id: data.orderId,
                handler: function (response: any) {
                    toast.success("Payment successful! Issuing your tickets...");
                    window.location.href = `/browse/events/${eventId}/success?order_id=${data.orderId}`;
                },
                prefill: { name: "", email: "" },
                theme: { color: "#000000" },
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
                <CardTitle className="text-xl flex items-center">
                    <Ticket className="mr-2 h-5 w-5" />
                    Buy Tickets
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    {ticketTypes.map((type) => (
                        <div key={type.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                                <p className="font-semibold">{type.name}</p>
                                <p className="text-sm text-primary font-medium">₹{type.price}</p>
                                {type.capacity - type.sold_count < 10 && (
                                    <p className="text-[10px] text-destructive font-bold uppercase mt-1">
                                        Only {type.capacity - type.sold_count} left!
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => updateQty(type.id, -1)}
                                    disabled={!quantities[type.id]}
                                >
                                    -
                                </Button>
                                <span className="w-4 text-center font-medium">{quantities[type.id] || 0}</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => updateQty(type.id, 1)}
                                    disabled={(quantities[type.id] || 0) >= (type.capacity - type.sold_count)}
                                >
                                    +
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-4 border-t space-y-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total</span>
                        <span>₹{totalAmount}</span>
                    </div>
                    <Button
                        className="w-full h-12 text-lg"
                        disabled={loading || totalTickets === 0}
                        onClick={handlePurchase}
                    >
                        {loading ? "Processing..." : `Get ${totalTickets} ${totalTickets === 1 ? 'Ticket' : 'Tickets'}`}
                    </Button>
                    <p className="text-[10px] text-center text-muted-foreground">
                        Non-refundable • One ticket per entry
                    </p>
                </div>
            </CardContent>
            <script src="https://checkout.razorpay.com/v1/checkout.js" async />
        </Card>
    );
}
