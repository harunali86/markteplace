import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";

export async function POST() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({
            success: false,
            error: { message: "No active session" }
        }, { status: 401 });
    }

    // Promote user to super_admin
    const { error } = await supabase
        .from("profiles")
        .update({ role: "super_admin" })
        .eq("id", user.id);

    if (error) {
        return NextResponse.json({ success: false, error }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        message: "User promoted to super_admin successfully. Please re-login or refresh to see Admin Panel.",
        user_id: user.id
    });
}
