import { createClient } from "../../utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AppSidebar } from "../../components/app-sidebar";
import { UserNav } from "../../components/user-nav";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    let {
        data: { user },
    } = await supabase.auth.getUser();

    // DEVELOPMENT BYPASS: Force admin access if requested or during dev
    const isDevBypass = true; // Hardcoded as per user request "auth off karo"

    if (!user && isDevBypass) {
        // Mock user for UI purposes
        user = { id: "dev-admin", email: "admin@doossh.dev" } as any;
    }

    if (!user && !isDevBypass) {
        redirect("/login");
    }

    const currentUser = user!; // Guaranteed by the redirects above

    // Fetch profile to get role
    let role: string = "customer";
    if (currentUser.id === "dev-admin") {
        const headersList = await headers();
        const fullPath = headersList.get("x-url") || "";
        // fallback to super_admin unless specific vendor routes are hit
        role = "super_admin";

        // If we are on vendor routes, act as vendor_admin for the UI
        const vendorRoutes = ["/dashboard/restaurants", "/dashboard/events", "/dashboard/halls"];
        if (vendorRoutes.some(route => fullPath.includes(route))) {
            role = "vendor_admin";
        }
    } else {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", currentUser.id)
            .single();
        role = profile?.role || "customer";
    }

    // Validate access: If vendor_admin, must have membership. 
    if (role === "vendor_admin" && currentUser.id !== "dev-admin") {
        const { data: memberships } = await supabase
            .from("vendor_memberships")
            .select("id")
            .eq("user_id", currentUser.id)
            .limit(1);

        if (!memberships || memberships.length === 0) {
            redirect("/onboarding");
        }
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <AppSidebar className="w-64 hidden md:block" role={role as any} />
            <main className="flex-1 overflow-y-auto bg-muted/10">
                <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
                    <div className="flex-1 font-semibold text-lg uppercase tracking-wider text-primary/80">
                        {role === "super_admin" ? "Admin Control Center" : "Vendor B2B Operations"}
                    </div>
                    <UserNav />
                </header>
                <div className="p-6">{children}</div>
            </main>
        </div>
    );
}
