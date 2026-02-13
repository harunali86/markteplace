import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { EventForm } from "@/components/events/event-form";
import { TicketTypeManager } from "@/components/events/ticket-type-manager";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: event } = await supabase
        .from("events")
        .select("*, ticket_types(*)")
        .eq("id", id)
        .single();

    if (!event) {
        notFound();
    }

    return (
        <div className="space-y-10">
            <div className="space-y-6">
                <DashboardHeader
                    heading="Edit Event"
                    text="Update your event information and visibility."
                />
                <EventForm initialData={event} />
            </div>

            <div className="space-y-6 border-t pt-10">
                <DashboardHeader
                    heading="Ticket Management"
                    text="Define the different ticket tiers and pricing for this event."
                />
                <TicketTypeManager eventId={event.id} initialTypes={event.ticket_types || []} />
            </div>
        </div>
    );
}
