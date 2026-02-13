import { createClient } from "@/utils/supabase/server";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@doossh/ui";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function RestaurantsPage() {
    const supabase = await createClient();
    let {
        data: { user },
    } = await supabase.auth.getUser();

    // Dev Bypass
    const isDevBypass = true;
    if (!user && isDevBypass) {
        user = { id: "dev-admin", email: "admin@doossh.dev" } as any;
    }

    if (!user) return null;

    // Fetch Restaurants (RLS will filter by vendor membership)
    const { data: restaurants } = await supabase
        .from("restaurants")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-6">
            <DashboardHeader
                heading="Restaurants"
                text="Manage your restaurant listings and bookings."
            >
                <Link href="/dashboard/restaurants/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Restaurant
                    </Button>
                </Link>
            </DashboardHeader>

            {!restaurants?.length ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
                    <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                        <h3 className="mt-4 text-lg font-semibold">No restaurants added</h3>
                        <p className="mb-4 mt-2 text-sm text-muted-foreground">
                            You haven't created any restaurants yet. Add one to start accepting bookings.
                        </p>
                        <Link href="/dashboard/restaurants/new">
                            <Button>Add Restaurant</Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {restaurants.map((restaurant) => (
                        <Card key={restaurant.id} className="h-full hover:bg-muted/50 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    <Link href={`/dashboard/restaurants/${restaurant.id}`} className="hover:underline">
                                        {restaurant.name}
                                    </Link>
                                </CardTitle>
                                {restaurant.is_published ? (
                                    <span className="flex h-2 w-2 rounded-full bg-green-500" />
                                ) : (
                                    <span className="flex h-2 w-2 rounded-full bg-slate-300" />
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{restaurant.cuisine_type || "N/A"}</div>
                                <p className="text-xs text-muted-foreground truncate mb-4">
                                    {restaurant.address}
                                </p>
                                <div className="flex gap-2">
                                    <Link href={`/dashboard/restaurants/${restaurant.id}`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full">Edit</Button>
                                    </Link>
                                    <Link href={`/dashboard/restaurants/${restaurant.id}/slots`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full">Slots</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
