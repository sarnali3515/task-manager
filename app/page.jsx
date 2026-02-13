"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleGoToDashboard = (e) => {
    e.preventDefault();

    if (!session?.user) {
      router.push("/login");
      return;
    }

    const role = session.user.role;

    if (role === "admin") {
      router.push("/dashboard/admin");
    } else if (role === "user") {
      router.push("/dashboard/user");
    } else {
      router.push("/login");
    }
  };

  //  Auto redirect (button ছাড়াই)
  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) return;

    if (session.user.role === "admin") {
      router.push("/dashboard/admin");
    } else if (session.user.role === "user") {
      router.push("/dashboard/user");
    }
  }, [session, status, router]);

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
          Go to Dashboard
        </button>

        {/* Login Link */}
        {!session?.user && (
          <div className="mt-6 text-sm text-gray-500">
            <a href="/login" className="text-blue-600 hover:text-blue-800">
              Already have an account? Sign in
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
