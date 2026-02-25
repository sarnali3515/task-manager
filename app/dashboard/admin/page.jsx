"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    ClipboardList,
    Clock,
    Users,
    CheckCircle,
    TrendingUp,
} from "lucide-react";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalTasks: 0,
        pendingTasks: 0,
        completedTasks: 0,
        totalUsers: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await fetch("/api/dashboard/stats");
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to load dashboard data");
            }

            setStats({
                totalTasks: data.totalTasks || 0,
                pendingTasks: data.pendingTasks || 0,
                completedTasks: data.completedTasks || 0,
                totalUsers: data.totalUsers || 0,
            });
        } catch (err) {
            console.error(err);
            setError(err.message);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center text-red-600">
                    <p className="text-lg font-semibold">Error</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                <p className="text-gray-600 mt-1">Welcome to your admin dashboard</p>
            </div>

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