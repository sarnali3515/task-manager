"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function UserLayout({ children }) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);


    useEffect(() => {
        let isMounted = true;

        const getSession = async () => {
            const { data } = await supabase.auth.getSession();
            const userSession = data.session ?? null;

            if (!userSession) {
                if (isMounted) router.replace("/login");
                return;
            }

            const role = userSession.user.user_metadata?.role;

            console.log("UserLayout - Role from metadata:", role);

            if (!role || role !== "user") {

                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role, name")
                    .eq("id", userSession.user.id)
                    .single();

                console.log("UserLayout - Profile role:", profile?.role);

                if (profile?.role === "admin") {
                    if (isMounted) router.replace("/dashboard/admin");
                    return;
                }

                if (profile) {
                    await supabase.auth.updateUser({
                        data: { role: profile.role, name: profile.name }
                    });
                }
            }

            if (isMounted) {
                setUser(userSession.user.user_metadata?.name || userSession.user.email || "User");
                setSession(userSession);
                setLoading(false);
            }
        };

        getSession();

        const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            if (!newSession && isMounted) {
                router.replace("/login");
            } else if (newSession && isMounted) {
                setSession(newSession);
                setUser(newSession.user.user_metadata?.name || newSession.user.email || "User");
            }
        });

        return () => {
            isMounted = false;
            listener?.subscription.unsubscribe();
        };
    }, [router]);


    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-300">
                <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">T</span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-800">
                            Task Manager
                        </h1>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">
                {children}
            </main>
        </div>
    );
}