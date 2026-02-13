import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
    const cookieStore = await cookies();

    // For development/bypass mode, we use the service role to avoid RLS blocking the dev experience.
    const isDevBypass = true;
    const key = isDevBypass
        ? (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
        : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        key,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                    }
                },
            },
        }
    );
}
