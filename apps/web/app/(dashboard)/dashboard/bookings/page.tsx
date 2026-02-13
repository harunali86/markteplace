import { createClient } from "@/utils/supabase/server";
import { DashboardHeader } from "@/components/dashboard-header";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Badge,
    Card,
    CardContent
} from "@doossh/ui";
import { format } from "date-fns";

export default async function BookingsPage() {
    const supabase = await createClient();

    // Fetch all bookings for the vendor (RLS + Service Role Bypass handles filtering)
    const { data: bookings } = await supabase
        .from("bookings")
        .select(`
            *,
            restaurants(name),
            restaurant_time_slots(start_time, end_time),
            profiles(full_name, email)
        `)
        .order("booking_date", { ascending: false });

    return (
        <div className="space-y-6">
            <DashboardHeader
                heading="Reservation Management"
                text="View and manage all restaurant table bookings across your venues."
            />

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{bookings?.length || 0}</div>
                        <p className="text-xs text-muted-foreground uppercase">Total Reservations</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-emerald-600">
                            {bookings?.filter(b => b.status === "confirmed").length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground uppercase">Confirmed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-orange-500">
                            {bookings?.filter(b => b.status === "pending").length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground uppercase">Pending Action</p>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Venue</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Time Slot</TableHead>
                            <TableHead>Guests</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!bookings?.length ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No reservations found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            bookings.map((booking) => (
                                <TableRow key={booking.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell>
                                        <div className="font-medium">{booking.profiles?.full_name || "Guest"}</div>
                                        <div className="text-xs text-muted-foreground">{booking.profiles?.email}</div>
                                    </TableCell>
                                    <TableCell>{booking.restaurants?.name}</TableCell>
                                    <TableCell>{format(new Date(booking.booking_date), "MMM dd, yyyy")}</TableCell>
                                    <TableCell>
                                        {booking.restaurant_time_slots?.start_time.slice(0, 5)} - {booking.restaurant_time_slots?.end_time.slice(0, 5)}
                                    </TableCell>
                                    <TableCell className="font-semibold">{booking.guest_count}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            booking.status === "confirmed" ? "success" :
                                                booking.status === "pending" ? "warning" : "destructive"
                                        }>
                                            {booking.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
