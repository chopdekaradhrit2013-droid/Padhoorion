"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function VerifyPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/");
    }, 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-2xl shadow-xl text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Account Active & Verified
        </h1>
        <p className="text-sm text-slate-600 font-sans">
          PadhoOrion accounts are instantly activated with direct access across all grade hubs. Redirecting you to home...
        </p>
      </div>

      <Link
        href="/"
        className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#c96442] hover:bg-[#b05536] text-white font-bold rounded-xl transition-all shadow-md shadow-[#c96442]/20"
      >
        <span>Go to Dashboard</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
