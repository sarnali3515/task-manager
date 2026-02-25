import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req) {
    try {
        const { title, description, assigned_to } = await req.json();

        const { data, error } = await supabase
            .from("Tasks")
            .insert([
                {
                    title,
                    description,
                    assigned_to: assigned_to || null,
                    status: "pending",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}