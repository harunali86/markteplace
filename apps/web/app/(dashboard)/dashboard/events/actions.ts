"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { eventSchema } from "@doossh/db/schema";

export async function createEvent(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const rawData = {
        vendor_id: formData.get("vendor_id"),
        name: formData.get("name"),
        description: formData.get("description"),
        event_date: formData.get("event_date"),
        location: formData.get("location"),
        cover_image: formData.get("cover_image") || "",
        is_published: formData.get("is_published") === "true",
    };

    const validated = eventSchema.omit({ id: true, created_at: true, updated_at: true }).parse(rawData);

    const { data, error } = await supabase
        .from("events")
        .insert(validated)
        .select()
        .single();

    if (error) {
        console.error("Error creating event:", error);
        return { error: error.message };
    }

    revalidatePath("/dashboard/events");
    return { success: true, data };
}

export async function updateEvent(id: string, formData: FormData) {
    const supabase = await createClient();

    const rawData = {
        name: formData.get("name"),
        description: formData.get("description"),
        event_date: formData.get("event_date"),
        location: formData.get("location"),
        cover_image: formData.get("cover_image"),
        is_published: formData.get("is_published") === "true",
    };

    const { error } = await supabase
        .from("events")
        .update(rawData)
        .eq("id", id);

    if (error) {
        console.error("Error updating event:", error);
        return { error: error.message };
    }

    revalidatePath("/dashboard/events");
    revalidatePath(`/dashboard/events/${id}`);
    return { success: true };
}

export async function deleteEvent(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting event:", error);
        return { error: error.message };
    }

    revalidatePath("/dashboard/events");
    return { success: true };
}
