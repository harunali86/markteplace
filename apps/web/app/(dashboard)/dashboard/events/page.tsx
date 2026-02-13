import { createClient } from "@/utils/supabase/server";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@doossh/ui";
import Link from "next/link";
import { Plus, Calendar, Ticket } from "lucide-react";

export default async function EventsPage() {
    const supabase = await createClient();
    let {
        data: { user },
    } = await supabase.auth.getUser();

    // Dev Bypass
    const isDevBypass = true;
    if (!user && isDevBypass) {
        user = { id: "dev-admin", email: "admin@doossh.dev" } as any;
    }

    if (!user) return null;
    const { data: events } = await supabase
        .from("events")
        .select("*, ticket_types(id)")
        .order("event_date", { ascending: true });

    return (
        <div className="space-y-6">
            <DashboardHeader
                heading="Nightclub Events"
                text="Create events and manage ticket inventory."
            >
                <Link href="/dashboard/events/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Event
                    </Button>
                </Link>
            </DashboardHeader>

            {!events?.length ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                    <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                        <Calendar className="h-10 w-10 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No events created</h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Launch your first event to start selling tickets.
                        </p>
                        <Link href="/dashboard/events/new">
                            <Button>Create Event</Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => (
                        <Card key={event.id} className="overflow-hidden flex flex-col">
                            <div className="aspect-[16/9] w-full bg-muted relative">
                                {event.cover_image && (
                                    <img src={event.cover_image} alt={event.name} className="absolute inset-0 w-full h-full object-cover" />
                                )}
                            </div>
                            <CardHeader className="flex-1">
                                <CardTitle className="line-clamp-1">{event.name}</CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(event.event_date).toLocaleDateString()} • {event.location}
                                </p>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex items-center text-sm mb-4">
                                    <Ticket className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span>{event.ticket_types?.length || 0} Ticket Tiers</span>
                                </div>
                                <div className="flex gap-2">
                                    <Link href={`/dashboard/events/${event.id}`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full">Edit</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
