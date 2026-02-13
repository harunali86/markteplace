import { createClient } from "@/utils/supabase/server";
import { DashboardHeader } from "@/components/dashboard-header";
import { EventForm } from "@/components/events/event-form";

export default async function NewEventPage() {
    const supabase = await createClient();

    // Get the vendor for the current user
    const { data: memberships } = await supabase
        .from("vendor_memberships")
        .select("vendor_id")
        .limit(1)
        .single();

    return (
        <div className="space-y-6">
            <DashboardHeader
                heading="Create Event"
                text="Set the date, location and design for your event poster."
            />
            <div className="grid gap-8">
                <EventForm vendorId={memberships?.vendor_id} />
            </div>
        </div>
    );
}
