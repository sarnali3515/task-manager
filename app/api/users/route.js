import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export const GET = async () => {
    try {
        //current session
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;

        if (!session) {
            return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        // Fetch role of logged-in user
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

        if (profileError) throw profileError;

        if (profile.role !== "admin") {
            return new Response(JSON.stringify({ message: "Forbidden" }), { status: 403 });
        }

        // Fetch all users
        const { data: users, error: usersError } = await supabase
            .from("profiles")
            .select("id, name, email, role, created_at")
            .order("createdAt", { ascending: false });

        if (usersError) throw usersError;

        return new Response(JSON.stringify({ users }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ message: err.message }), { status: 500 });
    }
};