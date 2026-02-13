"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Textarea } from "@doossh/ui";
import { createLead } from "../../app/(dashboard)/dashboard/halls/actions";
import { toast } from "sonner";
import { SendHorizontal } from "lucide-react";

interface LeadCaptureFormProps {
    hallId: string;
}

export function LeadCaptureForm({ hallId }: LeadCaptureFormProps) {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        try {
            const result = await createLead(formData);
            if (result.success) {
                toast.success("Requirements sent! We'll get back to you soon.");
                setSubmitted(true);
            } else {
                toast.error(result.error);
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }

    if (submitted) {
        return (
            <Card className="text-center py-10">
                <CardContent className="space-y-4">
                    <div className="mx-auto bg-green-100 text-green-600 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                        <SendHorizontal className="h-6 w-6" />
                    </div>
                    <CardTitle>Inquiry Sent!</CardTitle>
                    <p className="text-muted-foreground">Our team and the venue owners will reach out to you shortly.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg">Check Availability & Get Pricing</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-4">
                    <input type="hidden" name="hall_id" value={hallId} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="customer_name">Name</Label>
                            <Input id="customer_name" name="customer_name" placeholder="Your full name" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="customer_phone">Phone Number</Label>
                            <Input id="customer_phone" name="customer_phone" placeholder="9876543210" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="customer_email">Email (Optional)</Label>
                        <Input id="customer_email" name="customer_email" type="email" placeholder="john@example.com" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="event_date">Event Date</Label>
                            <Input id="event_date" name="event_date" type="date" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="budget_range">Budget Range</Label>
                            <Input id="budget_range" name="budget_range" placeholder="e.g. ₹50k - ₹1L" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="requirement_details">Tell us about your event</Label>
                        <Textarea
                            id="requirement_details"
                            name="requirement_details"
                            placeholder="Number of guests, food preferences, special requests..."
                            rows={3}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Sending..." : "Submit Inquiry"}
                    </Button>
                    <p className="text-[10px] text-center text-muted-foreground px-4">
                        By submitting, you agree to share your contact details with venue owners.
                    </p>
                </form>
            </CardContent>
        </Card>
    );
}
