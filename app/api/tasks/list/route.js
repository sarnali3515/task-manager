import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        const { data: users, error: usersError } = await supabase
            .from("profiles")
            .select("*")
            .neq("role", "admin");

        if (usersError) throw usersError;

        const { data: tasks, error: tasksError } = await supabase
            .from("Tasks")
            .select(`
                *,
                assigned_profile:profiles!assigned_to (
                    id,
                    name
                )
            `)
            .order("createdAt", { ascending: false });

        if (tasksError) throw tasksError;

        return NextResponse.json({ tasks, users });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}