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
  const [emailDelivered, setEmailDelivered] = useState(false);
  const [fallbackCode, setFallbackCode] = useState<string | null>(null);

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

      // Transition to Email Verification Step
      setEmailDelivered(Boolean(data.emailDelivered));
      setFallbackCode(data.fallbackCode || null);
      if (data.fallbackCode) {
        setVerificationCodeInput(data.fallbackCode);
      } else {
        setVerificationCodeInput("");
      }
      setStep("verify");
      if (data.emailDelivered) {
        setSuccessNotice(`Verification code delivered to your Gmail inbox at ${email}!`);
      } else {
        setSuccessNotice("Verification code issued. Enter code below to activate your account.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to register");
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
        setEmailDelivered(Boolean(data.emailDelivered));
        if (data.fallbackCode) {
          setFallbackCode(data.fallbackCode);
          setVerificationCodeInput(data.fallbackCode);
        }
        setSuccessNotice(data.message || `A fresh code has been issued for ${email}.`);
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
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
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
            {emailDelivered ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl text-center space-y-1.5 shadow-xs">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold text-emerald-900">
                  Verification Code Delivered to Your Inbox!
                </p>
                <p className="text-sm font-black text-emerald-950 font-mono">{email}</p>
                <p className="text-[11px] text-emerald-800 leading-relaxed pt-1">
                  Please check your Gmail inbox (including Spam & Promotions) and enter the 6 digits below to activate your account.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-950 rounded-xl space-y-2 text-center shadow-xs">
                <div className="w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-amber-900">
                  Account Verification for <span className="font-mono text-amber-950">{email}</span>
                </p>
                {fallbackCode && (
                  <div className="p-2.5 bg-white border border-amber-300 rounded-lg inline-block my-1 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">
                      6-Digit Activation Code
                    </span>
                    <span className="text-xl font-black font-mono tracking-widest text-amber-800">
                      {fallbackCode}
                    </span>
                  </div>
                )}
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Enter the 6-digit code below and click &ldquo;Verify &amp; Activate Account&rdquo; to complete your setup.
                </p>
              </div>
            )}

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
