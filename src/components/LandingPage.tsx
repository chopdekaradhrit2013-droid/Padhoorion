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
  Upload,
  LayoutDashboard,
} from "lucide-react";
import KineticGrid from "@/components/ui/kinetic-grid";
import { GRADES, CATEGORIES } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";

export function LandingPage() {
  const { user } = useAuth();
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
      focus: "Board Examination Revision & Practice Question Banks",
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
      desc: "Classroom homework drill sheets, chapter diagrams, and revision exercises with peer verification.",
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
      <div className="relative text-[#292524] px-4 sm:px-6 lg:px-8 py-10 sm:py-16 max-w-6xl mx-auto space-y-20 sm:space-y-28">
        {/* HERO SECTION */}
        <section className="text-center space-y-8 pt-4 sm:pt-8">
          {/* Interactive Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fbeee8] border border-[#f5d0c2] text-xs sm:text-sm font-semibold text-[#c96442] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#c96442] animate-ping" />
            <span className="font-bold text-[#c96442]">PadhoOrion Community</span>
            <span className="text-[#c96442]/40">•</span>
            <span className="hidden sm:inline text-[#78716c]">Peer Notes &bull; Worksheets &bull; Exam Revision</span>
            <span className="sm:hidden text-[#78716c]">Student Community</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="flex justify-center mb-4">
              <div className="relative p-2.5 rounded-3xl bg-white shadow-xl border border-[#ebdccc] shadow-[#c96442]/10">
                <img
                  src="/logo.png"
                  alt="PadhoOrion Logo"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-contain drop-shadow-sm"
                />
              </div>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-[#1c1917]">
              PadhoOrion <br />
              <span className="bg-gradient-to-r from-[#c96442] via-[#e86b3a] to-[#d95f2d] bg-clip-text text-transparent">
                Study Smarter. Ace Together.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-[#57534e] max-w-2xl mx-auto font-sans leading-relaxed pt-2">
              The premier school learning & notes network. Discover peer-verified handwritten lecture notes, formula sheets, chapter summaries, and solved practice papers across 6th to 10th grades.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto pt-2 relative z-20">
            {user ? (
              <>
                <Link
                  href="/"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#c96442] hover:bg-[#b05536] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#c96442]/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to My Dashboard</span>
                </Link>

                <Link
                  href="/upload"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-[#faf9f5] text-[#292524] font-bold text-sm sm:text-base border border-[#e2ded5] shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#c96442]" />
                  <span>Upload Study Notes</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#c96442] hover:bg-[#b05536] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#c96442]/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <span>Join PadhoOrion Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-[#faf9f5] text-[#292524] font-bold text-sm sm:text-base border border-[#e2ded5] shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-[#c96442]" />
                  <span>Student Sign In</span>
                </Link>
              </>
            )}
          </div>

          {/* Value Props Strip */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-[#78716c] font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#c96442]" />
              <span>100% Free Student Platform</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#c96442]" />
              <span>No Paywalls or Hidden Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#c96442]" />
              <span>Grades 6th through 10th</span>
            </div>
          </div>
        </section>

        {/* GRADE HUBS (6th to 10th) */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fbeee8] border border-[#f5d0c2] text-[#c96442] text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Curriculum Segments</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1c1917]">
              Explore Academic Grades
            </h2>
            <p className="text-sm sm:text-base text-[#78716c]">
              Browse notes tailored specifically to your syllabus. Switch freely between grades at any time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {gradeDetails.map((item) => (
              <div
                key={item.grade}
                className="group relative p-6 rounded-2xl bg-white/90 backdrop-blur-md border border-[#e8e4dc] hover:border-[#c96442] hover:shadow-xl hover:bg-white transition-all duration-300 flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#fbeee8] text-[#c96442] border border-[#f5d0c2] font-mono">
                      {item.grade}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-lg text-[#1c1917] group-hover:text-[#c96442] transition-colors">
                    {item.grade}
                  </h3>
                  <p className="text-xs text-[#78716c] font-sans">
                    {item.focus}
                  </p>

                  <div className="pt-2 border-t border-[#f0ece4] space-y-1.5">
                    {item.subjects.map((sub, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#57534e]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c96442]" />
                        <span className="truncate">{sub}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={`/grades/${encodeURIComponent(item.grade)}`}
                  className="mt-3 inline-flex items-center justify-between w-full py-2.5 px-3.5 rounded-xl bg-[#faf8f5] hover:bg-[#c96442] hover:text-white text-xs font-bold text-[#c96442] transition-all border border-[#ebdccc] group-hover:border-[#c96442] shadow-2xs relative z-20 cursor-pointer"
                >
                  <span>Explore {item.grade} Notes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}

            {/* Quick Access Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#fbeee8] via-white to-[#fbf2ed] border border-[#f0c8ba] text-[#292524] flex flex-col justify-between space-y-4 shadow-sm">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#c96442] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-[#c96442]/30">
                  ★
                </div>
                <h3 className="font-black text-xl text-[#1c1917]">
                  Cross-Grade Exploration
                </h3>
                <p className="text-xs text-[#57534e] leading-relaxed">
                  Your registered grade never restricts you. 8th graders can preview 9th grade topics in advance, and 10th graders can revise 9th grade foundations before board exams.
                </p>
              </div>

              <Link
                href="/grades"
                className="w-full py-2.5 px-4 rounded-xl bg-[#c96442] hover:bg-[#b05536] text-white font-bold text-xs text-center transition-all shadow-md shadow-[#c96442]/20 relative z-20 cursor-pointer"
              >
                {user ? "Explore All Grade Hubs" : "Browse All Grades"}
              </Link>
            </div>
          </div>
        </section>

        {/* 5 RESOURCE FORMATS */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fbeee8] border border-[#f5d0c2] text-[#c96442] text-xs font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-[#c96442]" />
              <span>Structured Study Formats</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1c1917]">
              Every Format You Need to Ace Exams
            </h2>
            <p className="text-sm sm:text-base text-[#78716c]">
              No disorganized camera rolls. Everything is tagged by grade, subject, and resource format.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {noteCategories.map((cat) => (
              <div
                key={cat.num}
                className="p-6 rounded-2xl bg-white/90 backdrop-blur-md border border-[#e8e4dc] hover:border-[#c96442]/60 hover:shadow-md transition-all space-y-3 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-black text-[#c96442]">
                      {cat.num}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#fbeee8] text-[#c96442] border border-[#f5d0c2]">
                      {cat.badge}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-[#1c1917]">
                    {cat.title}
                  </h3>

                  <p className="text-xs text-[#57534e] leading-relaxed font-sans">
                    {cat.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#f0ece4] flex items-center justify-between text-[11px] text-[#78716c]">
                  <span>Organized by Chapter</span>
                  <span className="text-[#c96442] font-semibold">PDF Downloads</span>
                </div>
              </div>
            ))}

            {/* Quick Upload Teaser */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#fbeee8] to-white border border-[#f0c8ba] text-[#292524] flex flex-col justify-between space-y-3 shadow-sm">
              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-[#c96442] text-white w-fit shadow-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-[#1c1917]">Have Good Notes?</h3>
                <p className="text-xs text-[#57534e] leading-relaxed">
                  Upload your handwritten study copies or formula sheets to help your classmates and earn community recognition.
                </p>
              </div>
              <Link
                href={user ? "/upload" : "/login"}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c96442] hover:text-[#a84f32] transition-colors relative z-20 cursor-pointer"
              >
                <span>Upload your first note</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* STATS & COMMUNITY TRUST */}
        <section className="p-8 sm:p-12 rounded-3xl bg-white/95 backdrop-blur-md border border-[#e8e4dc] shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-5xl font-black text-[#1c1917] font-mono">5</div>
              <div className="text-xs sm:text-sm text-[#78716c] font-medium">Academic Grades</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-5xl font-black text-[#c96442] font-mono">100%</div>
              <div className="text-xs sm:text-sm text-[#78716c] font-medium">Student Verified</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-5xl font-black text-[#1c1917] font-mono">5</div>
              <div className="text-xs sm:text-sm text-[#78716c] font-medium">Study Formats</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-5xl font-black text-[#c96442] font-mono">24/7</div>
              <div className="text-xs sm:text-sm text-[#78716c] font-medium">Peer Collaboration</div>
            </div>
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <section className="text-center p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-[#ffffff] via-[#fdf8f5] to-[#faeee7] border border-[#f3dcd2] shadow-xl space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1c1917]">
              Ready to Ace Your Next School Exam?
            </h2>
            <p className="text-sm sm:text-base text-[#57534e]">
              Sign up in 30 seconds. Download notes, request worksheets, and study alongside your classmates.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 relative z-20">
            {user ? (
              <>
                <Link
                  href="/upload"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#c96442] hover:bg-[#b05536] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#c96442]/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Study Notes</span>
                </Link>

                <Link
                  href="/grades"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-[#faf9f5] text-[#292524] font-bold text-sm sm:text-base border border-[#e2ded5] shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Browse All Grades</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#c96442] hover:bg-[#b05536] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#c96442]/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Create Free Student Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-[#faf9f5] text-[#292524] font-bold text-sm sm:text-base border border-[#e2ded5] shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Log In to PadhoOrion</span>
                </Link>
              </>
            )}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="pt-6 border-t border-[#e8e4dc] text-center text-xs text-[#a8a29e] space-y-2">
          <div className="flex items-center justify-center gap-2">
            <img src="/logo.png" alt="PadhoOrion Logo" className="w-5 h-5 rounded object-contain opacity-80" />
            <span className="font-bold text-[#57534e]">PadhoOrion Community</span>
            <span>&bull;</span>
            <span>Made for Students</span>
          </div>
          <p>© 2026 PadhoOrion. All student contributions are protected and shared for educational purposes.</p>
        </footer>
      </div>
    </KineticGrid>
  );
}
