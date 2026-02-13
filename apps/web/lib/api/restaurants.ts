import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { type Restaurant } from "@doossh/db";

// Use a direct client for public data to allow for static generation
// This avoids using cookies() which opts into dynamic rendering and fails at build time in caches
const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Cache Keys
const RESTAURANTS_CACHE_TAG = "restaurants";

export const getPublishedRestaurants = unstable_cache(
    async () => {
        const { data, error } = await supabase
            .from("restaurants")
            .select("*, vendor:vendors(name, slug, logo_url)")
            .eq("is_published", true)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching restaurants:", error);
            return [];
        }

        return data as (Restaurant & { vendor: { name: string; slug: string; logo_url?: string } })[];
    },
    ["published-restaurants"],
    {
        revalidate: 3600, // 1 hour
        tags: [RESTAURANTS_CACHE_TAG],
    }
);

export const getRestaurantById = unstable_cache(
    async (id: string) => {
        const { data, error } = await supabase
            .from("restaurants")
            .select("*, vendor:vendors(name, slug, logo_url)")
            .eq("id", id)
            .eq("is_published", true)
            .single();

        if (error) {
            return null;
        }

        return data as (Restaurant & { vendor: { name: string; slug: string; logo_url?: string } });
    },
    ["restaurant-details"],
    {
        revalidate: 3600,
        tags: [RESTAURANTS_CACHE_TAG],
    }
);
