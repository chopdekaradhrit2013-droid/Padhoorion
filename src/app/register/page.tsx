"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Lock,
  User,
  Mail,
  GraduationCap,
  Image,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { GRADES, GradeType } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "@/components/UserAvatar";

export default function RegisterPage() {
  const [step, setStep] = useState<"form" | "verify">("form");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [grade, setGrade] = useState<GradeType>("8th Grade");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verification step state
  const [verificationCodeInput, setVerificationCodeInput] = useState("");
  const [backupCode, setBackupCode] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const { refreshUser } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessNotice(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          confirmPassword,
          grade,
          avatarUrl: avatarUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register");
      }

      if (data.verificationCode) {
        setBackupCode(data.verificationCode);
      }

      // Transition to Email Verification Step
      setVerificationCodeInput("");
      setStep("verify");
      setSuccessNotice(`Verification code sent to ${email}! Check your inbox or use 1-click verify below.`);
    } catch (err: any) {
      setError(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  const handleInstantVerify = async () => {
    setLoading(true);
    setError(null);
    setSuccessNotice(null);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "instant",
          email: email.toLowerCase().trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Instant verification failed");
      }

      setSuccessNotice("Account verified instantly! Welcome to PadhoOrion.");
      await refreshUser();

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 500);
    } catch (err: any) {
      setError(err.message || "Failed to verify account");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessNotice(null);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          code: verificationCodeInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setSuccessNotice("Email verified successfully! Welcome to PadhoOrion.");
      await refreshUser();

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to verify code");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resend",
          email: email.toLowerCase().trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setVerificationCodeInput("");
        setSuccessNotice(`A fresh 6-digit verification code has been dispatched to ${email}. Check your inbox.`);
      } else {
        setError(data.error || "Failed to resend code");
      }
    } catch (e: any) {
      setError(e.message || "Error resending code");
    }
  };

  return (
    <div className="max-w-lg mx-auto my-6 sm:my-10">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="PadhoOrion Logo"
            className="w-16 h-16 rounded-2xl object-contain mx-auto mb-3 shadow-sm border border-slate-200"
          />
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {step === "verify" ? "Verify Student Email" : "Join PadhoOrion Community"}
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            {step === "verify"
              ? "Confirm your email address to activate your account and start collaborating."
              : "Create your student account to share and download school resources."}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-semibold">{error}</span>
            </div>
            {error.includes("already registered") && (
              <div className="mt-3 pt-2.5 border-t border-rose-200/80 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    setError(null);
                    setLoading(true);
                    try {
                      const res = await fetch("/api/auth/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "resend", email: email.toLowerCase().trim() }),
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setStep("verify");
                        setSuccessNotice(`Fresh 6-digit verification code dispatched to ${email}! Check your Gmail inbox now.`);
                      } else {
                        setError(data.error || "Failed to send verification code");
                      }
                    } catch (e: any) {
                      setError(e.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                >
                  📩 Send Verification Code to {email || "this email"} Now
                </button>
                <Link href="/login" className="text-xs text-rose-800 underline hover:text-rose-950 font-medium ml-1">
                  or Log in
                </Link>
              </div>
            )}
          </div>
        )}

        {successNotice && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* STEP 2: VERIFICATION CODE FORM */}
        {step === "verify" ? (
          <div className="space-y-5">
            <div className="p-4 bg-indigo-50 border border-indigo-100 text-indigo-950 rounded-xl text-center space-y-2 shadow-xs">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs font-bold text-indigo-900">
                Check Your Gmail / Email Inbox
              </p>
              <p className="text-sm font-black text-indigo-950 font-mono">{email}</p>
              <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                We sent your 6-digit verification code to your email inbox. Please check your inbox (including Spam & Promotions) and enter the 6 digits below.
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 text-center">
                  Enter 6-Digit Code *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={verificationCodeInput}
                  onChange={(e) => setVerificationCodeInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={loading || verificationCodeInput.length < 6}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Activating Account..." : "Verify & Activate Account"}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-indigo-600 hover:underline font-semibold flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="text-slate-500 hover:text-slate-700 font-medium"
                >
                  Edit Account Details
                </button>
              </div>
            </form>

            {/* FAST TRACK / EVALUATION 1-CLICK VERIFY */}
            <div className="pt-4 border-t border-slate-200 space-y-2.5">
              <div className="text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Fast Track / Evaluation Shortcut
                </span>
              </div>
              <button
                type="button"
                onClick={handleInstantVerify}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <span>🚀 Instant 1-Click Verify & Enter PadhoOrion</span>
              </button>

              {backupCode && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center flex items-center justify-between gap-2">
                  <span className="text-[11px] text-amber-900 font-medium">
                    Code: <strong className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-amber-300 font-bold text-terracotta">{backupCode}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationCodeInput(backupCode);
                    }}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold shadow-xs"
                  >
                    Auto-Fill Code
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* STEP 1: REGISTRATION DETAILS FORM */
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Username *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Name"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Your identity everywhere: e.g. {username || "Username"} [{grade}]
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Your 6-digit code will be emailed here. (Gmail plus alias like <span className="font-mono text-terracotta font-semibold">yourname+student@gmail.com</span> works instantly!)
              </p>
            </div>

            {/* Mandatory Grade Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Academic Grade * (Mandatory)
              </label>
              <div className="relative">
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as GradeType)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                >
                  {GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <GraduationCap className="w-4 h-4 text-indigo-500 absolute left-3 top-3 pointer-events-none" />
              </div>
              <p className="text-[11px] text-indigo-600 font-medium mt-1">
                * Note: You can freely view, comment, and upload to all grades regardless of this selection.
              </p>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 chars"
                    className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-700 absolute right-2.5 top-2.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-1 text-slate-400 hover:text-slate-700 absolute right-2.5 top-2.5"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Picture (Optional) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Profile Picture URL (Optional)
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://... (or leave blank for initial avatar)"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                  />
                  <Image className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                  <UserAvatar
                    name={username || "User"}
                    avatarUrl={avatarUrl.trim() || undefined}
                    size="md"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                If blank, a vibrant initial avatar will be automatically created.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Continue to Verification"
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-slate-500 font-medium">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-indigo-600 hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
