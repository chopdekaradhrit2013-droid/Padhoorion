"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, User, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshUser } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      await refreshUser();
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoId: string, demoPass: string) => {
    setIdentifier(demoId);
    setPassword(demoPass);
  };

  return (
    <div className="max-w-md mx-auto my-8 sm:my-12">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="PadhoOrion Logo"
            className="w-16 h-16 rounded-2xl object-contain mx-auto mb-3 shadow-sm border border-slate-200"
          />
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome to PadhoOrion
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Log in to access your notes, bookmarks, and school discussions.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Username or Email
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. Adhrit or student@padhoorion.edu"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-slate-400 hover:text-slate-700 absolute right-2.5 top-2.5"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Authenticating...
              </>
            ) : (
              "Sign In to PadhoOrion"
            )}
          </button>
        </form>

        {/* Demo Fast Login Pills */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
            One-Click Demo Logins
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoFill("Adhrit", "Student@123")}
              className="p-2.5 border border-slate-200 rounded-xl bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-200 text-slate-800 text-left transition-all"
            >
              <div className="font-bold text-slate-900">Adhrit</div>
              <div className="text-[10px] text-indigo-600 font-semibold">7th Grade Student</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoFill("principal_orion", "Admin@123")}
              className="p-2.5 border border-slate-200 rounded-xl bg-slate-50 hover:bg-rose-50/50 hover:border-rose-200 text-slate-800 text-left transition-all"
            >
              <div className="font-bold text-rose-700">Principal Orion</div>
              <div className="text-[10px] text-slate-500 font-semibold">School Admin</div>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500 font-medium">
          Don't have an account yet?{" "}
          <Link
            href="/register"
            className="font-bold text-indigo-600 hover:underline"
          >
            Register for Free
          </Link>
        </div>
      </div>
    </div>
  );
}
