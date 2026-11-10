"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Layers,
  Search,
  Filter,
  ArrowUpDown,
  BookOpen,
} from "lucide-react";
import { GRADES, CATEGORIES, SUBJECTS } from "@/lib/constants";
import { ResourceCard } from "@/components/ResourceCard";

function ExploreGradesContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialSort = searchParams.get("sortBy") || "newest";

  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState(initialSort);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedGrade !== "all") params.set("grade", selectedGrade);
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (selectedSubject !== "all") params.set("subject", selectedSubject);
      if (search.trim()) params.set("search", search.trim());
      params.set("sortBy", sortBy);

      const res = await fetch(`/api/resources?${params.toString()}`);
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
  }, [selectedGrade, selectedCategory, selectedSubject, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700 mb-2.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Open Grade Explorer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore All School Grades & Notes
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
              PadhoOrion open access rule: You have unlimited access to view, download, discuss, and upload notes across all grades.
            </p>
          </div>

          <Link
            href="/upload"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm shadow-indigo-500/20 transition-all hover:shadow-md"
          >
            + Upload to Any Grade
          </Link>
        </div>

        {/* Grade Pills */}
        <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100">
          <button
            onClick={() => setSelectedGrade("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedGrade === "all"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All Grades (6th - 10th)
          </button>
          {GRADES.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGrade(g)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedGrade === g
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes, chapters, topics, or authors..."
            className="w-full pl-9 pr-20 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-md hover:bg-indigo-700"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="all">All 5 Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Subject Dropdown */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="all">All Subjects</option>
            {SUBJECTS.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
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

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>
          Showing <strong className="text-slate-900 font-bold">{resources.length}</strong> resources
          {selectedGrade !== "all" && ` in ${selectedGrade}`}
          {selectedCategory !== "all" && ` (${selectedCategory})`}
        </span>
      </div>

      {/* Resource Grid */}
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
            No resources match these filters
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms, grade, category, or be the first to share notes here!
          </p>
          <Link
            href="/upload"
            className="mt-4 inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs"
          >
            Upload Notes Now
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ExploreGradesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">Loading grades explorer...</div>}>
      <ExploreGradesContent />
    </Suspense>
  );
}
