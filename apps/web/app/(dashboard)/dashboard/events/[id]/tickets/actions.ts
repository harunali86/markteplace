"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { ticketTypeSchema } from "@doossh/db";

export async function createTicketType(formData: FormData) {
    const supabase = await createClient();

    const rawData = {
        event_id: formData.get("event_id"),
        name: formData.get("name"),
        price: parseFloat(formData.get("price") as string),
        capacity: parseInt(formData.get("capacity") as string),
    };

    const validated = ticketTypeSchema.omit({ id: true, created_at: true, sold_count: true }).parse(rawData);

    const { error } = await supabase
        .from("ticket_types")
        .insert(validated);

    if (error) {
        console.error("Error creating ticket type:", error);
        return { error: error.message };
    }

    revalidatePath(`/dashboard/events/${validated.event_id}`);
    return { success: true };
}

export async function deleteTicketType(id: string, eventId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("ticket_types")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting ticket type:", error);
        return { error: error.message };
    }

    revalidatePath(`/dashboard/events/${eventId}`);
    return { success: true };
}
