"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  User as UserIcon,
  Calendar,
  BookOpen,
  MessageSquare,
  Award,
  Sparkles,
  ArrowLeft,
  Settings,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "@/components/UserAvatar";
import { GradeTag } from "@/components/GradeTag";
import { ResourceCard } from "@/components/ResourceCard";
import { formatTimeAgo } from "@/lib/utils";

export default function UserProfilePage() {
  const params = useParams();
  const rawUsername = params.username as string;
  const username = decodeURIComponent(rawUsername);
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"uploads" | "activity">("uploads");

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/profile?username=${encodeURIComponent(username)}`);
        if (res.ok) {
          const data = await res.json();
          setProfileUser(data.user);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (username) fetchProfile();
  }, [username]);

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-500 font-medium">Loading profile...</div>;
  }

  if (!profileUser) {
    return (
      <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
        <h2 className="font-extrabold text-xl text-slate-900">Student Not Found</h2>
        <p className="text-xs text-slate-500">The user "{username}" does not exist or has been removed.</p>
        <Link href="/" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold">
          Return Home
        </Link>
      </div>
    );
  }

  const isOwnProfile = currentUser?.username === profileUser.username;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <Link href="/grades" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-medium">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Explorer</span>
      </Link>

      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <UserAvatar
            name={profileUser.username}
            avatarUrl={profileUser.avatarUrl}
            size="xl"
            className="ring-4 ring-indigo-100"
          />

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {profileUser.username}
              </h1>
              {/* Mandatory Grade Tag */}
              <GradeTag grade={profileUser.grade} size="lg" />

              {profileUser.role === "ADMIN" && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white">
                  ADMINISTRATOR
                </span>
              )}
            </div>

            <p className="text-sm text-slate-600 font-sans max-w-2xl leading-relaxed">
              {profileUser.bio || "Active student contributor on PadhoOrion school knowledge sharing community."}
            </p>

            {/* Student Badges Strip */}
            {profileUser.badges && profileUser.badges.length > 0 && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                {profileUser.badges.map((b: any) => (
                  <span
                    key={b.id}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${b.color}`}
                    title={b.desc}
                  >
                    <span>{b.icon}</span>
                    <span>{b.label}</span>
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-500 font-medium">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#c96442]" />
                <span>Joined {new Date(profileUser.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#c96442]" />
                <strong className="text-slate-900 font-bold">{profileUser._count?.resources || 0}</strong> uploads
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#c96442]" />
                <strong className="text-slate-900 font-bold">{profileUser._count?.comments || 0}</strong> comments
              </span>
              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fbeee8] border border-[#f5d0c2] text-[#c96442] font-black hover:bg-[#c96442] hover:text-white transition"
                title="View Rank on Leaderboard"
              >
                <span>🏆 {profileUser.points || 0} Reputation Pts</span>
              </Link>
            </div>
          </div>

          {isOwnProfile && (
            <Link
              href="/settings"
              className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Settings className="w-4 h-4" />
              <span>Edit Profile & Grade</span>
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("uploads")}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "uploads"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Uploaded Resources ({profileUser.resources?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "activity"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Recent Activity ({profileUser.activities?.length || 0})</span>
        </button>
      </div>

      {/* Tab 1: Uploads */}
      {activeTab === "uploads" && (
        <div>
          {profileUser.resources && profileUser.resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {profileUser.resources.map((res: any) => (
                <ResourceCard
                  key={res.id}
                  resource={{
                    ...res,
                    author: {
                      id: profileUser.id,
                      username: profileUser.username,
                      grade: profileUser.grade,
                      avatarUrl: profileUser.avatarUrl,
                    },
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-xs text-slate-500 font-medium">
              {profileUser.username} has not uploaded any educational resources yet.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Recent Activity */}
      {activeTab === "activity" && (
        <div className="space-y-3">
          {profileUser.activities && profileUser.activities.length > 0 ? (
            profileUser.activities.map((act: any) => (
              <div
                key={act.id}
                className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex items-start justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {act.title}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                      Published in: [{act.gradeAtTime}]
                    </span>
                  </div>
                  {act.description && (
                    <p className="text-xs text-slate-600 mt-1 font-medium">
                      {act.description}
                    </p>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                  {formatTimeAgo(act.createdAt)}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-xs text-slate-500 font-medium">
              No community activity logged yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
