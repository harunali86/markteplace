import { createClient } from "@/utils/supabase/server";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@doossh/ui";
import { LeadUnlockSheet } from "@/components/halls/lead-unlock-sheet";
import { Calendar, Users, IndianRupee } from "lucide-react";

export default async function HallLeadsPage() {
    const supabase = await createClient();

    // 1. Fetch leads (Note: In a real system, we might filter leads by relevance to this vendor's halls)
    let {
        data: { user },
    } = await supabase.auth.getUser();

    // Dev Bypass
    const isDevBypass = true;
    if (!user && isDevBypass) {
        user = { id: "dev-admin", email: "admin@doossh.dev" } as any;
    }

    if (!user) return null;
    const { data: leads } = await supabase
        .from("leads")
        .select(`
            *,
            lead_unlocks!left(id)
        `)
        .order("created_at", { ascending: false });

    // 2. Transform to include is_unlocked boolean
    const transformedLeads = leads?.map(lead => ({
        ...lead,
        is_unlocked: (lead.lead_unlocks as any[]).length > 0
    })) || [];

    return (
        <div className="space-y-6">
            <DashboardHeader
                heading="Party Hall Leads"
                text="Browse customer inquiries and unlock contact details for potential bookings."
            />

            <div className="grid gap-6">
                {transformedLeads.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center h-64 text-center">
                        <CardContent>
                            <Users className="h-10 w-10 text-muted-foreground mb-4 mx-auto" />
                            <h3 className="text-lg font-semibold">No leads yet</h3>
                            <p className="text-sm text-muted-foreground">Active inquiries will appear here as they come in.</p>
                        </CardContent>
                    </Card>
                ) : (
                    transformedLeads.map((lead) => (
                        <Card key={lead.id} className="relative overflow-hidden">
                            {!lead.is_unlocked && (
                                <div className="absolute top-0 right-0 p-2">
                                    <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-yellow-200">New Potential Lead</span>
                                </div>
                            )}
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center justify-between">
                                    <span>{lead.customer_name}</span>
                                    <LeadUnlockSheet lead={lead} onUnlock={() => { }} />
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        {new Date(lead.event_date!).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <IndianRupee className="h-4 w-4 mr-2" />
                                        {lead.budget_range || "N/A"}
                                    </div>
                                    <div className="text-sm truncate">
                                        <span className="text-muted-foreground">Reqs: </span>
                                        {lead.requirement_details || "None"}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
