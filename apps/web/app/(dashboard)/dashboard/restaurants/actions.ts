"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createRestaurantSchema, updateRestaurantSchema } from "@doossh/db";
import { z } from "zod";

export async function createRestaurant(prevState: any, formData: FormData) {
    const supabase = await createClient();

    // 1. Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // 2. Resolve Vendor ID (Assume single vendor for now, or get from hidden field/context)
    // In a real multi-vendor scenario, we'd pick the active vendor from session/url
    // For MVP, we pick the first vendor the user owns/administers
    const { data: membership } = await supabase
        .from("vendor_memberships")
        .select("vendor_id")
        .eq("user_id", user.id)
        .single();

    if (!membership) {
        return { error: "You do not have a vendor profile." };
    }

    const vendorId = membership.vendor_id;

    // 3. Validate Input using shared Zod schema
    const rawData = {
        name: formData.get("name"),
        description: formData.get("description"),
        address: formData.get("address"),
        cuisine_type: formData.get("cuisine_type"),
        price_range: formData.get("price_range"),
        is_published: formData.get("is_published") === "on",
        cover_image: formData.get("cover_image"),
    };

    const validation = createRestaurantSchema.safeParse(rawData);

    if (!validation.success) {
        return { error: validation.error.flatten().fieldErrors };
    }

    // 4. Insert into DB
    const { error } = await supabase.from("restaurants").insert({
        ...validation.data,
        vendor_id: vendorId,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/dashboard/restaurants");
    redirect("/dashboard/restaurants");
}

export async function updateRestaurant(prevState: any, formData: FormData) {
    const supabase = await createClient();

    // 1. Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // 2. Validate Input
    const rawData = {
        id: formData.get("id"),
        name: formData.get("name"),
        description: formData.get("description"),
        address: formData.get("address"),
        cuisine_type: formData.get("cuisine_type"),
        price_range: formData.get("price_range"),
        is_published: formData.get("is_published") === "on",
        cover_image: formData.get("cover_image"),
    };

    const validation = updateRestaurantSchema.safeParse(rawData);

    if (!validation.success) {
        return { error: validation.error.flatten().fieldErrors };
    }

    // 3. Update DB (RLS will check permission)
    const { error } = await supabase
        .from("restaurants")
        .update(validation.data)
        .eq("id", validation.data.id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/dashboard/restaurants");
    redirect("/dashboard/restaurants");
}

export async function deleteRestaurant(formData: FormData) {
    const supabase = await createClient();
    const id = formData.get("id") as string;

    const { error } = await supabase
        .from("restaurants")
        .delete()
        .eq("id", id);

    if (error) {
        // We can't return logic to a form action easily if it's a simple button
        // So we might need to redirect with error param
        redirect("/dashboard/restaurants?error=" + encodeURIComponent(error.message));
    }

    revalidatePath("/dashboard/restaurants");
}
