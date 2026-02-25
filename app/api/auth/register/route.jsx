import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
    try {
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
            email: email.toLowerCase().trim(),
            password,
            options: {
                data: {
                    name: name.trim(),
                    role: "user",
                },
            },
        });

        if (signUpError) {
            return NextResponse.json(
                { error: signUpError.message },
                { status: 400 }
            );
        }

        if (!data?.user) {
            return NextResponse.json(
                { error: "User creation failed" },
                { status: 400 }
            );
        }

        // handle profile insert error
        const { error: profileError } = await supabase
            .from("profiles")
            .insert([
                {
                    id: data.user.id,
                    name: name.trim(),
                    role: "user",
                    email: email.toLowerCase().trim(),
                },
            ]);

        if (profileError) {
            console.error("Profile insert error:", profileError);

            return NextResponse.json(
                { error: profileError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Registration successful",
        });

    } catch (error) {
        console.error("Register error:", error);

        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}