import { createClient } from "@/utils/supabase/server";
import { DashboardHeader } from "@/components/dashboard-header";
import { RestaurantForm } from "@/components/restaurants/restaurant-form";
import { notFound, redirect } from "next/navigation";

interface EditRestaurantPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditRestaurantPage({ params }: EditRestaurantPageProps) {
    const { id } = await params;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: restaurant, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !restaurant) {
        notFound();
    }

    // Verify ownership? default RLS should handle it. but notFound is better UX than empty page.
    // Actually if RLS denies, error is returned. So notFound() covers it.

    return (
        <div className="space-y-6">
            <DashboardHeader
                heading="Edit Restaurant"
                text="Update your restaurant details."
            />
            <div className="grid gap-8">
                <RestaurantForm initialData={restaurant} />
            </div>
        </div>
    );
}
