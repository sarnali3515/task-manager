"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleGoToDashboard = (e: any) => {
    e.preventDefault();

    // Check if user is logged in
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (!token) {
      // Not logged in, redirect to login
      router.push("/login");
    } else {
      // Logged in, redirect based on role
      if (role === "admin") {
        router.push("/dashboard/admin");
      } else if (role === "user") {
        router.push("/dashboard/user");
      } else {
        // Invalid role, clear storage and redirect to login
        localStorage.clear();
        router.push("/login");
      }
    }
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center max-w-md mx-auto">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto">
            <span className="text-white text-2xl font-bold">✓</span>
          </div>
        </div>

        {/* Main Content */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Welcome to Task Manager
        </h1>

        <p className="text-gray-600 mb-8">
          Your all-in-one solution for task management and team collaboration.
        </p>

        {/* Dashboard Button */}
        <button
          onClick={handleGoToDashboard}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Go to Dashboard
        </button>

        {/* Login Link */}
        <div className="mt-6 text-sm text-gray-500">
          <a href="/login" className="text-blue-600 hover:text-blue-800">
            Already have an account? Sign in
          </a>
        </div>
      </div>
    </section>
  );
}