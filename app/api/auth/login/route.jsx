import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // Sign in 
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email.toLowerCase().trim(),
            password: password,
        });

        if (signInError) {
            return NextResponse.json(
                { error: signInError.message },
                { status: 401 }
            );
        }

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", authData.user.id)
            .single();

        if (profileError) {
            console.error("Profile fetch error:", profileError);
            return NextResponse.json(
                { error: "Failed to fetch user profile" },
                { status: 500 }
            );
        }

        const role = profileData?.role || "user";

        //  Update user metadata with role
        const { error: updateError } = await supabase.auth.updateUser({
            data: {
                role: role,
            }
        });

        if (updateError) {
            console.error("Error updating metadata:", updateError);

        }

        // Return response with redirect info
        return NextResponse.json({
            success: true,
            user: {
                id: authData.user.id,
                email: authData.user.email,
                role: role,
            },
            session: {
                access_token: authData.session?.access_token,
                refresh_token: authData.session?.refresh_token,
            },
            redirectTo: role === "admin" ? "/dashboard/admin" : "/dashboard/user"
        });

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}