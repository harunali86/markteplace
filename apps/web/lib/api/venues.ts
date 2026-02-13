import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

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
const VENUES_CACHE_TAG = "venues";

/**
 * Fetch all published restaurants.
 */
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

        return data;
    },
    ["published-restaurants"],
    {
        revalidate: 3600,
        tags: [VENUES_CACHE_TAG],
    }
);

/**
 * Fetch all published clubs/nightlife.
 */
export const getPublishedClubs = unstable_cache(
    async () => {
        const supabase = getPublicSupabaseClient();
        if (!supabase) return [];

        const { data, error } = await supabase
            .from("clubs")
            .select("*, vendor:vendors(name, slug, logo_url)")
            .eq("is_published", true)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching clubs:", error);
            return [];
        }

        return data;
    },
    ["published-clubs"],
    {
        revalidate: 3600,
        tags: [VENUES_CACHE_TAG],
    }
);

/**
 * Fetch all published party halls.
 */
export const getPublishedHalls = unstable_cache(
    async () => {
        const supabase = getPublicSupabaseClient();
        if (!supabase) return [];

        const { data, error } = await supabase
            .from("party_halls")
            .select("*, vendor:vendors(name, slug, logo_url)")
            .eq("is_published", true)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching party halls:", error);
            return [];
        }

        return data;
    },
    ["published-halls"],
    {
        revalidate: 3600,
        tags: [VENUES_CACHE_TAG],
    }
);

/**
 * Fetch a single club by ID.
 */
export async function getClubById(id: string) {
    const supabase = getPublicSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from("clubs")
        .select("*, vendor:vendors(name, slug, logo_url)")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching club by ID:", error);
        return null;
    }

    return data;
}

/**
 * Fetch a single party hall by ID.
 */
export async function getHallById(id: string) {
    const supabase = getPublicSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from("party_halls")
        .select("*, vendor:vendors(name, slug, logo_url)")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching party hall by ID:", error);
        return null;
    }

    return data;
}
