"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  Bell,
  Upload,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  Compass,
  Layers,
  GraduationCap,
  Bookmark,
  Home,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "./UserAvatar";
import { GradeTag } from "./GradeTag";
import { GRADES } from "@/lib/constants";

export function Navbar() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            <Link href="/" className="flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="PadhoOrion Logo"
                className="w-10 h-10 rounded-xl object-contain shadow-xs border border-slate-200"
              />
              <div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  PadhoOrion
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-indigo-600 -mt-1 font-sans">
                  School Community
                </span>
              </div>
            </Link>
          </div>

          {/* Global Search Bar (Only shown for authenticated students) */}
          {user && (
            <form
              onSubmit={handleSearch}
              className="hidden sm:flex flex-1 max-w-md items-center relative"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, chapters, topics, or peers..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all shadow-2xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            </form>
          )}

          {/* Right Nav Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <Link
                  href="/upload"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 transition-all hover:shadow-md"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                </Link>

                {/* Notifications */}
                <Link
                  href="/notifications"
                  className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {user.unreadNotificationsCount ? user.unreadNotificationsCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                      {user.unreadNotificationsCount > 9 ? "9+" : user.unreadNotificationsCount}
                    </span>
                  ) : null}
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                  >
                    <UserAvatar
                      name={user.username}
                      avatarUrl={user.avatarUrl}
                      size="sm"
                    />
                    <div className="hidden lg:flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-900 leading-none">
                        {user.username}
                      </span>
                      <span className="text-[10px] text-indigo-600 font-semibold mt-0.5 leading-none">
                        {user.grade}
                      </span>
                    </div>
                  </button>

                  {dropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-sm">
                        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                          <p className="font-bold text-slate-900">
                            {user.username}
                          </p>
                          <div className="mt-1 flex items-center gap-1.5">
                            <GradeTag grade={user.grade} size="sm" />
                            {user.role === "ADMIN" && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-500 text-white rounded">
                                ADMIN
                              </span>
                            )}
                          </div>
                        </div>

                        <Link
                          href={`/profile/${encodeURIComponent(user.username)}`}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          <span>My Public Profile</span>
                        </Link>

                        <Link
                          href="/my-uploads"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
                        >
                          <BookOpen className="w-4 h-4 text-slate-400" />
                          <span>My Uploads</span>
                        </Link>

                        <Link
                          href="/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
                        >
                          <Compass className="w-4 h-4 text-slate-400" />
                          <span>Grade Progression</span>
                        </Link>

                        {user.role === "ADMIN" && (
                          <Link
                            href="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-rose-600 font-semibold hover:bg-rose-50 transition-colors border-t border-slate-100"
                          >
                            <ShieldAlert className="w-4 h-4" />
                            <span>Admin Console</span>
                          </Link>
                        )}

                        <div className="border-t border-slate-100 my-1" />

                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 transition-all hover:shadow-md"
                >
                  Join Community
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-white border-r border-slate-200 shadow-2xl p-5 flex flex-col justify-between overflow-y-auto z-10 animate-fade-in">
            <div className="space-y-5">
              {/* Drawer Brand */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <img
                    src="/logo.png"
                    alt="PadhoOrion"
                    className="w-8 h-8 rounded-lg object-contain border border-slate-200"
                  />
                  <span className="font-extrabold text-lg text-slate-900">PadhoOrion</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search resources & peers..."
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </form>

              {/* User summary if logged in */}
              {user && (
                <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <UserAvatar name={user.username} avatarUrl={user.avatarUrl} size="sm" />
                    <div>
                      <div className="font-bold text-xs text-slate-900">{user.username}</div>
                      <GradeTag grade={user.grade} size="sm" />
                    </div>
                  </div>
                </div>
              )}

              {/* Nav Links */}
              <nav className="space-y-1 text-xs font-semibold">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 p-2 rounded-lg text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <Home className="w-4 h-4 text-indigo-500" />
                  <span>Home Dashboard</span>
                </Link>

                <Link
                  href="/grades"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 p-2 rounded-lg text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span>Explore Grades</span>
                </Link>

                <Link
                  href="/upload"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 p-2 rounded-lg text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <Upload className="w-4 h-4 text-indigo-500" />
                  <span>Upload Resource</span>
                </Link>

                <Link
                  href="/bookmarks"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 p-2 rounded-lg text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <Bookmark className="w-4 h-4 text-indigo-500" />
                  <span>Bookmarks</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 p-2 rounded-lg text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                  <span>Grade Progression</span>
                </Link>

                {user?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-lg text-rose-600 font-bold hover:bg-rose-50"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Admin Console</span>
                  </Link>
                )}
              </nav>

              {/* Grades Jump */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  School Grades
                </div>
                <div className="space-y-1">
                  {GRADES.map((g) => (
                    <Link
                      key={g}
                      href={`/grades/${encodeURIComponent(g)}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-1.5 rounded-md text-xs text-slate-700 hover:bg-slate-100 font-medium"
                    >
                      {g}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100">
              {user ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-rose-600 font-bold rounded-lg text-xs"
                >
                  Log Out
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 text-center bg-slate-100 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-200"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 text-center bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
