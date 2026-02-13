"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { createClient } from "../../utils/supabase/server";

export async function login(formData: FormData) {
    const supabase = await createClient();

    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };

    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
        redirect("/login?error=" + error.message);
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        full_name: formData.get("full_name") as string,
    };

    // 1. Sign up user
    const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
            data: {
                full_name: data.full_name,
            }
        }
    });

    if (error) {
        redirect("/signup?error=" + error.message);
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
}

export async function forgotPassword(formData: FormData) {
    const supabase = await createClient();
    const email = formData.get("email") as string;
    const origin = (await headers()).get("origin");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/dashboard/settings/password`,
    });

    if (error) {
        redirect("/forgot-password?error=" + error.message);
    }

    redirect("/forgot-password?message=Check your email for the reset link");
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient();
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.updateUser({
        password: password,
    });

    if (error) {
        redirect("/dashboard/settings/password?error=" + error.message);
    }

    redirect("/dashboard/settings/password?message=Password updated successfully");
}
