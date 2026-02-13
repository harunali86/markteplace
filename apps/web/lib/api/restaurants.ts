import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { type Restaurant } from "@doossh/db";

function getPublicSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
        console.error(
            "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
        );
        return null;
    }
    return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

// Cache Keys
const RESTAURANTS_CACHE_TAG = "restaurants";

export const getPublishedRestaurants = unstable_cache(
    async () => {
        const supabase = getPublicSupabaseClient();
        if (!supabase) return [];

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
        const supabase = getPublicSupabaseClient();
        if (!supabase) return null;

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
