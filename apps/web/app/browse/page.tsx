import {
    getPublishedRestaurants,
    getPublishedClubs,
    getPublishedHalls
} from "../../lib/api/venues";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Badge
} from "@doossh/ui";
import Link from "next/link";
import { Metadata } from "next";
import { Utensils, Music, Building2, MapPin, Star, Calendar } from "lucide-react";

export const metadata: Metadata = {
    title: "Browse Venues - Doossh",
    description: "Explore the best restaurants, clubs, and party halls.",
};

interface BrowsePageProps {
    searchParams: Promise<{ category?: string }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
    const { category = "restaurants" } = await searchParams;

    // Fetch data based on active category
    let venues: any[] = [];
    if (category === "restaurants") {
        venues = await getPublishedRestaurants();
    } else if (category === "clubs") {
        venues = await getPublishedClubs();
    } else if (category === "halls") {
        venues = await getPublishedHalls();
    }

    const categories = [
        { id: "restaurants", label: "Restaurants", icon: Utensils },
        { id: "clubs", label: "Nightlife & Clubs", icon: Music },
        { id: "halls", label: "Party Halls", icon: Building2 },
    ];

    return (
        <div className="container py-8 max-w-7xl mx-auto px-4">
            {/* Hero Section */}
            <div className="flex flex-col items-center justify-center gap-4 text-center mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground">
                    Explore <span className="text-primary">Venues</span>
                </h1>
                <p className="max-w-[700px] text-lg text-muted-foreground">
                    Discover verified spots for dining, partying, and celebrating your special moments.
                </p>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-10 border-b pb-4">
                {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = category === cat.id;
                    return (
                        <Link key={cat.id} href={`/browse?category=${cat.id}`} scroll={false}>
                            <Button
                                variant={isActive ? "default" : "ghost"}
                                className={`rounded-full px-6 flex items-center gap-2 h-11 transition-all ${isActive ? "shadow-lg scale-105" : "hover:bg-secondary"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="font-semibold">{cat.label}</span>
                            </Button>
                        </Link>
                    );
                })}
            </div>

            {/* Venues Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {venues.length > 0 ? (
                    venues.map((venue) => (
                        <Card key={venue.id} className="group overflow-hidden border-0 bg-secondary/20 hover:bg-secondary/40 transition-all duration-300 hover:shadow-2xl flex flex-col h-full">
                            {/* Image Container */}
                            <div className="aspect-[16/10] w-full overflow-hidden relative">
                                <img
                                    src={venue.cover_image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800"}
                                    alt={venue.name}
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                {/* Badge Overlay */}
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <Badge className="bg-primary/90 text-primary-foreground border-0 backdrop-blur-md">
                                        {category === "restaurants" ? (venue.cuisine_type || "Dining") :
                                            category === "clubs" ? "Event" : "Venue"}
                                    </Badge>
                                </div>
                            </div>

                            <CardHeader className="flex-1 space-y-1 p-6">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                                        {venue.name}
                                    </CardTitle>
                                    <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span>4.8</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <MapPin className="w-3 h-3" />
                                    <span>{venue.location || "City Center"}</span>
                                </div>
                                <CardDescription className="mt-2 line-clamp-2 text-sm">
                                    {venue.description || "Experience premium service and a vibrant atmosphere at this curated location."}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-6 pt-0 mt-auto">
                                <div className="flex items-center justify-between border-t pt-4 border-primary/10">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                            {category === "halls" ? "Starts at" : "Avg. Price"}
                                        </span>
                                        <span className="text-lg font-black text-foreground">
                                            {category === "halls" ? "₹45,000" : (venue.price_range || "₹₹₹")}
                                        </span>
                                    </div>
                                    <Link href={`/browse/${category}/${venue.id}`}>
                                        <Button className="rounded-xl font-bold px-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all">
                                            {category === "clubs" ? "Get Tickets" :
                                                category === "halls" ? "Check Availability" : "Book Table"}
                                        </Button>
                                    </Link>
                                </div>

                                <div className="mt-4 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase">Verified Business</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
                            {category === "restaurants" ? <Utensils className="w-10 h-10 text-muted-foreground" /> :
                                category === "clubs" ? <Music className="w-10 h-10 text-muted-foreground" /> :
                                    <Building2 className="w-10 h-10 text-muted-foreground" />}
                        </div>
                        <h3 className="text-2xl font-bold">No {category} listed yet</h3>
                        <p className="text-muted-foreground max-w-sm">
                            We're currently onboarding premium {category} in your area. Check back soon for exciting updates!
                        </p>
                        <Link href="/browse?category=restaurants">
                            <Button variant="outline" className="mt-4">Back to Restaurants</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
