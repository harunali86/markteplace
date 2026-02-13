import { createClient } from "../../../../../utils/supabase/server";
import { notFound } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@doossh/ui";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function BookingSuccessPage({
    params,
    searchParams
}: {
    params: { id: string },
    searchParams: { booking_id: string }
}) {
    const { id } = await params;
    const { booking_id } = await searchParams;

    const supabase = await createClient();

    const { data: booking, error } = await supabase
        .from("bookings")
        .select("*, restaurant:restaurants(name)")
        .eq("id", booking_id)
        .single();

    if (error || !booking) {
        notFound();
    }

    return (
        <div className="container max-w-2xl mx-auto py-20 px-4">
            <Card className="text-center">
                <CardHeader className="pt-10">
                    <div className="flex justify-center mb-4">
                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Booking Confirmed!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pb-10">
                    <p className="text-muted-foreground">
                        Thank you for booking with Doossh. Your table at <span className="font-semibold text-foreground">{booking.restaurant.name}</span> is reserved.
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm bg-muted/50 p-4 rounded-lg">
                        <div className="text-left">
                            <span className="text-muted-foreground block text-xs uppercase">Date</span>
                            <span className="font-medium">{booking.booking_date}</span>
                        </div>
                        <div className="text-left">
                            <span className="text-muted-foreground block text-xs uppercase">Guests</span>
                            <span className="font-medium">{booking.guest_count} Persons</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 py-4">
                        <Link href="/browse">
                            <Button variant="outline" className="w-full">Browse More Venues</Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button className="w-full">View My Bookings</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
