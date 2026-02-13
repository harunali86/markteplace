import { getClubById } from "@/lib/api/venues";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@doossh/ui";
import { TicketPurchaseForm } from "@/components/clubs/ticketing-form";
import Link from "next/link";
import { ChevronLeft, MapPin, Music, Star, Calendar } from "lucide-react";
import { Metadata } from "next";

interface ClubPageProps {
    params: Promise<{
        id: string;
    }>;
}

export async function generateMetadata({ params }: ClubPageProps): Promise<Metadata> {
    const { id } = await params;
    const club = await getClubById(id);
    if (!club) return { title: "Not Found" };
    return {
        title: `${club.name} - Nightlife at Doossh`,
        description: club.description,
    };
}

export default async function ClubDetailPage({ params }: ClubPageProps) {
    const { id } = await params;
    const club = await getClubById(id);

    if (!club) {
        notFound();
    }

    const supabase = await createClient();
    const { data: events } = await supabase
        .from("events")
        .select("*")
        .eq("vendor_id", club.vendor_id)
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true });

    return (
        <div className="container py-8 max-w-7xl mx-auto px-4 space-y-8">
            <Link href="/browse?category=clubs" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Nightlife
            </Link>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    {/* Hero Image */}
                    <div className="aspect-[21/9] w-full rounded-3xl bg-muted/50 relative overflow-hidden border shadow-2xl">
                        {club.cover_image ? (
                            <img
                                src={club.cover_image}
                                alt={club.name}
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-muted-foreground">
                                <Music className="h-20 w-20 opacity-20" />
                            </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                            <div className="flex items-center gap-3 mb-2">
                                <Badge className="bg-primary hover:bg-primary border-none">Verified Nightlife</Badge>
                                <div className="flex items-center gap-1 text-amber-400 font-bold">
                                    <Star className="h-4 w-4 fill-current" />
                                    <span>4.9</span>
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{club.name}</h1>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold italic">About the Venue</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                {club.description || "Experience the most vibrant nightlife at this premium club. Featuring world-class audio-visuals and an unmatched atmosphere."}
                            </p>

                            <div className="flex flex-wrap gap-2 pt-4">
                                {["Electronic", "Premium Bar", "Valet Parking", "VIP Section"].map(tag => (
                                    <Badge key={tag} variant="secondary" className="px-3 py-1 bg-secondary/50">{tag}</Badge>
                                ))}
                            </div>
                        </div>

                        <Card className="bg-secondary/10 border-none shadow-inner">
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-primary shrink-0 mt-1" />
                                        <div>
                                            <p className="font-bold text-sm uppercase tracking-wider opacity-60">Location</p>
                                            <p className="text-foreground">{club.location || "City Center, Downtown"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-5 w-5 text-primary shrink-0 mt-1" />
                                        <div>
                                            <p className="font-bold text-sm uppercase tracking-wider opacity-60">Operating Hours</p>
                                            <p className="text-foreground">Daily 7:00 PM - 3:00 AM</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-primary/10">
                                    <p className="text-xs italic text-muted-foreground">Operated by {club.vendor?.name}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="space-y-6">
                    <TicketPurchaseForm clubId={club.id} events={events || []} />

                    <Card className="overflow-hidden border-dashed">
                        <CardHeader className="bg-muted/50 py-3">
                            <CardTitle className="text-xs uppercase tracking-[0.2em] font-black text-center">Entry Policy</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 text-xs space-y-2">
                            <p>• Age Limit: 21+ only (Valid ID required)</p>
                            <p>• Dress Code: Smart Casual / Party Wear</p>
                            <p>• Rights for admission reserved by management</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
