import { redirect } from "next/navigation";
import { createClient } from "../../utils/supabase/server";

export default async function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Check if user already has a vendor membership
    const { data: memberships } = await supabase
        .from("vendor_memberships")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

    if (memberships && memberships.length > 0) {
        redirect("/dashboard");
    }

    return <>{children}</>;
}
