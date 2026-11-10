"use client";

import React, { useEffect, useState } from "react";
import { Megaphone, AlertCircle, X } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: "NORMAL" | "HIGH" | "URGENT";
  durationOption: string;
  expiresAt: string | null;
  createdAt: string;
  author?: {
    username: string;
    role: string;
  };
}

export function AnnouncementsBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch("/api/announcements/active");
        if (res.ok) {
          const data = await res.json();
          setAnnouncements(data.announcements || []);
        }
      } catch (err) {
        console.error("Failed to load announcements:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnnouncements();
  }, []);

  const visibleAnnouncements = announcements.filter(
    (a) => !dismissed.includes(a.id)
  );

  if (loading || visibleAnnouncements.length === 0) {
    return null;
  }

  const handleDismiss = (id: string) => {
    setDismissed((prev) => [...prev, id]);
  };

  return (
    <div className="space-y-3 mb-6">
      {visibleAnnouncements.map((item) => {
        const isUrgent = item.priority === "URGENT";
        const isHigh = item.priority === "HIGH";

        return (
          <div
            key={item.id}
            className={`relative p-4 rounded-xl border shadow-xs transition-all ${
              isUrgent
                ? "bg-rose-50/80 border-rose-200 text-rose-950"
                : isHigh
                ? "bg-amber-50/80 border-amber-200 text-amber-950"
                : "bg-indigo-50/80 border-indigo-200 text-indigo-950"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                  isUrgent
                    ? "bg-rose-600 text-white"
                    : isHigh
                    ? "bg-amber-500 text-white"
                    : "bg-indigo-600 text-white"
                }`}
              >
                {isUrgent ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <Megaphone className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 pr-6">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      isUrgent
                        ? "bg-rose-100 border-rose-300 text-rose-800"
                        : isHigh
                        ? "bg-amber-100 border-amber-300 text-amber-800"
                        : "bg-indigo-100 border-indigo-300 text-indigo-800"
                    }`}
                  >
                    {item.priority} NOTICE
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Posted by Administrator • {item.author?.username || "Adhrit"}
                  </span>
                </div>

                <h4 className="font-bold text-sm sm:text-base text-slate-900">
                  {item.title}
                </h4>

                <p className="mt-1 text-sm text-slate-700 leading-relaxed font-sans">
                  {item.content}
                </p>
              </div>

              <button
                onClick={() => handleDismiss(item.id)}
                className="absolute top-3 right-3 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
                title="Dismiss notice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
