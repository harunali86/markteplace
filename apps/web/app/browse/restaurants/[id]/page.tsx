import { getRestaurantById } from "../../../../lib/api/restaurants";
import { notFound } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@doossh/ui";
import { BookingForm } from "../../../../components/restaurants/booking-form";
import Link from "next/link";
import { ChevronLeft, MapPin, Utensils, DollarSign } from "lucide-react";
import { Metadata } from "next";

interface RestaurantPageProps {
    params: Promise<{
        id: string;
    }>;
}

export async function generateMetadata({ params }: RestaurantPageProps): Promise<Metadata> {
    const { id } = await params;
    const restaurant = await getRestaurantById(id);
    if (!restaurant) return { title: "Not Found" };
    return {
        title: `${restaurant.name} - Doossh`,
        description: restaurant.description,
    };
}

export default async function RestaurantDetailPage({ params }: RestaurantPageProps) {
    const { id } = await params;
    const restaurant = await getRestaurantById(id);

    if (!restaurant) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Browse
            </Link>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                    <div className="aspect-video w-full rounded-lg bg-muted/50 relative overflow-hidden border">
                        {restaurant.cover_image ? (
                            <img
                                src={restaurant.cover_image}
                                alt={restaurant.name}
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
                                No Image
                            </div>
                        )}
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="aspect-square w-24 shrink-0 rounded-md bg-muted/30 border" />
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{restaurant.name}</h1>
                        <p className="text-muted-foreground text-lg mt-2">{restaurant.description}</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Cuisine</CardTitle>
                                <Utensils className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{restaurant.cuisine_type || "Various"}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Price Range</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{restaurant.price_range}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-start space-x-2 text-sm">
                                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
                                <span>{restaurant.address || "No address provided"}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <span>Operated by</span>
                                <span className="font-medium text-foreground">{restaurant.vendor?.name}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <BookingForm restaurantId={restaurant.id} />

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button variant="outline" size="lg" className="w-full">
                                View Menu
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
