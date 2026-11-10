"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  FileSpreadsheet,
  PenTool,
  Sparkles,
  HelpCircle,
  Search,
  Filter,
  Upload,
  ArrowLeft,
} from "lucide-react";
import { CATEGORIES, SUBJECTS, GRADES } from "@/lib/constants";
import { ResourceCard } from "@/components/ResourceCard";

export default function GradeDetailPage() {
  const params = useParams();
  const rawGrade = params.grade as string;
  const grade = decodeURIComponent(rawGrade);

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryIcons: Record<string, any> = {
    Notebook: BookOpen,
    Worksheet: FileSpreadsheet,
    "Handwritten Notes": PenTool,
    "AI Notes": Sparkles,
    "Q&A": HelpCircle,
  };

  const fetchResources = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      p.set("grade", grade);
      if (activeCategory !== "all") p.set("category", activeCategory);
      if (selectedSubject !== "all") p.set("subject", selectedSubject);
      if (search.trim()) p.set("search", search.trim());
      p.set("sortBy", sortBy);

      const res = await fetch(`/api/resources?${p.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [grade, activeCategory, selectedSubject, sortBy]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Grade Header */}
      <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 mb-2.5 text-xs text-slate-500 font-medium">
          <Link href="/grades" className="hover:text-indigo-600 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Grades</span>
          </Link>
          <span>/</span>
          <span className="font-bold text-slate-900">{grade}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {grade} Academic Resources
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
              Discover verified lecture notes, practice worksheets, and revision study materials.
            </p>
          </div>

          <Link
            href={`/upload?grade=${encodeURIComponent(grade)}`}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm shadow-indigo-500/20 flex items-center gap-1.5 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload to {grade}</span>
          </Link>
        </div>

        {/* 5 Categories Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCategory === "all"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All Categories
          </button>

          {CATEGORIES.map((cat) => {
            const Icon = categoryIcons[cat.name] || BookOpen;
            const isCatActive = activeCategory === cat.name;

            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isCatActive
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchResources()}
            placeholder={`Search ${grade} topics, chapters, or questions...`}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2">
          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="all">All Subjects</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="likes">Sort: Most Liked</option>
            <option value="downloads">Sort: Most Downloaded</option>
          </select>
        </div>
      </div>

      {/* Resource Count info */}
      <div className="text-xs text-slate-500 font-medium">
        Found <strong className="text-slate-900">{resources.length}</strong> resources in {grade}
        {activeCategory !== "all" && ` • ${activeCategory}`}
        {selectedSubject !== "all" && ` • ${selectedSubject}`}
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse p-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-6 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-full" />
              </div>
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white border-2 border-dashed border-slate-200 rounded-2xl">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-slate-900">
            No resources found in {grade}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Be the first student to upload a {activeCategory !== "all" ? activeCategory : "study note"} for {grade}!
          </p>
          <Link
            href={`/upload?grade=${encodeURIComponent(grade)}`}
            className="mt-4 inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs"
          >
            Upload to {grade}
          </Link>
        </div>
      )}
    </div>
  );
}
