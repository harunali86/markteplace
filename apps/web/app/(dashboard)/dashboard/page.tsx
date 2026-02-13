import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Bypass check
    const isDevBypass = true;

    if (!user && !isDevBypass) {
        redirect("/login");
    }

    const currentUser = user;

    let role = "customer";
    if (!currentUser && isDevBypass) {
        role = "super_admin";
    } else if (currentUser) {
        // Fetch profile to get role
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", currentUser.id)
            .single();
        role = profile?.role || "customer";
    }

    if (role === "super_admin") {
        redirect("/dashboard/admin");
    }

    if (role === "vendor_admin") {
        // Vendors go to their specific CRUD landing (Restaurants for now)
        redirect("/dashboard/restaurants");
    }

    // Default for customers (can be a profile/orders page later)
    redirect("/");
}
