import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({
            success: false,
            error: { message: "No active session" }
        }, { status: 401 });
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    return NextResponse.json({
        success: true,
        data: {
            user_id: user.id,
            email: user.email,
            profile: profile || "Not created yet (Trigger pending?)",
            role: profile?.role || "customer (default)"
        }
    });
}
