"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (loading) return;

        setError("");
        setSuccess("");

        if (form.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const res = await fetchAPI("/api/auth/register", "POST", {
                name: form.name.trim(),
                email: form.email.toLowerCase().trim(),
                password: form.password,
            });

            setSuccess("Registration successful!");

            // Auto Login after register
            await signIn("credentials", {
                email: form.email,
                password: form.password,
                redirect: false,
            });

            router.push("/dashboard");


            setForm({
                name: "",
                email: "",
                password: "",
            });

        } catch (err) {
            setError(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow border border-gray-300 p-8">
                <h1 className="text-2xl font-bold text-center mb-6">
                    Create Account
                </h1>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-50 text-green-600 rounded text-sm">
                        {success}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <input
                        name="name"
                        type="text"
                        placeholder="Full Name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />

                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />

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
                        {loading ? "Creating..." : "Sign Up"}
                    </button>
                </form>

                <p className="text-center text-sm mt-6">
                    Already have an account?{" "}
                    <a href="/login" className="text-blue-600 font-medium">
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
}
