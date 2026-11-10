"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, AlertCircle, ShieldCheck, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">(
    token ? "idle" : user?.isVerified ? "success" : "idle"
  );
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      handleVerify(token);
    }
  }, [token]);

  const handleVerify = async (tok?: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tok }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setStatus("success");
      setMessage(data.message);
      await refreshUser();
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Failed to verify email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 sm:my-12">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Email Verification
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-sans mb-6">
          Verifying your educational email ensures a trustworthy academic community.
        </p>

        {status === "success" || user?.isVerified ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm space-y-3 mb-6">
            <div className="flex items-center justify-center gap-2 font-bold">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>Email Verified & Account Active</span>
            </div>
            <p className="text-xs">
              {message || "Your school email has been officially verified."}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              <span>Back to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : status === "error" ? (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm space-y-3 mb-6">
            <div className="flex items-center justify-center gap-2 font-bold">
              <AlertCircle className="w-5 h-5" />
              <span>Verification Error</span>
            </div>
            <p className="text-xs">{message}</p>
            <button
              onClick={() => handleVerify()}
              className="py-1.5 px-4 bg-rose-600 text-white rounded-lg text-xs font-bold"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-700 font-medium">
              Click the button below to verify your current account email.
            </p>
            <button
              onClick={() => handleVerify()}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-xs shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? "Verifying..." : "Confirm & Verify Email"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">Loading verification...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
