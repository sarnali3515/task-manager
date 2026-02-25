import { supabase } from "@/lib/supabase";

export const fetchAPI = async (url, method = "GET", data = null) => {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    if (!accessToken) {
        console.warn("No Supabase session found. Unauthorized API call:", url);
        throw new Error("Unauthorized");
    }

    const res = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        ...(data && { body: JSON.stringify(data) }),
    });

    let result = null;

    try {
        result = await res.json();
    } catch {
        // Response has no JSON body
    }

    if (!res.ok) {
        if (res.status === 401) {
            console.warn("Unauthorized API call:", url);
            throw new Error("Unauthorized");
        }
        throw new Error(result?.message || "Something went wrong");
    }

    return result;
};