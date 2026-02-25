import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(req) {
    try {
        const { taskId, userId } = await req.json();

        const { error } = await supabase
            .from("Tasks")
            .update({ assigned_to: userId || null })
            .eq("id", taskId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}