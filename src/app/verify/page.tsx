"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, AlertCircle, ShieldCheck, ArrowRight, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function VerifyContent() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token") || searchParams.get("code") || "";
  const emailParam = searchParams.get("email") || "";

  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [emailInput, setEmailInput] = useState(emailParam || user?.email || "");
  const [codeInput, setCodeInput] = useState(tokenParam);
  const [dispatchedCode, setDispatchedCode] = useState<string | null>(tokenParam || null);
  const [emailDelivered, setEmailDelivered] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">(
    user?.isVerified ? "success" : "idle"
  );
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (tokenParam && emailParam) {
      handleVerify(tokenParam, emailParam);
    }
  }, [tokenParam, emailParam]);

  const handleVerify = async (codeToUse?: string, emailToUse?: string) => {
    const targetCode = (codeToUse || codeInput).trim();
    const targetEmail = (emailToUse || emailInput).trim();

    if (!targetCode) {
      setStatus("error");
      setMessage("Please enter your 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: targetCode,
          email: targetEmail || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setStatus("success");
      setMessage(data.message || "Email verified successfully!");
      await refreshUser();
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Failed to verify email.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!emailInput.trim()) {
      setMessage("Please enter your account email to resend code.");
      setStatus("error");
      return;
    }

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resend",
          email: emailInput.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.verificationCode) {
          setDispatchedCode(data.verificationCode);
        }
        setEmailDelivered(data.emailDelivered ?? true);
        setMessage(data.message || `A fresh 6-digit verification code has been dispatched to ${emailInput.trim()}.`);
        setStatus("idle");
      } else {
        setMessage(data.error || "Failed to resend");
        setStatus("error");
      }
    } catch (e: any) {
      setMessage(e.message || "Error resending code");
      setStatus("error");
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
          Verifying your email ensures a safe and trustworthy student community.
        </p>

        {status === "success" || user?.isVerified ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm space-y-3 mb-6">
            <div className="flex items-center justify-center gap-2 font-bold">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>Email Verified & Account Active</span>
            </div>
            <p className="text-xs">
              {message || "Your email has been officially verified."}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              <span>Go to PadhoOrion Home</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4 text-left">
            {status === "error" && message && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Account Email
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="e.g. yourname@gmail.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {dispatchedCode && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <span>⚡ 6-Digit Code:</span>
                    <span className="font-mono text-sm font-black bg-amber-100 px-2 py-0.5 rounded border border-amber-200 text-amber-950 tracking-wider">
                      {dispatchedCode}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setCodeInput(dispatchedCode)}
                    className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 font-bold text-[10px] text-amber-900 rounded-lg transition-colors"
                  >
                    Auto-Fill
                  </button>
                </div>
                {!emailDelivered && (
                  <p className="text-[10px] text-amber-800">
                    Notice: External email provider (Resend Sandbox/SMTP) restricted automatic delivery to this recipient. Use the code above to verify.
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 text-center">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full text-center tracking-[0.4em] font-mono text-xl py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
              />
            </div>

            <button
              onClick={() => handleVerify()}
              disabled={loading || codeInput.length < 6}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Activate Account"}
            </button>

            <div className="flex items-center justify-between pt-1 text-[11px]">
              <button
                type="button"
                onClick={handleResend}
                className="text-indigo-600 hover:underline font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Resend 6-Digit Code</span>
              </button>
              <Link href="/login" className="text-slate-500 hover:text-slate-700 font-medium">
                Back to Login
              </Link>
            </div>
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
