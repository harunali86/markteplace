"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { createLeadSchema } from "@doossh/db";

export async function createLead(formData: FormData) {
    const supabase = await createClient();

    const rawData = {
        customer_name: formData.get("customer_name"),
        customer_phone: formData.get("customer_phone"),
        customer_email: formData.get("customer_email"),
        requirement_details: formData.get("requirement_details"),
        event_date: formData.get("event_date"),
        budget_range: formData.get("budget_range"),
    };

    const validated = createLeadSchema.parse(rawData);

    const { data, error } = await supabase
        .from("leads")
        .insert(validated)
        .select()
        .single();

    if (error) {
        console.error("Error creating lead:", error);
        return { error: error.message };
    }

    // Note: System-generated leads should trigger notifications to relevant hall owners
    return { success: true, data };
}

export async function unlockLead(leadId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // 1. Check if already unlocked
    const { data: existing } = await supabase
        .from("lead_unlocks")
        .select("id")
        .eq("lead_id", leadId)
        .single();

    if (existing) return { success: true, alreadyUnlocked: true };

    // 2. Placeholder: In real flow, this follows a successful Razorpay payment.
    // Here we'd verify the payment_id before inserting.

    // 3. For now, we assume a server action triggered post-webhook or for testing.
    // Real implementation uses the /api/webhooks/razorpay logic.
}
