"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { restaurantTimeSlotSchema } from "@doossh/db/schema";
import { z } from "zod";

const createSlotSchema = restaurantTimeSlotSchema.omit({ id: true, created_at: true });

export async function createTimeSlot(formData: FormData) {
    const supabase = await createClient();

    const rawData = {
        restaurant_id: formData.get("restaurant_id"),
        day_of_week: parseInt(formData.get("day_of_week") as string),
        start_time: formData.get("start_time"),
        end_time: formData.get("end_time"),
        capacity: parseInt(formData.get("capacity") as string),
    };

    const validated = createSlotSchema.parse(rawData);

    const { error } = await supabase
        .from("restaurant_time_slots")
        .insert(validated);

    if (error) {
        console.error("Error creating time slot:", error);
        return { error: error.message };
    }

    revalidatePath(`/dashboard/restaurants/${validated.restaurant_id}/slots`);
    return { success: true };
}

export async function deleteTimeSlot(id: string, restaurantId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("restaurant_time_slots")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting time slot:", error);
        return { error: error.message };
    }

    revalidatePath(`/dashboard/restaurants/${restaurantId}/slots`);
    return { success: true };
}

export async function getTimeSlots(restaurantId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("restaurant_time_slots")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });

    if (error) {
        console.error("Error fetching slots:", error);
        return [];
    }
    return data;
}
