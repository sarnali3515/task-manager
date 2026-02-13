"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Home,
    ClipboardList,
    LogOut,
    ChevronRight,
    Menu,
    X
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function AdminLayout({ children }) {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userName, setUserName] = useState("");
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.replace("/login");
            return;
        }

        if (session?.user?.role !== "admin") {
            router.replace("/dashboard/user");
            return;
        }

        setUserName(session.user.name || "Admin");
        setLoading(false);
    }, [session, status, router]);




    const handleLogout = async () => {
        await signOut({ callbackUrl: "/login" });
    };

    const menuItems = [
        { icon: <Home size={20} />, label: "Dashboard", href: "/dashboard/admin" },
        { icon: <ClipboardList size={20} />, label: "Tasks", href: "/dashboard/admin/tasks" },
    ];

    const handleNavigation = (path) => {
        router.push(path);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-600">
                Loading...
            </div>
        );
    }

    return (
        <div className="h-screen overflow-hidden bg-gray-50">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white border-b border-gray-300 shadow-sm">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100"
                        >
                            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <h1 className="text-xl font-semibold text-gray-800">Admin Panel</h1>
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Hi, {userName}</div>
                </div>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <aside
                    className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200
            transition-transform duration-300 lg:flex lg:flex-col
            h-screen lg:h-auto
          `}
                >
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-300">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">A</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                                <p className="text-xs text-gray-500">Control Center</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {menuItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    handleNavigation(item.href);
                                    setSidebarOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 
                           hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200
                           group"
                            >
                                <div className="text-gray-500 group-hover:text-blue-600">{item.icon}</div>
                                <span className="font-medium">{item.label}</span>
                                <ChevronRight
                                    size={16}
                                    className="ml-auto text-gray-400 group-hover:text-blue-600"
                                />
                            </button>
                        ))}
                    </nav>

                    {/* User Info & Logout */}
                    <div className="p-4 border-t border-gray-200 mt-auto">
                        <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-gray-50">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold">
                                    {userName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">{userName}</p>
                                <p className="text-xs text-gray-500">Administrator</p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 
                         bg-red-50 text-red-600 rounded-lg hover:bg-red-100 
                         transition-colors duration-200 font-medium"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </aside>

                {/* Overlay for mobile */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    {/* Desktop Header */}
                    <header className="hidden lg:block bg-white border-b border-gray-300 shadow-sm">
                        <div className="px-6 py-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Welcome back, {userName}
                                </h2>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                    Admin
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 p-4 lg:p-6 overflow-y-auto">{children}</main>
                </div>
            </div>
        </div>
    );
}
