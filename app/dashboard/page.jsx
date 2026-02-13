"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardRedirect() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.replace("/login");
            return;
        }

        if (session?.user?.role === "admin") {
            router.replace("/dashboard/admin");
        } else {
            router.replace("/dashboard/user");
        }
    }, [status, session, router]);

    return null;
}
