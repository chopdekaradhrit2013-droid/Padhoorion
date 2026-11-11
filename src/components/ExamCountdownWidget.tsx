"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Flame, ArrowRight, BookOpen, Clock, Target } from "lucide-react";

interface ExamMilestone {
  title: string;
  subtitle: string;
  targetDate: string; // YYYY-MM-DD
  gradeFilter: string;
  badge: string;
  color: string;
}

const MILESTONES: ExamMilestone[] = [
  {
    title: "Term 1 Mid-Year Examination",
    subtitle: "Revision notes, formula sheets & solved copies",
    targetDate: "2026-11-28",
    gradeFilter: "all",
    badge: "School-Wide",
    color: "from-amber-500 to-orange-600",
  },
  {
    title: "10th Grade Pre-Board Exam Marathon",
    subtitle: "High-yield past papers & chemistry balance drills",
    targetDate: "2026-12-15",
    gradeFilter: "10th Grade",
    badge: "10th Grade Focus",
    color: "from-[#c96442] to-rose-600",
  },
  {
    title: "Science & Math Annual Olympiad",
    subtitle: "Practice worksheets & tricky exemplar answers",
    targetDate: "2027-01-10",
    gradeFilter: "8th Grade",
    badge: "Middle School Drills",
    color: "from-indigo-600 to-purple-600",
  },
];

export function ExamCountdownWidget() {
  const [daysRemaining, setDaysRemaining] = useState<Record<string, number>>({});

  useEffect(() => {
    const today = new Date();
    const result: Record<string, number> = {};

    MILESTONES.forEach((m) => {
      const target = new Date(m.targetDate);
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      result[m.title] = diffDays;
    });

    setDaysRemaining(result);
  }, []);

  return (
    <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#c96442] text-white">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-stone-100 tracking-tight">
              Exam Countdown & Revision Hub
            </h3>
            <p className="text-xs text-slate-500 dark:text-stone-400">
              Days remaining until upcoming exam dates across 6th to 10th grades.
            </p>
          </div>
        </div>

        <Link
          href="/grades"
          className="text-xs font-bold text-[#c96442] hover:text-[#b05536] flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Explore All Notes</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
        {MILESTONES.map((m) => {
          const days = daysRemaining[m.title] ?? 14;

          return (
            <div
              key={m.title}
              className="p-4 rounded-xl bg-slate-50/70 dark:bg-stone-800/60 border border-slate-200 dark:border-stone-800 flex flex-col justify-between space-y-3 hover:border-[#c96442]/40 transition group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white dark:bg-stone-700 text-slate-700 dark:text-stone-300 border border-slate-200 dark:border-stone-600">
                    {m.badge}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-[#c96442]">
                    <Clock className="w-3 h-3" />
                    <span>{days} {days === 1 ? "day" : "days"} left</span>
                  </div>
                </div>

                <h4 className="font-black text-sm text-slate-900 dark:text-stone-100 leading-snug group-hover:text-[#c96442] transition">
                  {m.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-stone-400 leading-relaxed font-sans">
                  {m.subtitle}
                </p>
              </div>

              <Link
                href={m.gradeFilter === "all" ? "/grades" : `/grades/${encodeURIComponent(m.gradeFilter)}`}
                className="inline-flex items-center justify-between w-full py-2 px-3 rounded-lg bg-white dark:bg-stone-700 hover:bg-[#c96442] hover:text-white dark:hover:bg-[#c96442] text-[11px] font-bold text-[#c96442] border border-slate-200 dark:border-stone-600 transition shadow-2xs"
              >
                <span>Revise {m.gradeFilter === "all" ? "All Subjects" : m.gradeFilter}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

