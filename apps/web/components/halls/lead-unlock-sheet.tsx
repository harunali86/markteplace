"use client";

import { useState } from "react";
import { Button, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, toast } from "@doossh/ui";
import { Lock, Unlock, Phone, Mail, User } from "lucide-react";

interface Lead {
    id: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    requirement_details?: string;
    event_date?: string;
    budget_range?: string;
    is_unlocked?: boolean;
}

export function LeadUnlockSheet({ lead, onUnlock }: { lead: Lead; onUnlock: (id: string) => void }) {
    const [loading, setLoading] = useState(false);

    async function handleUnlock() {
        setLoading(true);
        try {
            // 1. Create Unlock Intent (Razorpay Order)
            const response = await fetch("/api/leads/unlock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leadId: lead.id }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            // 2. Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: data.amount,
                currency: "INR",
                name: "Doossh Marketplace",
                description: `Unlock Lead: ${lead.customer_name}`,
                order_id: data.orderId,
                handler: function (response: any) {
                    toast.success("Lead unlocked successfully!");
                    onUnlock(lead.id);
                    window.location.reload(); // Refresh to show masked data (RLS will handle this)
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
        <Sheet>
            <SheetTrigger asChild>
                <Button variant={lead.is_unlocked ? "outline" : "default"} size="sm">
                    {lead.is_unlocked ? <Unlock className="h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                    {lead.is_unlocked ? "View Details" : "Unlock Lead"}
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Lead Details</SheetTitle>
                    <SheetDescription>
                        {lead.is_unlocked
                            ? "Full contact information for this inquiry."
                            : "Pay a nominal fee to unlock full contact details for this lead."}
                    </SheetDescription>
                </SheetHeader>

                <div className="py-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Customer Name</p>
                                <p className="font-medium">{lead.customer_name}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Phone className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Phone Number</p>
                                <p className="font-medium">
                                    {lead.is_unlocked ? lead.customer_phone : "987XXXXXXX"}
                                </p>
                            </div>
                        </div>

                        {lead.customer_email && (
                            <div className="flex items-center space-x-3">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Email Address</p>
                                    <p className="font-medium">
                                        {lead.is_unlocked ? lead.customer_email : "j****@example.com"}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                        <h4 className="text-sm font-semibold uppercase text-xs text-muted-foreground tracking-wider">Event Information</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase">Date</p>
                                <p className="text-sm font-medium">{lead.event_date || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase">Budget</p>
                                <p className="text-sm font-medium">{lead.budget_range || "N/A"}</p>
                            </div>
                        </div>
                        <div className="pt-2">
                            <p className="text-[10px] text-muted-foreground uppercase">Requirements</p>
                            <p className="text-sm">{lead.requirement_details || "No specific requirements mentioned."}</p>
                        </div>
                    </div>

                    {!lead.is_unlocked && (
                        <div className="pt-4">
                            <Button className="w-full" onClick={handleUnlock} disabled={loading}>
                                {loading ? "Processing..." : "Pay ₹99 to Unlock"}
                            </Button>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
