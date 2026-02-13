import {
  getPublishedRestaurants,
  getPublishedClubs,
  getPublishedHalls
} from "../lib/api/venues";
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
import { Utensils, Music, Building2, ChevronRight, Star, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Doossh - Discover Top Restaurants & Events",
  description: "Book the best tables, buy tickets for clubs, and find party halls.",
};

export default async function LandingPage() {
  const [restaurants, clubs, halls] = await Promise.all([
    getPublishedRestaurants(),
    getPublishedClubs(),
    getPublishedHalls()
  ]);

  // Featured venues (taking top 3 from each)
  const featured = [
    ...restaurants.slice(0, 2).map(v => ({ ...v, type: 'restaurant' })),
    ...clubs.slice(0, 1).map(v => ({ ...v, type: 'club' })),
    ...halls.slice(0, 1).map(v => ({ ...v, type: 'hall' }))
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-extrabold text-2xl tracking-tighter text-primary italic">DOOSSH</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-muted-foreground">
              <Link href="/browse" className="transition-colors hover:text-primary">Browse All</Link>
              <Link href="/browse?category=restaurants" className="transition-colors hover:text-primary">Restaurants</Link>
              <Link href="/browse?category=clubs" className="transition-colors hover:text-primary">Nightlife</Link>
              <Link href="/browse?category=halls" className="transition-colors hover:text-primary">Party Halls</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-bold">Log in</Button>
            </Link>
            <Link href="/onboarding">
              <Button size="sm" className="font-bold shadow-lg shadow-primary/20">List Your Venue</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,#3b82f615_0%,transparent_100%)]" />
          <div className="container flex flex-col items-center gap-8 text-center px-4 max-w-[900px] mx-auto">
            <Badge variant="secondary" className="px-4 py-1 text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border-primary/20">
              The Ultimate Marketplace
            </Badge>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              Experience the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">Unforgettable</span>
            </h1>
            <p className="max-w-[600px] text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Find the perfect spot for every occasion. From VIP club experiences to royal ballroom celebrations and fine dining.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
              <Link href="/browse">
                <Button size="lg" className="h-14 px-8 text-lg font-black rounded-2xl shadow-xl shadow-primary/30">
                  Browse Marketplace
                </Button>
              </Link>
              <Link href="/onboarding">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-black rounded-2xl border-2">
                  Partner with Us
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Verticals Cards */}
        <section className="container px-4 max-w-7xl mx-auto py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CategoryActionCard
              title="Dine"
              desc="Book tables at top restaurants"
              icon={<Utensils className="w-8 h-8" />}
              href="/browse?category=restaurants"
              color="from-orange-500 to-red-500"
            />
            <CategoryActionCard
              title="Party"
              desc="VIP tickets for premier clubs"
              icon={<Music className="w-8 h-8" />}
              href="/browse?category=clubs"
              color="from-purple-500 to-indigo-600"
            />
            <CategoryActionCard
              title="Celebrate"
              desc="Discover magnificent party halls"
              icon={<Building2 className="w-8 h-8" />}
              href="/browse?category=halls"
              color="from-emerald-500 to-teal-600"
            />
          </div>
        </section>

        {/* Featured Section */}
        <section className="container px-4 max-w-7xl mx-auto py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl font-black sm:text-4xl md:text-5xl">
                Featured <span className="text-primary italic">Spots</span>
              </h2>
              <p className="text-muted-foreground mt-4 text-lg">
                Curated premium experiences across our marketplace verticals.
              </p>
            </div>
            <Link href="/browse">
              <Button variant="link" className="font-bold text-primary p-0 h-auto text-lg group">
                View All Venues <ChevronRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.length > 0 ? (
              featured.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-20 bg-secondary/10 rounded-3xl border-2 border-dashed">
                Be the first to list on Doossh.
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t bg-secondary/5 py-12 md:py-24">
        <div className="container px-4 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
            <div className="col-span-2 lg:col-span-2 space-y-4">
              <h3 className="text-2xl font-black italic text-primary tracking-tighter">DOOSSH</h3>
              <p className="text-muted-foreground max-w-xs">
                The world's first integrated marketplace for dining, nightlife, and celebrations. Premium venues, verified experiences.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Partners</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/onboarding" className="hover:text-primary transition-colors">List Venue</Link></li>
                <li><Link href="/dashboard/vendor" className="hover:text-primary transition-colors">Vendor Portal</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <p>© 2026 Doossh Marketplace Inc. All rights reserved.</p>
            <div className="flex gap-4">
              <span>English (US)</span>
              <span>INR (₹)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CategoryActionCard({ title, desc, icon, href, color }: any) {
  return (
    <Link href={href} className="group relative overflow-hidden rounded-3xl p-8 border hover:border-primary/50 transition-all hover:bg-secondary/20">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity blur-2xl font-black animate-pulse`} />
      <div className="relative space-y-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
        <div>
          <h3 className="text-2xl font-bold">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{desc}</p>
        </div>
        <div className="pt-2">
          <div className="text-primary font-bold text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Explore <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function VenueCard({ venue }: any) {
  return (
    <Link href={`/browse/${venue.type === 'restaurant' ? 'restaurants' : venue.type === 'club' ? 'clubs' : 'halls'}/${venue.id}`} className="group flex flex-col h-full bg-secondary/10 rounded-3xl overflow-hidden hover:bg-secondary/30 transition-all hover:shadow-2xl">
      <div className="aspect-[11/10] overflow-hidden relative">
        <img
          src={venue.cover_image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800"}
          alt={venue.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-black/50 backdrop-blur-md text-white border-white/20 capitalize font-bold text-[10px] tracking-wider py-1 px-3">
            {venue.type}
          </Badge>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{venue.name}</h4>
          <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
            <Star className="w-3 h-3 fill-current" />
            <span>4.9</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium mb-3">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{venue.address || venue.location || "City Center"}</span>
        </div>
        <div className="mt-auto pt-3 border-t border-primary/5 flex items-center justify-between">
          <span className="text-sm font-black">{venue.price_range || venue.entry_fee ? `₹${venue.entry_fee}` : "₹₹₹"}</span>
          <span className="text-[10px] font-bold text-primary uppercase underline underline-offset-4">Book Now</span>
        </div>
      </div>
    </Link>
  );
}
