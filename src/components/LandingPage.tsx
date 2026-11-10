"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Layers,
  FileText,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Lock,
  Download,
  Heart,
  Users,
  Compass,
  Star,
} from "lucide-react";
import { GRADES, CATEGORIES } from "@/lib/constants";

export function LandingPage() {
  return (
    <div className="space-y-16 sm:space-y-24 py-4 sm:py-8 max-w-6xl mx-auto animate-fade-in">
      {/* Hero Section */}
      <section className="text-center space-y-6 sm:space-y-8 px-4">
        {/* Top Highlight Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f7ede7] border border-[#f0c8ba] text-xs sm:text-sm font-semibold text-[#c96442] shadow-xs">
          <Sparkles className="w-4 h-4 text-[#c96442]" />
          <span>School-Wide Notes Sharing & Homework Community</span>
        </div>

        {/* Main Title */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <div className="flex justify-center mb-2">
            <img
              src="/logo.png"
              alt="PadhoOrion Logo"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-contain shadow-md border border-[#dad9d4]"
            />
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Share Notes. Solve Doubts. <br />
            <span className="text-[#c96442]">Excel Together.</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-sans leading-relaxed">
            PadhoOrion is a private, student-centric academic community for 6th to 10th graders. Discover authentic lecture copies, practice worksheets, handwritten revision guides, and solved textbook Q&As.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto pt-2">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#c96442] hover:bg-[#b05536] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#c96442]/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>Create Free Student Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm sm:text-base border border-[#dad9d4] shadow-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Lock className="w-4 h-4 text-slate-500" />
            <span>Student Log In</span>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#34532b]" />
            <span>100% Free Student Community</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#34532b]" />
            <span>All 5 Grades (6th to 10th)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#34532b]" />
            <span>Protected & Moderated</span>
          </div>
        </div>

        {/* Visual Showcase Card */}
        <div className="pt-8 max-w-4xl mx-auto">
          <div className="relative rounded-2xl bg-[#262624] p-4 sm:p-8 text-white shadow-2xl border border-[#dad9d4]/20 overflow-hidden text-left">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="text-xs text-white/50 font-mono ml-2">padhoorion.internal/portal</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c96442]/30 text-[#e4bfaf] text-xs font-bold border border-[#c96442]/40">
                <Lock className="w-3 h-3" />
                <span>Protected Student Network</span>
              </div>
            </div>

            {/* Preview items inside mockup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f7efe9] text-[#9c4c2c]">
                    7th Grade
                  </span>
                  <span className="text-[11px] text-white/60">Mathematics</span>
                </div>
                <h4 className="font-bold text-sm text-white">
                  Coordinate Geometry: Complete Practice Worksheet
                </h4>
                <p className="text-xs text-white/70 line-clamp-2">
                  Full step-by-step Cartesian plane drills with solved examples from lesson 4.
                </p>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
                  <span>Adhrit [7th Grade]</span>
                  <span className="text-[#e4bfaf]">12 Downloads</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f2effb] text-[#5e4db2]">
                    9th Grade
                  </span>
                  <span className="text-[11px] text-white/60">Physics</span>
                </div>
                <h4 className="font-bold text-sm text-white">
                  Newton's Laws of Motion & Momentum Revision Guide
                </h4>
                <p className="text-xs text-white/70 line-clamp-2">
                  Handwritten diagrams, free body illustrations, and formula sheets for term exams.
                </p>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
                  <span>aarav_sharma [9th Grade]</span>
                  <span className="text-[#e4bfaf]">18 Downloads</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-[#c96442]/20 border border-[#c96442]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <p className="font-bold text-sm text-[#faece7]">
                  To access thousands of verified notes, sign in with your student account.
                </p>
                <p className="text-xs text-[#faece7]/80">
                  Accounts are open to all registered school students.
                </p>
              </div>
              <Link
                href="/login"
                className="shrink-0 px-4 py-2 rounded-lg bg-[#c96442] hover:bg-[#b05536] text-white text-xs font-bold transition-colors"
              >
                Log In to Access
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Distinct Categories Section */}
      <section className="space-y-8 px-4">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#faece7] text-[#c96442] text-xs font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>Structured Organization</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            5 Dedicated Resource Categories
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-sans">
            Every grade level is segmented into 5 focused categories so you can quickly find whatever you need.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.map((cat, idx) => (
            <div
              key={cat.name}
              className="p-6 bg-white border border-[#dad9d4] rounded-2xl shadow-xs hover:shadow-md transition-all space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[#faece7] text-[#c96442] flex items-center justify-center font-bold text-base">
                0{idx + 1}
              </div>
              <h3 className="font-bold text-lg text-slate-900">{cat.name}</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-sans">
                {cat.description}
              </p>
              <div className="text-xs text-[#c96442] font-semibold pt-2 flex items-center gap-1">
                <span>Organized by Subject & Chapter</span>
              </div>
            </div>
          ))}

          {/* Open Access Feature Card */}
          <div className="p-6 bg-gradient-to-br from-[#c96442] to-[#b05536] text-white rounded-2xl shadow-md space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold text-base">
                ✦
              </div>
              <h3 className="font-bold text-lg text-white">Open Grade Access</h3>
              <p className="text-sm text-white/90 leading-relaxed font-sans">
                A student's enrolled grade never restricts their curiosity. 7th graders can preview 8th grade material, and 10th graders can revise fundamentals anytime.
              </p>
            </div>
            <Link
              href="/register"
              className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors w-fit"
            >
              <span>Join Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Grade Coverage (6th to 10th) */}
      <section className="p-8 sm:p-12 bg-white border border-[#dad9d4] rounded-3xl shadow-sm space-y-8 mx-4">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Complete Curriculum Coverage
          </h2>
          <p className="text-sm text-slate-500 font-sans">
            From foundational middle school concepts to high school board preparations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {GRADES.map((g) => (
            <div
              key={g}
              className="p-4 rounded-xl border border-[#dad9d4] bg-[#faf9f5] text-center space-y-2"
            >
              <div className="text-base font-extrabold text-slate-900">{g}</div>
              <p className="text-xs text-slate-500 font-sans">
                Math, Science, Social Studies, English, Computer Science
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why PadhoOrion Section */}
      <section className="space-y-8 px-4">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f7efe9] text-[#9c4c2c] text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Built For Authentic Learning</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Academic Integrity & Student Privacy
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-[#dad9d4] rounded-2xl shadow-xs space-y-3">
            <div className="p-2.5 rounded-xl bg-[#faece7] text-[#c96442] w-fit">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Grade Tagged Everywhere
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
              Every author has their current standing attached to comments, notes, and profiles (e.g. <code>Adhrit [7th Grade]</code>), building transparent peer collaboration.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#dad9d4] rounded-2xl shadow-xs space-y-3">
            <div className="p-2.5 rounded-xl bg-[#faece7] text-[#c96442] w-fit">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Confirmation Modals
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
              Zero accidental uploads or misplaced remarks. Double confirmation modals always verify your destination grade and subject before publishing.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#dad9d4] rounded-2xl shadow-xs space-y-3">
            <div className="p-2.5 rounded-xl bg-[#faece7] text-[#c96442] w-fit">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Strict Access Control
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
              Educational materials, student identities, and peer discussions are strictly preserved for verified registered students.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="mx-4 p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-[#262624] via-[#353124] to-[#1e1c17] text-white shadow-xl border border-[#dad9d4]/20 text-center space-y-6">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Explore School Notes?
          </h2>
          <p className="text-sm sm:text-base text-white/80 font-sans">
            Create your account in under 30 seconds and start sharing and downloading verified school notes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#c96442] hover:bg-[#b05536] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#c96442]/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base border border-white/20 transition-colors flex items-center justify-center gap-2"
          >
            <span>Sign In to PadhoOrion</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-[#dad9d4] text-center text-xs text-slate-500 space-y-2 px-4">
        <div className="flex items-center justify-center gap-2">
          <img src="/logo.png" alt="PadhoOrion Logo" className="w-6 h-6 rounded-md object-contain" />
          <span className="font-bold text-slate-800">PadhoOrion</span>
          <span>• School Notes-Sharing & Homework Community</span>
        </div>
        <p>© 2026 PadhoOrion. All student contributions are protected and shared for educational purposes.</p>
      </footer>
    </div>
  );
}
