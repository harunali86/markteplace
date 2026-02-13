import { DashboardHeader } from "@/components/dashboard-header";
import { RestaurantForm } from "@/components/restaurants/restaurant-form";

export default function NewRestaurantPage() {
    return (
        <div className="space-y-6">
            <DashboardHeader
                heading="Add Restaurant"
                text="Create a new restaurant listing."
            />
            <div className="grid gap-8">
                <RestaurantForm />
            </div>
        </div>
    );
}
