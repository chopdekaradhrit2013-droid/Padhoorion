"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle,
  MessageSquare,
  Heart,
  Megaphone,
  Shield,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthorIdentity } from "@/components/AuthorIdentity";
import { formatTimeAgo } from "@/lib/utils";

export default function NotificationsPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/notifications");
      return;
    }
    fetchNotifications();
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (res.ok) {
        await fetchNotifications();
        await refreshUser();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      await fetchNotifications();
      await refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-6 space-y-6 animate-fade-in">
      <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700 mb-2.5">
            <Bell className="w-3.5 h-3.5 text-indigo-600" />
            <span>Community Alerts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
            Stay updated when students comment on your resources, reply to your questions, or when teachers post announcements.
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-slate-500 font-medium">Loading notifications...</div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && handleMarkRead(n.id)}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                n.isRead
                  ? "bg-white border-slate-200 text-slate-600"
                  : "bg-indigo-50/40 border-indigo-200 shadow-xs text-slate-900"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-2.5 rounded-xl mt-0.5 shrink-0 ${
                    n.type === "ANNOUNCEMENT"
                      ? "bg-rose-500 text-white"
                      : n.type === "LIKE"
                      ? "bg-rose-100 text-rose-600"
                      : "bg-indigo-100 text-indigo-600"
                  }`}
                >
                  {n.type === "ANNOUNCEMENT" ? (
                    <Megaphone className="w-4 h-4" />
                  ) : n.type === "LIKE" ? (
                    <Heart className="w-4 h-4 fill-current text-rose-500" />
                  ) : (
                    <MessageSquare className="w-4 h-4" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">
                      {n.title}
                    </h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {n.message}
                  </p>

                  <div className="text-[11px] text-slate-400 font-medium pt-1">
                    {formatTimeAgo(n.createdAt)}
                  </div>
                </div>
              </div>

              {n.link && (
                <Link
                  href={n.link}
                  className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-indigo-600 flex items-center gap-1 shrink-0 shadow-2xs"
                >
                  <span>View</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
          <Bell className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-base text-slate-900">
            All caught up!
          </h3>
          <p className="text-xs text-slate-500">
            You have no notifications at this time.
          </p>
        </div>
      )}
    </div>
  );
}
