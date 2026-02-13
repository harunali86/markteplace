import { getHallById } from "@/lib/api/venues";
import { notFound } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@doossh/ui";
import { LeadCaptureForm } from "@/components/halls/lead-capture-form";
import Link from "next/link";
import { ChevronLeft, MapPin, Building2, Users, Maximize, Star } from "lucide-react";
import { Metadata } from "next";

interface HallPageProps {
    params: Promise<{
        id: string;
    }>;
}

export async function generateMetadata({ params }: HallPageProps): Promise<Metadata> {
    const { id } = await params;
    const hall = await getHallById(id);
    if (!hall) return { title: "Not Found" };
    return {
        title: `${hall.name} - Party Halls at Doossh`,
        description: hall.description,
    };
}

export default async function HallDetailPage({ params }: HallPageProps) {
    const { id } = await params;
    const hall = await getHallById(id);

    if (!hall) {
        notFound();
    }

    return (
        <div className="container py-8 max-w-7xl mx-auto px-4 space-y-8">
            <Link href="/browse?category=halls" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Party Halls
            </Link>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    {/* Hero Image */}
                    <div className="aspect-[16/9] w-full rounded-3xl bg-muted/50 relative overflow-hidden border shadow-2xl">
                        {hall.cover_image ? (
                            <img
                                src={hall.cover_image}
                                alt={hall.name}
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 text-muted-foreground">
                                <Building2 className="h-20 w-20 opacity-20" />
                            </div>
                        )}
                        <div className="absolute top-6 right-6">
                            <Badge className="bg-white/90 text-primary font-bold px-4 py-1.5 backdrop-blur-md border-none shadow-lg">
                                Starting ₹45,000
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-4xl font-black tracking-tight">{hall.name}</h1>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{hall.location || "Prime Location"}</span>
                                </div>
                                <div className="flex items-center gap-1 text-amber-500 font-bold">
                                    <Star className="h-4 w-4 fill-current" />
                                    <span>4.7 (120+ Reviews)</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="p-4 rounded-2xl bg-secondary/20 flex flex-col items-center justify-center text-center gap-1">
                                <Users className="h-5 w-5 text-primary" />
                                <p className="text-[10px] font-bold uppercase opacity-60">Capacity</p>
                                <p className="font-bold">{hall.capacity || "500+"} Guests</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-secondary/20 flex flex-col items-center justify-center text-center gap-1">
                                <Maximize className="h-5 w-5 text-primary" />
                                <p className="text-[10px] font-bold uppercase opacity-60">Area</p>
                                <p className="font-bold">2,500 sq.ft</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-secondary/20 flex flex-col items-center justify-center text-center gap-1">
                                <Building2 className="h-5 w-5 text-primary" />
                                <p className="text-[10px] font-bold uppercase opacity-60">Type</p>
                                <p className="font-bold">Banquet Hall</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold italic">Venue Description</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                {hall.description || "The perfect venue for weddings, corporate events, and grand celebrations. Our hall offers state-of-the-art facilities and elegant interiors to make your event memorable."}
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-3">
                                <h3 className="font-bold uppercase tracking-widest text-xs opacity-60">Amenities</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {["In-house Catering", "Decoration Included", "AC Hall", "Ample Parking", "Power Backup"].map(item => (
                                        <div key={item} className="flex items-center gap-2 text-sm">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="font-bold uppercase tracking-widest text-xs opacity-60">Facilities</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {["Bridal Room", "Audio System", "Projector", "Wi-Fi", "Security"].map(item => (
                                        <div key={item} className="flex items-center gap-2 text-sm">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="shadow-2xl border-primary/20 bg-gradient-to-b from-background to-secondary/10">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl font-black">Reserve the Date</CardTitle>
                            <p className="text-xs text-muted-foreground uppercase tracking-tighter">Submit your details to get an instant quote</p>
                        </CardHeader>
                        <CardContent>
                            <LeadCaptureForm hallId={hall.id} />
                            <div className="mt-6 pt-6 border-t border-dashed">
                                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase opacity-60 mb-2">
                                    <span>Quick Support</span>
                                    <span>Call Us</span>
                                </div>
                                <Button variant="outline" className="w-full text-xs font-bold rounded-xl h-10">
                                    Contact Venue Manager
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-6 rounded-3xl bg-primary text-primary-foreground space-y-3 shadow-xl shadow-primary/20">
                        <p className="text-sm font-bold italic opacity-90 italic">"Excellent venue for my daughter's wedding. The staff was very professional and the decor was stunning."</p>
                        <p className="text-[10px] font-black uppercase tracking-widest">— Rajesh Mehra</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
