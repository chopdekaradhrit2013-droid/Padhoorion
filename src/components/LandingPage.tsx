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
  ArrowRight,
  CheckCircle2,
  Lock,
  Download,
  Users,
  Compass,
  Star,
  Zap,
  Flame,
  Search,
} from "lucide-react";
import KineticGrid from "@/components/ui/kinetic-grid";
import { GRADES, CATEGORIES } from "@/lib/constants";

export function LandingPage() {
  const gradeDetails = [
    {
      grade: "6th Grade",
      focus: "Foundations & Concept Mastery",
      subjects: ["Fractions & Number Systems", "Basic Sciences & Habitats", "Civics & History", "Grammar & Composition"],
      icon: "🌱",
    },
    {
      grade: "7th Grade",
      focus: "Intermediate Skills & Drills",
      subjects: ["Pre-Algebra & Integers", "Heat & Motion Labs", "Medieval Civilizations", "Comprehension & Creative Writing"],
      icon: "📐",
    },
    {
      grade: "8th Grade",
      focus: "Advanced Middle School Science & Math",
      subjects: ["Algebraic Identities", "Force & Pressure", "Indian Constitution", "Python & Digital Literacy"],
      icon: "⚡",
    },
    {
      grade: "9th Grade",
      focus: "Secondary School & Early Board Prep",
      subjects: ["Coordinate Geometry & Polynomials", "Laws of Motion & Gravitation", "Atoms & Molecules", "Economics & Democracy"],
      icon: "🔬",
    },
    {
      grade: "10th Grade",
      focus: "Board Examination Revision & Mock Banks",
      subjects: ["Trigonometry & Quadratic Equations", "Chemical Reactions & Electricity", "Nationalism & Global Economy", "Previous Year Question Banks"],
      icon: "🎯",
    },
  ];

  const noteCategories = [
    {
      num: "01",
      title: "Handwritten Lecture Notes",
      desc: "Clean, high-res scans of classroom chalkboards and notebook summaries written by classmates who actually paid attention.",
      badge: "Real Class Notes",
    },
    {
      num: "02",
      title: "Formula & Concept Sheets",
      desc: "Single-page condensed cheatsheets for physics derivations, math formulas, and chemistry equations right before exams.",
      badge: "Last-Minute Prep",
    },
    {
      num: "03",
      title: "Solved Question Banks",
      desc: "Exemplar problems, chapter-end textbook answers, and past paper solutions broken down step-by-step.",
      badge: "100% Solved",
    },
    {
      num: "04",
      title: "Homework Worksheets",
      desc: "Teacher-assigned drill sheets, diagrams, and revision exercises with peer verification.",
      badge: "Practice Drills",
    },
    {
      num: "05",
      title: "Exam-Eve Revision Summaries",
      desc: "10-minute high-yield crash digests designed to review key concepts and definitions the night before a test.",
      badge: "High Yield",
    },
  ];

  return (
    <KineticGrid globalColor="terracotta" className="-m-4 sm:-m-6 lg:-m-8">
      <div className="relative text-[#faf9f5] px-4 sm:px-6 lg:px-8 py-10 sm:py-16 max-w-6xl mx-auto space-y-24 sm:space-y-32">
        {/* HERO SECTION */}
        <section className="text-center space-y-8 pt-4 sm:pt-10">
          {/* Interactive Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/15 text-xs sm:text-sm font-medium text-[#f3b5a1] backdrop-blur-md shadow-lg shadow-black/20">
            <span className="w-2 h-2 rounded-full bg-[#c96442] animate-ping" />
            <span className="font-semibold text-white">Interactive Canvas</span>
            <span className="text-white/40">•</span>
            <span className="hidden sm:inline text-white/80">Move cursor to warp grid &bull; Click anywhere to ripple</span>
            <span className="sm:hidden text-white/80">Tap to ripple grid</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="flex justify-center mb-4">
              <div className="relative p-2.5 rounded-3xl bg-white/[0.08] backdrop-blur-md border border-white/15 shadow-2xl shadow-[#c96442]/20">
                <img
                  src="/logo.png"
                  alt="PadhoOrion Logo"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-contain drop-shadow-md"
                />
              </div>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white">
              Real Student Notes. <br />
              <span className="bg-gradient-to-r from-[#c96442] via-[#ea8d6c] to-[#c96442] bg-clip-text text-transparent">
                Zero AI Slop.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-[#dfdbcf] max-w-2xl mx-auto font-sans leading-relaxed pt-2">
              PadhoOrion is the student-only notes exchange. Direct scanned copies, teacher-assigned worksheets, formula sheets, and solved revision papers from your own classmates across 6th to 10th grades.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#c96442] hover:bg-[#a84f32] text-white font-extrabold text-sm sm:text-base shadow-xl shadow-[#c96442]/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Join PadhoOrion Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-bold text-sm sm:text-base border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-[#ea8d6c]" />
              <span>Student Sign In</span>
            </Link>
          </div>

          {/* Value Props Strip */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-white/70 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#ea8d6c]" />
              <span>100% Free Student Platform</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#ea8d6c]" />
              <span>No Paywalls or Hidden Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#ea8d6c]" />
              <span>Grades 6th through 10th</span>
            </div>
          </div>
        </section>

        {/* GRADE HUBS (6th to 10th) */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c96442]/20 border border-[#c96442]/40 text-[#f3b5a1] text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Curriculum Segments</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Explore Academic Grades
            </h2>
            <p className="text-sm sm:text-base text-white/60">
              Browse notes tailored specifically to your syllabus. Switch freely between grades at any time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {gradeDetails.map((item) => (
              <div
                key={item.grade}
                className="group relative p-6 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-[#c96442]/60 hover:bg-white/[0.07] transition-all duration-300 flex flex-col justify-between space-y-4 shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#c96442]/25 text-[#f3b5a1] border border-[#c96442]/40 font-mono">
                      {item.grade}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-lg text-white group-hover:text-[#ea8d6c] transition-colors">
                    {item.grade}
                  </h3>
                  <p className="text-xs text-white/70 font-sans">
                    {item.focus}
                  </p>

                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    {item.subjects.map((sub, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-white/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c96442]" />
                        <span className="truncate">{sub}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href="/register"
                  className="mt-3 inline-flex items-center justify-between w-full py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-[#c96442] text-xs font-bold text-white transition-colors border border-white/10 group-hover:border-[#c96442]"
                >
                  <span>Explore {item.grade} Notes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}

            {/* Quick Access Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#c96442]/30 via-black/40 to-[#c96442]/10 backdrop-blur-xl border border-[#c96442]/50 text-white flex flex-col justify-between space-y-4 shadow-xl">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#c96442] text-white flex items-center justify-center font-bold text-lg shadow-md">
                  ★
                </div>
                <h3 className="font-black text-xl text-white">
                  Cross-Grade Exploration
                </h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Your registered grade never restricts you. 8th graders can preview 9th grade topics in advance, and 10th graders can revise 9th grade foundations before board exams.
                </p>
              </div>

              <Link
                href="/register"
                className="w-full py-2.5 px-4 rounded-xl bg-[#c96442] hover:bg-[#a84f32] text-white font-bold text-xs text-center transition-all shadow-md"
              >
                Create Account to Access All
              </Link>
            </div>
          </div>
        </section>

        {/* 5 RESOURCE FORMATS */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/15 text-white/80 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-[#ea8d6c]" />
              <span>Structured Study Formats</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Every Format You Need to Ace Exams
            </h2>
            <p className="text-sm sm:text-base text-white/60">
              No disorganized camera rolls. Everything is tagged by grade, subject, and resource format.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {noteCategories.map((cat) => (
              <div
                key={cat.num}
                className="p-6 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-white/25 transition-all space-y-3 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-black text-[#ea8d6c]">
                      {cat.num}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.08] text-white/80 border border-white/10">
                      {cat.badge}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-white">
                    {cat.title}
                  </h3>

                  <p className="text-xs text-white/70 leading-relaxed font-sans">
                    {cat.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
                  <span>Organized by Chapter</span>
                  <span className="text-[#ea8d6c] font-semibold">PDF Downloads</span>
                </div>
              </div>
            ))}

            {/* Quick Upload Teaser */}
            <div className="p-6 rounded-2xl bg-[#c96442]/20 backdrop-blur-xl border border-[#c96442]/40 text-white flex flex-col justify-between space-y-3 shadow-lg">
              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-[#c96442] text-white w-fit">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-white">Have Good Notes?</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Upload your handwritten study copies or formula sheets to help your classmates and earn community recognition.
                </p>
              </div>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#f3b5a1] hover:text-white transition-colors"
              >
                <span>Upload your first note</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* STATS & COMMUNITY TRUST */}
        <section className="p-8 sm:p-12 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-2xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-5xl font-black text-white font-mono">5</div>
              <div className="text-xs sm:text-sm text-white/60 font-medium">Academic Grades</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-5xl font-black text-[#ea8d6c] font-mono">100%</div>
              <div className="text-xs sm:text-sm text-white/60 font-medium">Student Verified</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-5xl font-black text-white font-mono">5</div>
              <div className="text-xs sm:text-sm text-white/60 font-medium">Study Formats</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-5xl font-black text-[#ea8d6c] font-mono">24/7</div>
              <div className="text-xs sm:text-sm text-white/60 font-medium">Peer Collaboration</div>
            </div>
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <section className="text-center p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.03] backdrop-blur-xl border border-white/15 shadow-2xl space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Ready to Ace Your Next School Exam?
            </h2>
            <p className="text-sm sm:text-base text-white/70">
              Sign up in 30 seconds. Download notes, request worksheets, and study alongside your classmates.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#c96442] hover:bg-[#a84f32] text-white font-extrabold text-sm sm:text-base shadow-xl shadow-[#c96442]/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <span>Create Free Student Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-bold text-sm sm:text-base border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Log In to PadhoOrion</span>
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="pt-6 border-t border-white/10 text-center text-xs text-white/40 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <img src="/logo.png" alt="PadhoOrion Logo" className="w-5 h-5 rounded object-contain opacity-80" />
            <span className="font-bold text-white/70">PadhoOrion Community</span>
            <span>&bull;</span>
            <span>Made for Students</span>
          </div>
          <p>© 2026 PadhoOrion. All student contributions are protected and shared for educational purposes.</p>
        </footer>
      </div>
    </KineticGrid>
  );
}
