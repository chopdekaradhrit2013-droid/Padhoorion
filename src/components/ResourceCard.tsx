"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Image as ImageIcon,
  Download,
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  Check,
} from "lucide-react";
import { AuthorIdentity } from "./AuthorIdentity";
import { formatTimeAgo } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { GradeTag } from "./GradeTag";

interface ResourceCardProps {
  resource: {
    id: string;
    title: string;
    description: string;
    grade: string;
    category: string;
    subject: string;
    chapter: string;
    topic: string;
    fileName: string;
    fileType: string;
    fileSize?: number;
    fileUrl?: string;
    viewsCount?: number;
    downloadsCount?: number;
    createdAt: string | Date;
    authorGradeAtPublish?: string;
    author: {
      id: string;
      username: string;
      grade: string;
      avatarUrl?: string | null;
    };
    _count?: {
      likes: number;
      bookmarks?: number;
      comments: number;
    };
  };
  onLikeToggle?: () => void;
  onBookmarkToggle?: () => void;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const { user } = useAuth();
  const [likesCount, setLikesCount] = useState(resource._count?.likes ?? 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isPdf = resource.fileType?.includes("pdf") || resource.fileName?.endsWith(".pdf");

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = "/login";
      return;
    }

    try {
      const res = await fetch(`/api/resources/${resource.id}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.liked);
        setLikesCount(data.likesCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = "/login";
      return;
    }

    try {
      const res = await fetch(`/api/resources/${resource.id}/bookmark`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsBookmarked(data.bookmarked);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDownloading(true);
    try {
      const res = await fetch(`/api/resources/${resource.id}/download`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        const link = document.createElement("a");
        link.href = data.fileUrl;
        link.download = data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/resource/${resource.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 hover:border-[#c96442] dark:hover:border-[#c96442] rounded-xl shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden">
      <div className="p-5">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <GradeTag grade={resource.grade} size="sm" />
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
              {resource.category}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300">
              {resource.subject}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-400">
            {isPdf ? (
              <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold text-[11px] bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-100 dark:border-rose-900">
                <FileText className="w-3 h-3" /> PDF
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[#c96442] font-bold text-[11px] bg-[#fbeee8] dark:bg-[#c96442]/20 px-2 py-0.5 rounded-md border border-[#f5d0c2] dark:border-[#c96442]/30">
                <ImageIcon className="w-3 h-3" /> Image
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <Link href={`/resource/${resource.id}`} className="block group-hover:text-[#c96442] transition-colors">
          <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-stone-100 group-hover:text-[#c96442] leading-snug line-clamp-2 mb-1.5 tracking-tight">
            {resource.title}
          </h3>
        </Link>

        {/* Chapter & Topic */}
        <div className="text-xs text-slate-500 dark:text-stone-400 mb-2.5 line-clamp-1 font-medium">
          <span className="text-slate-800 dark:text-stone-200 font-semibold">{resource.chapter}</span> • {resource.topic}
        </div>

        {/* Description snippet */}
        <p className="text-sm text-slate-600 dark:text-stone-300 line-clamp-2 font-sans mb-4 leading-relaxed">
          {resource.description}
        </p>

        {/* Author Identity with Mandatory Grade Tag */}
        <div className="pt-3 border-t border-slate-100 dark:border-stone-800 flex items-center justify-between text-xs">
          <AuthorIdentity
            username={resource.author.username}
            grade={resource.author.grade}
            avatarUrl={resource.author.avatarUrl}
            size="sm"
          />
          <span className="text-slate-400 text-[11px]">
            {formatTimeAgo(resource.createdAt)}
          </span>
        </div>
      </div>

      {/* Footer Actions & Stats */}
      <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            className={`inline-flex items-center gap-1 transition-colors ${
              isLiked ? "text-rose-600 font-bold" : "hover:text-slate-900"
            }`}
            title="Like this resource"
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current text-rose-500" : ""}`} />
            <span>{likesCount}</span>
          </button>

          <Link
            href={`/resource/${resource.id}#comments`}
            className="inline-flex items-center gap-1 hover:text-indigo-600 transition-colors"
            title="View discussion"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{resource._count?.comments ?? 0}</span>
          </Link>

          <span className="inline-flex items-center gap-1 text-slate-400" title="Downloads">
            <Download className="w-3.5 h-3.5" />
            <span>{resource.downloadsCount ?? 0}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShare}
            className="p-1.5 rounded-md hover:bg-slate-200/60 text-slate-500 hover:text-slate-900 transition-colors"
            title="Share link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleBookmark}
            className={`p-1.5 rounded-md hover:bg-slate-200/60 transition-colors ${
              isBookmarked ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-900"
            }`}
            title="Bookmark resource"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-current text-indigo-600" : ""}`} />
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1 shadow-xs shadow-indigo-500/20 transition-all"
            title="Download resource file"
          >
            <Download className="w-3 h-3" />
            <span>{downloading ? "..." : "Get"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
