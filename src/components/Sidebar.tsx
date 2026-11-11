"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Upload,
  FolderOpen,
  Bookmark,
  Bell,
  User,
  Shield,
  Layers,
  GraduationCap,
  HelpCircle,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { GRADES } from "@/lib/constants";
import { GradeTag } from "./GradeTag";

export function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Explore Grades", href: "/grades", icon: Layers },
    { label: "Request a Note", href: "/requests", icon: HelpCircle },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { label: "Upload Resource", href: "/upload", icon: Upload },
    { label: "My Uploads", href: "/my-uploads", icon: FolderOpen, authRequired: true },
    { label: "Bookmarks", href: "/bookmarks", icon: Bookmark, authRequired: true },
    {
      label: "Notifications",
      href: "/notifications",
      icon: Bell,
      authRequired: true,
      badge: user?.unreadNotificationsCount && user.unreadNotificationsCount > 0 ? user.unreadNotificationsCount : undefined,
    },
    {
      label: "My Profile",
      href: user ? `/profile/${encodeURIComponent(user.username)}` : "/login",
      icon: User,
      authRequired: true,
    },
    {
      label: "Academic Progression",
      href: "/settings",
      icon: GraduationCap,
      authRequired: true,
    },
  ];

  if (user?.role === "ADMIN") {
    navItems.push({
      label: "Admin Console",
      href: "/admin",
      icon: Shield,
      authRequired: true,
    });
  }

  // Hide sidebar completely when user is logged out or viewing standalone landing page
  if (!user || pathname === "/landing") return null;

  return (
    <aside className={`w-64 bg-[#f5f4ee] border-r border-[#dad9d4] flex flex-col justify-between p-4 shadow-xs ${className}`}>
      <div className="space-y-6">
        {/* User Card in Sidebar */}
        {user ? (
          <div className="p-3.5 bg-gradient-to-b from-indigo-50/50 to-slate-50 border border-indigo-100/70 rounded-xl">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Logged In As
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm truncate">
                {user.username}
              </span>
              <GradeTag grade={user.grade} size="sm" />
            </div>
            <div className="mt-2 text-[11px] text-indigo-600 font-medium flex items-center gap-1">
              <span>●</span> Full Access Across All Grades
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <p className="text-xs text-slate-600 mb-2 font-medium">
              Join the student community to bookmark and upload notes.
            </p>
            <Link
              href="/register"
              className="inline-block w-full py-2 px-3 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all"
            >
              Join PadhoOrion
            </Link>
          </div>
        )}

        {/* Primary Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            if (item.authRequired && !user) return null;
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Grade Quick Jump */}
        <div className="pt-4 border-t border-slate-100">
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            School Grades
          </div>
          <div className="space-y-1">
            {GRADES.map((g) => {
              const gradeSlug = encodeURIComponent(g);
              const isGradeActive = pathname.includes(`/grades/${gradeSlug}`);
              return (
                <Link
                  key={g}
                  href={`/grades/${gradeSlug}`}
                  className={`block px-3 py-1.5 text-xs rounded-lg transition-colors font-medium ${
                    isGradeActive
                      ? "bg-indigo-50 text-indigo-700 font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {g}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 space-y-0.5">
        <p className="font-bold text-slate-700">PadhoOrion Education</p>
        <p>School-Wide Notes Community</p>
      </div>
    </aside>
  );
}
