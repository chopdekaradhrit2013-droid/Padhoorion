"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Upload, Search } from "lucide-react";
import { CATEGORIES, SUBJECTS } from "@/lib/constants";
import { ResourceCard } from "@/components/ResourceCard";

export default function GradeCategoryPage() {
  const params = useParams();
  const rawGrade = params.grade as string;
  const grade = decodeURIComponent(rawGrade);
  const rawCat = params.category as string;
  const categorySlug = decodeURIComponent(rawCat);

  const catObj = CATEGORIES.find(
    (c) => c.slug === categorySlug.toLowerCase() || c.name.toLowerCase() === categorySlug.toLowerCase()
  );
  const categoryName = catObj ? catObj.name : categorySlug;

  const [selectedSubject, setSelectedSubject] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const p = new URLSearchParams();
        p.set("grade", grade);
        p.set("category", categoryName);
        if (selectedSubject !== "all") p.set("subject", selectedSubject);
        if (search.trim()) p.set("search", search.trim());
        p.set("sortBy", sortBy);

        const res = await fetch(`/api/resources?${p.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setResources(data.resources || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [grade, categoryName, selectedSubject, sortBy]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 mb-2 text-xs text-slate-500 font-medium">
          <Link href={`/grades/${encodeURIComponent(grade)}`} className="hover:text-indigo-600 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{grade}</span>
          </Link>
          <span>/</span>
          <span className="font-bold text-slate-900">{categoryName}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {grade} • {categoryName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
              {catObj?.description || `Authentic student resources in ${categoryName}.`}
            </p>
          </div>

          <Link
            href={`/upload?grade=${encodeURIComponent(grade)}&category=${encodeURIComponent(categoryName)}`}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm shadow-indigo-500/20 flex items-center gap-1.5 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload {categoryName}</span>
          </Link>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Filter ${categoryName} by topic or chapter...`}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-700 font-medium"
          >
            <option value="all">All Subjects</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-700 font-medium"
          >
            <option value="newest">Sort: Newest</option>
            <option value="likes">Sort: Likes</option>
            <option value="downloads">Sort: Downloads</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-8 text-center text-sm text-slate-500">Loading resources...</div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((res) => (
            <ResourceCard key={res.id} resource={res} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white border-2 border-dashed border-slate-200 rounded-2xl">
          <p className="text-sm text-slate-500">No {categoryName} files uploaded yet for {grade}.</p>
        </div>
      )}
    </div>
  );
}
