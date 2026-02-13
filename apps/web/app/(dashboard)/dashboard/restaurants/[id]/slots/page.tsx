import { getTimeSlots } from "./actions";
import { SlotManager } from "@/components/dashboard/slot-manager";
import { getRestaurantById } from "@/lib/api/restaurants";
import { notFound } from "next/navigation";

export default async function RestaurantSlotsPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const restaurant = await getRestaurantById(id);

    if (!restaurant) {
        notFound();
    }

    const slots = await getTimeSlots(id);

    return (
        <div className="container mx-auto py-10">
            <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight">{restaurant.name}</h1>
                <p className="text-muted-foreground">Configure your available booking time slots and table capacity.</p>
            </div>

            <SlotManager restaurantId={id} initialSlots={slots} />
        </div>
    );
}
