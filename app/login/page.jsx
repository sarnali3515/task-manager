"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (loading) return;

        setError("");
        setLoading(true);

        try {
            const res = await signIn("credentials", {
                email: form.email.toLowerCase().trim(),
                password: form.password,
                redirect: false,
            });

            if (res?.error) {
                setError("Invalid email or password");
                setLoading(false);
                return;
            }

            //  Important: Refresh session
            const session = await getSession();

            if (!session) {
                setError("Login failed. Please try again.");
                setLoading(false);
                return;
            }

            //  Role based redirect
            if (session.user.role === "admin") {
                router.push("/dashboard/admin");
            } else {
                router.push("/dashboard/user");
            }

        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome Back
                    </h1>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-300 p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                name="email"
                                type="email"
                                placeholder="abc@example.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 pr-12 text-black border border-gray-300 rounded-lg"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                        >
                            {loading ? "Logging in..." : "Log In"}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-300 text-center">
                        <p className="text-gray-600">
                            New here?{" "}
                            <a href="/register" className="text-blue-600 font-medium">
                                Register Now
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
