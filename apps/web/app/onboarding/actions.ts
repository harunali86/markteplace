"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../utils/supabase/server";

export async function createVendor(formData: FormData) {
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const category = formData.get("category") as string;

    const { error } = await supabase.rpc("create_vendor", {
        name,
        slug,
        category,
    });

    if (error) {
        redirect("/onboarding?error=" + encodeURIComponent(error.message));
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
}
