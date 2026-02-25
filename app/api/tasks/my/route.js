import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        // Get the authorization header
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: "Unauthorized - No token provided" },
                { status: 401 }
            );
        }

        // Extract the token
        const token = authHeader.split(' ')[1];

        // Verify the user with the token
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user) {
            return NextResponse.json(
                { error: "Unauthorized - Invalid token" },
                { status: 401 }
            );
        }

        // Fetch tasks assigned to this user
        const { data: tasks, error: tasksError } = await supabase
            .from("Tasks")
            .select("*")
            .eq("assigned_to", user.id)
            .order("createdAt", { ascending: false });

        if (tasksError) {
            console.error("Error fetching tasks:", tasksError);
            return NextResponse.json(
                { error: "Failed to fetch tasks" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            tasks: tasks || [],
            userId: user.id
        });

    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}