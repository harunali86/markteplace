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
import { Ticket, CreditCard } from "lucide-react";

export default async function TicketsPage() {
    const supabase = await createClient();

    // Fetch all ticket orders for the vendor
    const { data: tickets } = await supabase
        .from("tickets")
        .select(`
            *,
            ticket_types(name, price),
            orders(status, total_amount),
            profiles(full_name, email)
        `)
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-6">
            <DashboardHeader
                heading="Ticket Sales"
                text="Track and manage club event ticket sales and customer entry."
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-primary">
                    <CardContent className="pt-6 flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold">{tickets?.length || 0}</div>
                            <p className="text-xs text-muted-foreground uppercase">Tickets Sold</p>
                        </div>
                        <Ticket className="h-8 w-8 text-primary/20" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-emerald-600">
                                ₹{tickets?.reduce((acc, t) => acc + (t.ticket_types?.price || 0), 0).toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground uppercase">Gross Revenue</p>
                        </div>
                        <CreditCard className="h-8 w-8 text-emerald-500/20" />
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-md border bg-card overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Ticket Type</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Purchase Date</TableHead>
                            <TableHead>Ticket Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!tickets?.length ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No ticket sales found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            tickets.map((ticket) => (
                                <TableRow key={ticket.id}>
                                    <TableCell>
                                        <div className="font-medium">{ticket.profiles?.full_name}</div>
                                        <div className="text-xs text-muted-foreground">{ticket.profiles?.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{ticket.ticket_types?.name}</Badge>
                                    </TableCell>
                                    <TableCell className="font-semibold">₹{ticket.ticket_types?.price}</TableCell>
                                    <TableCell>{format(new Date(ticket.created_at), "MMM dd, hh:mm a")}</TableCell>
                                    <TableCell>
                                        <Badge variant={ticket.status === "active" ? "success" : "secondary"}>
                                            {ticket.status}
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
