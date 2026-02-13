"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function UserLayout({ children }) {
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.replace("/login");
            return;
        }

        if (session?.user?.role !== "user") {
            router.replace("/dashboard/admin");
        }
    }, [status, session, router]);

    // Prevent UI flash before redirect
    if (status === "loading") {
        return null;
    }

    if (status === "unauthenticated") {
        return null;
    }

    if (session?.user?.role !== "user") {
        return null;
    }

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/login" });
    };

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
