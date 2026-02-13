"use client";

import { useState } from "react";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Badge
} from "@doossh/ui";
import { Ticket, Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

interface TicketPurchaseFormProps {
    clubId: string;
    events: any[];
}

export function TicketPurchaseForm({ clubId, events }: TicketPurchaseFormProps) {
    const [quantity, setQuantity] = useState(1);
    const [selectedEvent, setSelectedEvent] = useState(events?.[0]?.id);

    const handlePurchase = () => {
        toast.success(`Purchase of ${quantity} tickets initialized! Redirecting to payment...`);
        // Here we would call the checkout API
    };

    if (!events || events.length === 0) {
        return (
            <Card className="bg-muted/30 border-dashed">
                <CardContent className="py-6 text-center text-muted-foreground">
                    No upcoming events scheduled at this venue.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-xl border-primary/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-primary" /> Get Tickets
                </CardTitle>
                <CardDescription>Select an event and number of tickets.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Select Event</p>
                    <div className="grid gap-3">
                        {events.map((event) => (
                            <div
                                key={event.id}
                                onClick={() => setSelectedEvent(event.id)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedEvent === event.id
                                        ? "border-primary bg-primary/5 shadow-md"
                                        : "border-muted hover:border-primary/40"
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold">{event.title}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(event.start_time).toLocaleDateString()}</p>
                                    </div>
                                    <Badge variant="secondary">₹{event.price || "Free"}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between border-t pt-6">
                    <div className="space-y-1">
                        <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Quantity</p>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-lg font-black w-4 text-center">{quantity}</span>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => setQuantity(quantity + 1)}
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Amount</p>
                        <p className="text-2xl font-black text-primary">₹{(quantity * (events.find(e => e.id === selectedEvent)?.price || 0)).toLocaleString()}</p>
                    </div>
                </div>

                <Button className="w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-primary/20" onClick={handlePurchase}>
                    <ShoppingCart className="mr-2 h-5 w-5" /> Buy Tickets Now
                </Button>

                <p className="text-[10px] text-center text-muted-foreground">
                    Tickets will be sent to your registered email address upon successful payment.
                </p>
            </CardContent>
        </Card>
    );
}
