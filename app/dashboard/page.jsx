"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
    const router = useRouter();

    useEffect(() => {
        const redirectBasedOnRole = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.replace("/login");
                return;
            }

            // Metadata
            const role = session.user?.user_metadata?.role;

            if (role === "admin") {
                router.replace("/dashboard/admin");
            } else {
                router.replace("/dashboard/user");
            }
        };

        redirectBasedOnRole();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Redirecting...</p>
        </div>
    );
}