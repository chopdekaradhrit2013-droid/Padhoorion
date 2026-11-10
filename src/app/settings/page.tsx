"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  User,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { GRADES, GradeType } from "@/lib/constants";
import { GradeTag } from "@/components/GradeTag";
import { UserAvatar } from "@/components/UserAvatar";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [selectedGrade, setSelectedGrade] = useState<GradeType>("7th Grade");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [gradeLoading, setGradeLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [gradeMessage, setGradeMessage] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setSelectedGrade(user.grade as GradeType);
      setBio(user.bio || "");
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user]);

  if (!user) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl max-w-md mx-auto my-8">
        <p className="text-sm text-slate-500 mb-3">Please log in to manage your profile and academic progression.</p>
        <button
          onClick={() => router.push("/login")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Academic Grade Progression Submit
  const handleGradeProgression = async (e: React.FormEvent) => {
    e.preventDefault();
    setGradeLoading(true);
    setError(null);
    setGradeMessage(null);

    try {
      const res = await fetch("/api/users/update-grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newGrade: selectedGrade }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update grade progression.");
      }

      setGradeMessage(data.message);
      await refreshUser();
    } catch (err: any) {
      setError(err.message || "Failed to update grade progression.");
    } finally {
      setGradeLoading(false);
    }
  };

  // Profile details update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/users/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, avatarUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      setProfileMessage(data.message);
      await refreshUser();
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-6 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Profile Settings & Academic Progression
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
          Update your academic standing as you advance through school grades, while preserving all your historical contributions.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grade Progression Section (Requirement 8) */}
      <div className="bg-white border-2 border-indigo-200 rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Academic Grade Progression
            </h2>
            <p className="text-xs text-slate-500">
              Advance your grade tag (e.g. 7th Grade → 8th Grade) as you progress academically.
            </p>
          </div>
        </div>

        {gradeMessage && (
          <div className="my-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-xl flex items-center gap-2 font-medium">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{gradeMessage}</span>
          </div>
        )}

        <form onSubmit={handleGradeProgression} className="mt-4 space-y-4">
          <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600">Current Live Grade Tag:</span>
              <GradeTag grade={user.grade} size="md" />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
              * Updating your grade here will immediately update your public grade tag across your live profile and future posts. All previous uploads, comments, and replies will be retained with their historical publish-time stamp.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Select New Academic Grade
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value as GradeType)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g} {g === user.grade ? "(Current)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400 font-medium">
              Example: 7th Grade → 8th Grade
            </span>
            <button
              type="submit"
              disabled={gradeLoading || selectedGrade === user.grade}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs shadow-indigo-500/20 transition-all disabled:opacity-50"
            >
              {gradeLoading ? "Advancing Grade..." : "Update Academic Grade"}
            </button>
          </div>
        </form>
      </div>

      {/* Profile Details Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          Personal Information & Avatar
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Customize your bio and avatar image.
        </p>

        {profileMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-xl flex items-center gap-2 font-medium">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{profileMessage}</span>
          </div>
        )}

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Bio / School Intro
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other students what subjects you like and what notes you specialize in..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Profile Picture URL
            </label>
            <div className="flex items-center gap-3">
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://... (or leave empty to show first initial)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
              />
              <UserAvatar
                name={user.username}
                avatarUrl={avatarUrl.trim() || undefined}
                size="md"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={profileLoading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs shadow-indigo-500/20 transition-all disabled:opacity-50"
            >
              {profileLoading ? "Saving..." : "Save Profile Details"}
            </button>
          </div>
        </form>
      </div>

      {/* Account Status Card */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600 font-medium">
        <div>
          <span className="font-bold text-slate-900">Account Status:</span>{" "}
          <span className="text-emerald-700 font-bold">Active PadhoOrion Member (Full Access)</span>
        </div>
      </div>
    </div>
  );
}
