"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, BookOpen, Users, FileText, ArrowRight, User as UserIcon } from "lucide-react";
import { ResourceCard } from "@/components/ResourceCard";
import { UserAvatar } from "@/components/UserAvatar";
import { GradeTag } from "@/components/GradeTag";

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";

  const [query, setQuery] = useState(q);
  const [activeTab, setActiveTab] = useState<"all" | "resources" | "users">("all");
  const [resources, setResources] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const performSearch = async (term: string) => {
    if (!term.trim()) {
      setResources([]);
      setUsers([]);
      return;
    }
    setLoading(true);
    try {
      const [resData, userData] = await Promise.all([
        fetch(`/api/resources?search=${encodeURIComponent(term.trim())}`).then((r) => r.json()),
        fetch(`/api/users/search?q=${encodeURIComponent(term.trim())}`).then((r) => r.json()),
      ]);

      setResources(resData.resources || []);
      setUsers(userData.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [q]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const showResources = activeTab === "all" || activeTab === "resources";
  const showUsers = activeTab === "all" || activeTab === "users";

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Search Header */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          Universal School Search
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-4">
          Find study notes, lecture copies, practice worksheets, and connect with peers across all grades.
        </p>

        <form onSubmit={handleSubmit} className="relative max-w-2xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes, chapters, topics, or student usernames..."
            className="w-full pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            Search
          </button>
        </form>

        {/* Tab Filters */}
        <div className="mt-5 pt-3 border-t border-slate-200 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "all"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            All Results ({resources.length + users.length})
          </button>
          <button
            onClick={() => setActiveTab("resources")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "resources"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Educational Resources ({resources.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "users"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Students & Peers ({users.length})</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-slate-500">Searching PadhoOrion community...</div>
      ) : (
        <div className="space-y-8">
          {/* Section: Matching Students (Requirement 7 & 9) */}
          {showUsers && users.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <h2 className="font-bold text-lg text-slate-900">
                  Student Community Members ({users.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {users.map((u) => (
                  <Link
                    key={u.id}
                    href={`/profile/${encodeURIComponent(u.username)}`}
                    className="p-4 bg-white border border-slate-200 hover:border-indigo-500 rounded-xl shadow-xs hover:shadow-md transition-all flex items-start gap-3 group"
                  >
                    <UserAvatar name={u.username} avatarUrl={u.avatarUrl} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {u.username}
                        </span>
                        {/* Requirement 7: Grade Tag in search results */}
                        <GradeTag grade={u.grade} size="sm" />
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {u.bio || "Student contributor"}
                      </p>
                      <div className="text-[11px] text-indigo-600 font-semibold mt-1">
                        {u._count?.resources ?? 0} uploaded study materials
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Section: Matching Resources */}
          {showResources && resources.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <h2 className="font-bold text-lg text-slate-900">
                  Educational Notes & Worksheets ({resources.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {resources.map((res) => (
                  <ResourceCard key={res.id} resource={res} />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {resources.length === 0 && users.length === 0 && query && (
            <div className="p-12 text-center bg-white border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
              <Search className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-900">
                No matching results found for "{query}"
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching with different keywords, check the spelling, or explore by grade level.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}

