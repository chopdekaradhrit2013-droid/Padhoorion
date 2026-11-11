"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy,
  Award,
  Medal,
  Star,
  Sparkles,
  Download,
  Heart,
  Upload,
  Layers,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { GRADES } from "@/lib/constants";
import { UserAvatar } from "@/components/UserAvatar";
import { GradeTag } from "@/components/GradeTag";

const ALL_BADGES_INFO = [
  {
    icon: "🌟",
    title: "First Contributor",
    desc: "Awarded after sharing your first study copy with peers.",
  },
  {
    icon: "📐",
    title: "Math Maestro",
    desc: "Contributed 2+ Mathematics formula guides or solved questions.",
  },
  {
    icon: "🔬",
    title: "Science Scribe",
    desc: "Authored 2+ Science lab/lecture summaries.",
  },
  {
    icon: "🏅",
    title: "Exam Lifesaver",
    desc: "High-yield revision notes that helped peers with 5+ downloads.",
  },
  {
    icon: "🎯",
    title: "Peer Verified Topper",
    desc: "Earned multiple student upvotes & community endorsements.",
  },
  {
    icon: "💡",
    title: "Helpful Classmate",
    desc: "Actively answers questions and shares solutions in discussions.",
  },
];

export default function LeaderboardPage() {
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedGrade !== "all") params.set("grade", selectedGrade);
      const res = await fetch(`/api/leaderboard?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedGrade]);

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-white via-[#faf9f5] to-[#fbf2ed] dark:from-stone-900 dark:via-stone-900 dark:to-stone-950 border border-slate-200 dark:border-stone-800 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fbeee8] dark:bg-[#c96442]/20 border border-[#f5d0c2] dark:border-[#c96442]/30 text-[#c96442] text-xs font-bold uppercase tracking-wider mb-2.5">
              <Trophy className="w-3.5 h-3.5" />
              <span>Student Recognition</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-stone-100 tracking-tight">
              Student Contributor Leaderboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-stone-400 mt-1 font-sans">
              Recognizing classmates who share verified handwritten notes, solved papers, and helpful homework answers. Built by students, for students.
            </p>
          </div>

          <Link
            href="/upload"
            className="px-4 py-2.5 bg-[#c96442] hover:bg-[#b05536] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-[#c96442]/25 transition flex items-center gap-1.5 shrink-0"
          >
            <Upload className="w-4 h-4" />
            <span>Upload & Earn Points</span>
          </Link>
        </div>

        {/* Grade Filter Pills */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-stone-800 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedGrade("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedGrade === "all"
                ? "bg-[#c96442] text-white shadow-xs"
                : "bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 hover:bg-slate-200"
            }`}
          >
            All Grades (6th - 10th)
          </button>
          {GRADES.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGrade(g)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedGrade === g
                  ? "bg-[#c96442] text-white shadow-xs"
                  : "bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 hover:bg-slate-200"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Calculating student standings...</div>
      ) : leaderboard.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-2xl">
          <p className="text-sm text-slate-500">No contributors yet in this grade. Be the first to share notes!</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="order-2 md:order-1 p-6 bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-2xl shadow-sm text-center space-y-3 relative flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-slate-200 text-slate-700 dark:bg-stone-800 dark:text-stone-300">
                      🥈 2nd Place
                    </span>
                    <div className="flex justify-center pt-2">
                      <UserAvatar name={topThree[1].username} avatarUrl={topThree[1].avatarUrl} size="lg" />
                    </div>
                    <Link
                      href={`/profile/${encodeURIComponent(topThree[1].username)}`}
                      className="font-extrabold text-base text-slate-900 dark:text-stone-100 hover:text-[#c96442] block transition"
                    >
                      {topThree[1].username}
                    </Link>
                    <GradeTag grade={topThree[1].grade} size="sm" />
                    <div className="text-2xl font-black text-[#c96442] font-mono">
                      {topThree[1].points} <span className="text-xs font-bold text-slate-400">pts</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-stone-800 flex justify-around text-xs text-slate-500">
                    <span><strong>{topThree[1].uploadsCount}</strong> uploads</span>
                    <span><strong>{topThree[1].downloadsCount}</strong> downloads</span>
                  </div>
                </div>
              )}

              {/* 1st Place Champion */}
              {topThree[0] && (
                <div className="order-1 md:order-2 p-6 sm:p-8 bg-gradient-to-b from-[#fbeee8] via-white to-white dark:from-stone-800 dark:via-stone-900 dark:to-stone-900 border-2 border-[#c96442] rounded-3xl shadow-xl text-center space-y-3 relative transform md:-translate-y-2 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black bg-amber-400 text-amber-950 shadow-sm animate-bounce">
                      🥇 #1 Top Contributor
                    </span>
                    <div className="flex justify-center pt-2">
                      <UserAvatar name={topThree[0].username} avatarUrl={topThree[0].avatarUrl} size="xl" />
                    </div>
                    <Link
                      href={`/profile/${encodeURIComponent(topThree[0].username)}`}
                      className="font-black text-xl text-slate-900 dark:text-stone-100 hover:text-[#c96442] block transition"
                    >
                      {topThree[0].username}
                    </Link>
                    <GradeTag grade={topThree[0].grade} size="md" />
                    <div className="text-4xl font-black text-[#c96442] font-mono">
                      {topThree[0].points} <span className="text-sm font-bold text-slate-400">pts</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-stone-800 flex justify-around text-xs text-slate-600 dark:text-stone-300 font-medium">
                    <span><strong>{topThree[0].uploadsCount}</strong> uploads</span>
                    <span><strong>{topThree[0].downloadsCount}</strong> downloads</span>
                    <span><strong>{topThree[0].likesCount}</strong> upvotes</span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="order-3 p-6 bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-2xl shadow-sm text-center space-y-3 relative flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 dark:bg-stone-800 dark:text-amber-300">
                      🥉 3rd Place
                    </span>
                    <div className="flex justify-center pt-2">
                      <UserAvatar name={topThree[2].username} avatarUrl={topThree[2].avatarUrl} size="lg" />
                    </div>
                    <Link
                      href={`/profile/${encodeURIComponent(topThree[2].username)}`}
                      className="font-extrabold text-base text-slate-900 dark:text-stone-100 hover:text-[#c96442] block transition"
                    >
                      {topThree[2].username}
                    </Link>
                    <GradeTag grade={topThree[2].grade} size="sm" />
                    <div className="text-2xl font-black text-[#c96442] font-mono">
                      {topThree[2].points} <span className="text-xs font-bold text-slate-400">pts</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-stone-800 flex justify-around text-xs text-slate-500">
                    <span><strong>{topThree[2].uploadsCount}</strong> uploads</span>
                    <span><strong>{topThree[2].downloadsCount}</strong> downloads</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full Standings Table */}
          <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-stone-800/60 border-b border-slate-200 dark:border-stone-800 flex items-center justify-between">
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-stone-100 flex items-center gap-2">
                <Medal className="w-4 h-4 text-[#c96442]" />
                <span>Class Standings & Badges</span>
              </h2>
              <span className="text-xs text-slate-400">
                {leaderboard.length} Contributors Ranked
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-stone-800">
              {leaderboard.map((student, idx) => (
                <div
                  key={student.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-stone-800/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 text-center font-black text-sm text-slate-400 font-mono">
                      #{idx + 1}
                    </span>
                    <UserAvatar name={student.username} avatarUrl={student.avatarUrl} size="sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/profile/${encodeURIComponent(student.username)}`}
                          className="font-bold text-sm text-slate-900 dark:text-stone-100 hover:text-[#c96442]"
                        >
                          {student.username}
                        </Link>
                        <GradeTag grade={student.grade} size="sm" />
                      </div>

                      {/* Badges strip */}
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        {student.badges.map((b: any) => (
                          <span
                            key={b.id}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${b.color}`}
                            title={b.desc}
                          >
                            <span>{b.icon}</span>
                            <span>{b.label}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Points & Stats */}
                  <div className="flex items-center justify-end gap-6 text-xs text-slate-500 pl-10 sm:pl-0">
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Uploads</span>
                      <strong className="text-slate-800 dark:text-stone-200">{student.uploadsCount}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Downloads</span>
                      <strong className="text-slate-800 dark:text-stone-200">{student.downloadsCount}</strong>
                    </div>
                    <div className="text-right min-w-[70px]">
                      <span className="text-slate-400 block text-[10px]">Reputation</span>
                      <strong className="text-base font-black text-[#c96442] font-mono">
                        {student.points} pts
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badge Showcase Guide */}
          <div className="p-6 sm:p-8 bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#c96442]" />
              <h2 className="font-extrabold text-base text-slate-900 dark:text-stone-100">
                How to Earn Student Badges
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {ALL_BADGES_INFO.map((badge) => (
                <div
                  key={badge.title}
                  className="p-4 bg-slate-50 dark:bg-stone-800/50 border border-slate-100 dark:border-stone-800 rounded-xl space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{badge.icon}</span>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-stone-100">
                      {badge.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-stone-400 font-sans leading-relaxed">
                    {badge.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

