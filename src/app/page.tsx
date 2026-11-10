import React from "react";
import Link from "next/link";
import {
  BookOpen,
  TrendingUp,
  Sparkles,
  MessageSquare,
  Search,
  Upload,
  ArrowRight,
  GraduationCap,
  Layers,
  FileText,
  Star,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { GRADES, CATEGORIES } from "@/lib/constants";
import { ResourceCard } from "@/components/ResourceCard";
import { AuthorIdentity } from "@/components/AuthorIdentity";
import { AnnouncementsBanner } from "@/components/AnnouncementsBanner";
import { LandingPage } from "@/components/LandingPage";
import { formatTimeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getSessionUser();

  if (!user) {
    return <LandingPage />;
  }

  const [
    recentResources,
    popularResources,
    recentComments,
    gradeCounts,
  ] = await Promise.all([
    prisma.resource.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            grade: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true,
          },
        },
      },
    }),
    prisma.resource.findMany({
      orderBy: { downloadsCount: "desc" },
      take: 6,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            grade: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true,
          },
        },
      },
    }),
    prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            grade: true,
            avatarUrl: true,
          },
        },
        resource: {
          select: {
            id: true,
            title: true,
            grade: true,
            category: true,
          },
        },
      },
    }),
    Promise.all(
      GRADES.map(async (grade) => {
        const count = await prisma.resource.count({ where: { grade } });
        return { grade, count };
      })
    ),
  ]);

  const gradeColors: Record<string, { badge: string; bg: string; hover: string }> = {
    "6th Grade": { badge: "bg-[#34532b]", bg: "hover:border-[#cfe0c7]", hover: "group-hover:text-[#34532b]" },
    "7th Grade": { badge: "bg-[#9c4c2c]", bg: "hover:border-[#ebd4c7]", hover: "group-hover:text-[#9c4c2c]" },
    "8th Grade": { badge: "bg-[#c96442]", bg: "hover:border-[#f0c8ba]", hover: "group-hover:text-[#c96442]" },
    "9th Grade": { badge: "bg-[#5e4db2]", bg: "hover:border-[#ded7f4]", hover: "group-hover:text-[#5e4db2]" },
    "10th Grade": { badge: "bg-[#855e1d]", bg: "hover:border-[#ede1c3]", hover: "group-hover:text-[#855e1d]" },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Announcements Banner */}
      <AnnouncementsBanner />

      {/* Guest Landing Preview Shortcut for Logged-In Users */}
      <div className="p-3.5 bg-gradient-to-r from-white via-[#fdf8f5] to-[#fbeee8] border border-[#f0c8ba] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#1c1917] shadow-sm">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-[#c96442] shrink-0" />
          <span>
            You are logged in as <strong>{user?.username}</strong>. Want to see the new interactive <strong>White & Orange</strong> landing page?
          </span>
        </div>
        <Link
          href="/landing"
          className="shrink-0 px-3.5 py-1.5 bg-[#c96442] hover:bg-[#b05536] text-white font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
        >
          <span>Preview Landing Page</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Hero Banner: Claude Remix warm dark charcoal / terracotta gradient */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#262624] via-[#353124] to-[#1e1c17] text-white p-6 sm:p-10 shadow-xl shadow-stone-900/20 border border-[#dad9d4]/20">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#e4bfaf] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#e39d81]" />
            <span>School-Wide Notes & Homework Community</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {user ? (
              <>
                Welcome back,{" "}
                <span className="text-[#e39d81]">{user.username}</span>{" "}
                <span className="text-base sm:text-xl font-medium text-[#e4bfaf]/90 ml-1">
                  [{user.grade}]
                </span>
              </>
            ) : (
              <>
                Learn Faster, Share Notes & Excel Across Every Grade.
              </>
            )}
          </h1>

          <p className="mt-3 text-sm sm:text-base text-[#faf9f5]/80 leading-relaxed font-sans">
            PadhoOrion enables middle and high school students to share authentic class notes, practice worksheets, handwritten revision sheets, and solved exam papers.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/upload"
              className="px-5 py-2.5 rounded-xl bg-[#c96442] hover:bg-[#b05536] text-white font-bold text-sm shadow-lg shadow-[#c96442]/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Upload className="w-4 h-4" />
              <span>Share a Resource</span>
            </Link>

            <Link
              href="/grades"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 shadow-sm flex items-center gap-2 transition-colors"
            >
              <Layers className="w-4 h-4 text-[#e39d81]" />
              <span>Explore All Grades</span>
            </Link>
          </div>
        </div>

        {/* Ambient starburst ornament */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#c96442]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none select-none text-white">
          <BookOpen className="w-72 h-72" />
        </div>
      </section>

      {/* Grade Quick Navigation */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Explore by Grade
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Open Access: Every student has complete freedom to explore and upload across all 5 grades.
            </p>
          </div>
          <Link
            href="/grades"
            className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {gradeCounts.map(({ grade, count }) => {
            const colors = gradeColors[grade] || { badge: "bg-indigo-600", bg: "hover:border-indigo-400", hover: "group-hover:text-indigo-600" };
            return (
              <Link
                key={grade}
                href={`/grades/${encodeURIComponent(grade)}`}
                className={`group p-4 bg-white border border-slate-200 ${colors.bg} rounded-xl shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`w-8 h-8 rounded-lg ${colors.badge} text-white font-extrabold text-xs flex items-center justify-center shadow-xs`}>
                    {grade.split(" ")[0]}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 px-2 py-0.5 rounded-full bg-slate-100">
                    {count} {count === 1 ? "file" : "files"}
                  </span>
                </div>
                <div>
                  <h3 className={`font-bold text-base text-slate-900 ${colors.hover} transition-colors tracking-tight`}>
                    {grade}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Notes, worksheets & Q&A
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recently Uploaded Resources */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Recently Uploaded Resources
            </h2>
          </div>
          <Link
            href="/grades?sortBy=newest"
            className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>Browse All New</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource as any} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-xl">
            <p className="text-sm text-slate-500">
              No resources uploaded yet. Be the first student to contribute!
            </p>
          </div>
        )}
      </section>

      {/* Popular Resources */}
      {popularResources.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Popular Resources
              </h2>
            </div>
            <Link
              href="/grades?sortBy=downloads"
              className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View Most Downloaded</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {popularResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource as any} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Active Discussions */}
      {recentComments.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Recently Active Discussions
            </h2>
          </div>

          <div className="space-y-3">
            {recentComments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <AuthorIdentity
                    username={comment.author.username}
                    grade={comment.author.grade}
                    avatarUrl={comment.author.avatarUrl}
                    size="sm"
                  />
                  <span className="text-[11px] text-slate-400">
                    {formatTimeAgo(comment.createdAt)}
                  </span>
                </div>

                <p className="text-sm text-slate-700 font-sans italic mb-2">
                  "{comment.content}"
                </p>

                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <span>On resource:</span>
                  <Link
                    href={`/resource/${comment.resource.id}`}
                    className="font-semibold text-indigo-600 hover:underline line-clamp-1"
                  >
                    {comment.resource.title} ({comment.resource.grade})
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
