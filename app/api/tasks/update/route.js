import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function PUT(request) {
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

        // Parse request body
        const body = await request.json();
        const { taskId, updates } = body;

        if (!taskId) {
            return NextResponse.json(
                { error: "Task ID is required" },
                { status: 400 }
            );
        }

        if (!updates || Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: "No updates provided" },
                { status: 400 }
            );
        }

        // verify that the task belongs to this user
        const { data: existingTask, error: fetchError } = await supabase
            .from("Tasks")
            .select("assigned_to")
            .eq("id", taskId)
            .single();

        if (fetchError) {
            return NextResponse.json(
                { error: "Task not found" },
                { status: 404 }
            );
        }

        // Check if the task is assigned to the current user
        if (existingTask.assigned_to !== user.id) {
            return NextResponse.json(
                { error: "You don't have permission to update this task" },
                { status: 403 }
            );
        }

        // Update the task
        const { data: updatedTask, error: updateError } = await supabase
            .from("Tasks")
            .update({
                ...updates,
                updatedAt: new Date().toISOString()
            })
            .eq("id", taskId)
            .select()
            .single();

        if (updateError) {
            console.error("Error updating task:", updateError);
            return NextResponse.json(
                { error: "Failed to update task" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            task: updatedTask,
            message: "Task updated successfully"
        });

    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}