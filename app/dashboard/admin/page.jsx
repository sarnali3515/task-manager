"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import {
    ClipboardList,
    Clock,
    Users,
    CheckCircle,
    TrendingUp,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [stats, setStats] = useState({
        totalTasks: 0,
        pendingTasks: 0,
        completedTasks: 0,
        totalUsers: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Redirect if not logged in or not admin
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && session.user.role !== "admin") {
            router.push("/dashboard/user");
        }
    }, [status, session, router]);

    useEffect(() => {
        if (status === "authenticated" && session.user.role === "admin") {
            loadDashboardData();
        }
    }, [status, session]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError("");

            // Fetch tasks (NextAuth session cookie will handle auth)
            const tasksRes = await fetchAPI("/api/tasks/list");
            const tasks = tasksRes.tasks || [];

            // Fetch users
            const usersRes = await fetchAPI("/api/users");
            const users = usersRes.users || [];

            // Calculate stats
            const pendingTasks = tasks.filter((t) => t.status === "pending").length;
            const completedTasks = tasks.filter((t) => t.status === "done").length;

            setStats({
                totalTasks: tasks.length,
                pendingTasks,
                completedTasks,
                totalUsers: users.length,
            });
        } catch (err) {
            console.error("Failed to load dashboard data:", err);
            setError("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon, color, trend }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
                {trend && (
                    <div className="flex items-center text-sm text-green-600">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {trend}
                    </div>
                )}
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {loading ? "..." : value}
            </h3>
            <p className="text-gray-600">{title}</p>
        </div>
    );

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-600">Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen text-red-600">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Hello Admin</h2>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Tasks"
                    value={stats.totalTasks}
                    icon={<ClipboardList className="w-6 h-6 text-blue-600" />}
                    color="bg-blue-50"
                />

                <StatCard
                    title="Pending Tasks"
                    value={stats.pendingTasks}
                    icon={<Clock className="w-6 h-6 text-yellow-600" />}
                    color="bg-yellow-50"
                    trend={
                        stats.totalTasks > 0
                            ? `${Math.round((stats.pendingTasks / stats.totalTasks) * 100)}%`
                            : null
                    }
                />

                <StatCard
                    title="Completed"
                    value={stats.completedTasks}
                    icon={<CheckCircle className="w-6 h-6 text-green-600" />}
                    color="bg-green-50"
                    trend={
                        stats.totalTasks > 0
                            ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}%`
                            : null
                    }
                />

                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={<Users className="w-6 h-6 text-purple-600" />}
                    color="bg-purple-50"
                />
            </div>
        </div>
    );
}
