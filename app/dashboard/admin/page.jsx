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

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalTasks: 0,
        pendingTasks: 0,
        completedTasks: 0,
        totalUsers: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch tasks
            const tasksRes = await fetchAPI("/api/tasks/list");
            const tasks = tasksRes.tasks || [];

            // Fetch users
            const usersRes = await fetchAPI("/api/users");
            const users = usersRes.users || [];

            // Calculate stats
            const pendingTasks = tasks.filter(task => task.status === 'pending').length;
            const completedTasks = tasks.filter(task => task.status === 'done').length;

            setStats({
                totalTasks: tasks.length,
                pendingTasks,
                completedTasks,
                totalUsers: users.length
            });

        } catch (error) {
            console.error("Failed to load dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon, color, trend }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${color}`}>
                    {icon}
                </div>
                {trend && (
                    <div className="flex items-center text-sm text-green-600">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {trend}
                    </div>
                )}
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{loading ? "..." : value}</h3>
            <p className="text-gray-600">{title}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Hello Admin </h2>

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
                    trend={stats.totalTasks > 0 ? `${Math.round((stats.pendingTasks / stats.totalTasks) * 100)}%` : null}
                />

                <StatCard
                    title="Completed"
                    value={stats.completedTasks}
                    icon={<CheckCircle className="w-6 h-6 text-green-600" />}
                    color="bg-green-50"
                    trend={stats.totalTasks > 0 ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}%` : null}
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