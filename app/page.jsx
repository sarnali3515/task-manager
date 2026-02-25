"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setLoading(false);

      if (data.session) {
        redirectToDashboard(data.session.user);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) redirectToDashboard(session.user);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const redirectToDashboard = (user) => {
    const role = user?.user_metadata?.role || "user";
    if (role === "admin") router.push("/dashboard/admin");
    else router.push("/dashboard/user");
  };

  const handleGoToDashboard = (e) => {
    e.preventDefault();
    if (!session) {
      router.push("/login");
    } else {
      redirectToDashboard(session.user);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <section className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto">
            <span className="text-white text-2xl font-bold">✓</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Welcome to Task Manager
        </h1>
        <p className="text-gray-600 mb-8">
          Your all-in-one solution for task management and team collaboration.
        </p>

        <button
          onClick={handleGoToDashboard}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </button>

        {!session && (
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