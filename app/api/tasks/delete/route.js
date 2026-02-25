import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function DELETE(req) {
    try {
        const { taskId } = await req.json();

        const { error } = await supabase
            .from("Tasks")
            .delete()
            .eq("id", taskId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}