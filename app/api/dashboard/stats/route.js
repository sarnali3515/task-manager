import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        // fetch tasks
        const { data: tasks, error: taskError } = await supabase
            .from("Tasks")
            .select("id, status");

        if (taskError) throw taskError;

        // fetch users (non-admin)
        const { data: users, error: usersError } = await supabase
            .from("profiles")
            .select("id")
            .neq("role", "admin");

        if (usersError) throw usersError;

        const totalTasks = tasks.length;
        const pendingTasks = tasks.filter(t => t.status === "pending").length;
        const completedTasks = tasks.filter(t => t.status === "done").length;

        return NextResponse.json({
            totalTasks,
            pendingTasks,
            completedTasks,
            totalUsers: users.length,
        });
    } catch (err) {
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}