"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Users,
  FileText,
  MessageSquare,
  Flag,
  Megaphone,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Plus,
  Key,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ANNOUNCEMENT_DURATIONS } from "@/lib/constants";
import { UserAvatar } from "@/components/UserAvatar";
import { GradeTag } from "@/components/GradeTag";
import { formatTimeAgo } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"overview" | "users" | "reports" | "announcements">("overview");
  const [stats, setStats] = useState<any>(null);

  // Users tab state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userLoading, setUserLoading] = useState(false);

  // Reports tab state
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Announcements tab state
  const [announcementsList, setAnnouncementsList] = useState<any[]>([]);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementPriority, setAnnouncementPriority] = useState<"NORMAL" | "HIGH" | "URGENT">("NORMAL");
  const [announcementDuration, setAnnouncementDuration] = useState<string>("7_DAYS");
  const [announcementSubmitting, setAnnouncementSubmitting] = useState(false);
  const [announcementNotice, setAnnouncementNotice] = useState<string | null>(null);

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Admin test access state
  const [resetModalUser, setResetModalUser] = useState<any | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState("TestPass@2026");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  // Moderation Modals State (Warn, Ban, Unban)
  const [warnModalUser, setWarnModalUser] = useState<any | null>(null);
  const [warnReasonInput, setWarnReasonInput] = useState("");
  const [warnSubmitting, setWarnSubmitting] = useState(false);

  const [banModalUser, setBanModalUser] = useState<any | null>(null);
  const [banReasonInput, setBanReasonInput] = useState("");
  const [banSubmitting, setBanSubmitting] = useState(false);

  const [unbanModalUser, setUnbanModalUser] = useState<any | null>(null);
  const [unbanSubmitting, setUnbanSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/");
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/overview");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    setUserLoading(true);
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(userSearch)}`);
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUserLoading(false);
    }
  };

  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      const res = await fetch("/api/admin/reports");
      if (res.ok) {
        const data = await res.json();
        setReportsList(data.reports || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReportsLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/admin/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncementsList(data.announcements || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchStats();
      if (activeTab === "users") fetchUsers();
      if (activeTab === "reports") fetchReports();
      if (activeTab === "announcements") fetchAnnouncements();
    }
  }, [user, activeTab]);

  const handleWarnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warnModalUser) return;
    const cleanReason = warnReasonInput.trim();
    if (!cleanReason) {
      alert("Please provide a reason for the warning.");
      return;
    }

    setWarnSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: warnModalUser.id,
          action: "warn",
          reason: cleanReason,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMessage(data.message);
        setWarnModalUser(null);
        setWarnReasonInput("");
        await fetchUsers();
        await fetchStats();
        setTimeout(() => setFeedbackMessage(null), 4000);
      } else {
        alert(data.error || "Failed to issue warning.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error issuing warning.");
    } finally {
      setWarnSubmitting(false);
    }
  };

  const handleBanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!banModalUser) return;
    const cleanReason = banReasonInput.trim();
    if (!cleanReason) {
      alert("Please provide a reason for the ban.");
      return;
    }

    setBanSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: banModalUser.id,
          action: "ban",
          reason: cleanReason,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMessage(data.message);
        setBanModalUser(null);
        setBanReasonInput("");
        await fetchUsers();
        await fetchStats();
        setTimeout(() => setFeedbackMessage(null), 4000);
      } else {
        alert(data.error || "Failed to ban user.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error executing ban.");
    } finally {
      setBanSubmitting(false);
    }
  };

  const handleUnbanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unbanModalUser) return;

    setUnbanSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: unbanModalUser.id,
          action: "unban",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMessage(data.message);
        setUnbanModalUser(null);
        await fetchUsers();
        await fetchStats();
        setTimeout(() => setFeedbackMessage(null), 4000);
      } else {
        alert(data.error || "Failed to unban user.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error unbanning user.");
    } finally {
      setUnbanSubmitting(false);
    }
  };

  const handleImpersonate = async (targetUser: any) => {
    if (
      !confirm(
        `Start test session as "${targetUser.username}" (${targetUser.grade})?\n\nYou will be logged into their account to test actions, and can exit back to Admin at any time via the top banner.`
      )
    ) {
      return;
    }

    try {
      setFeedbackMessage(`Initiating testing session as ${targetUser.username}...`);
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: targetUser.id }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = "/";
      } else {
        alert(data.error || "Failed to start test session.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error starting test session.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser) return;
    if (newPasswordInput.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    setResetLoading(true);
    setResetSuccessMsg(null);
    try {
      const res = await fetch("/api/admin/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: resetModalUser.id,
          newPassword: newPasswordInput,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetSuccessMsg(
          `Password for ${resetModalUser.username} set to "${newPasswordInput}". You can copy this test password to log in directly.`
        );
      } else {
        alert(data.error || "Failed to update password.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error updating password.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleResolveReport = async (reportId: string, status: "RESOLVED" | "DISMISSED") => {
    try {
      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status }),
      });
      if (res.ok) {
        await fetchReports();
        await fetchStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    try {
      const res = await fetch(`/api/resources/${resourceId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchReports();
        await fetchStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await fetch(`/api/comments?id=${commentId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchReports();
        await fetchStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnnouncementSubmitting(true);
    setAnnouncementNotice(null);

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: announcementTitle,
          content: announcementContent,
          priority: announcementPriority,
          durationOption: announcementDuration,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAnnouncementNotice("Announcement published successfully and notified to all students!");
        setAnnouncementTitle("");
        setAnnouncementContent("");
        await fetchAnnouncements();
        await fetchStats();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnnouncementSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchAnnouncements();
        await fetchStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl max-w-md mx-auto my-12">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="font-extrabold text-lg text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-500 mt-1">
          Only authorized PadhoOrion school administrators can access this moderation interface.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto my-6 space-y-6 animate-fade-in">
      {/* Admin Header */}
      <div className="p-6 sm:p-8 bg-white border-2 border-slate-200 rounded-2xl shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-tr from-rose-600 to-rose-500 text-white rounded-xl shadow-md shadow-rose-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                School Administrative Console
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Logged in as School Administrator: <strong className="text-slate-800">{user.username}</strong>
              </p>
            </div>
          </div>
        </div>

        {feedbackMessage && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-xl">
            {feedbackMessage}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "overview"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            System Overview
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "users"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Registered Users ({stats?.totalUsers || 0})
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "reports"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Report Queue ({stats?.pendingReportsCount || 0} Pending)
          </button>

          <button
            onClick={() => setActiveTab("announcements")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "announcements"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            School Announcements ({stats?.activeAnnouncementsCount || 0})
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-xs text-slate-400 uppercase font-bold">Total Users</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalUsers}</div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-xs text-slate-400 uppercase font-bold">Total Resources</span>
              <div className="text-2xl font-extrabold text-indigo-600 mt-1">{stats.totalResources}</div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-xs text-slate-400 uppercase font-bold">Total Comments</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalComments}</div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-xs text-slate-400 uppercase font-bold">Pending Reports</span>
              <div className="text-2xl font-extrabold text-rose-600 mt-1">{stats.pendingReportsCount}</div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-xs text-slate-400 uppercase font-bold">Announcements</span>
              <div className="text-2xl font-extrabold text-indigo-600 mt-1">{stats.activeAnnouncementsCount}</div>
            </div>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <h3 className="font-bold text-base text-slate-900">
              Administrative Policies & Controls
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              As a school administrator, you have permissions to moderate educational materials, suspend student accounts violating community standards, broadcast school announcements across grades, and review student complaints. All operations are strictly validated on the backend.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: REGISTERED USERS MANAGEMENT */}
      {activeTab === "users" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <h2 className="font-bold text-lg text-slate-900">
              Registered Student Accounts
            </h2>
            <div className="relative max-w-xs">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
                placeholder="Search username, email, grade..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-700 font-bold">
                  <th className="p-3">User & Grade Tag</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Uploads</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <UserAvatar name={u.username} avatarUrl={u.avatarUrl} size="xs" />
                        <span className="font-bold text-slate-900">{u.username}</span>
                        <GradeTag grade={u.grade} size="sm" />
                      </div>
                    </td>
                    <td className="p-3 text-slate-500">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === "ADMIN" ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-700"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-900 font-semibold">{u._count?.resources ?? 0}</td>
                    <td className="p-3">
                      {u.isBanned ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            BANNED
                          </span>
                          <p className="text-[10px] text-rose-600 font-medium truncate max-w-[160px]" title={u.banReason || "Policy violation"}>
                            Reason: {u.banReason || "Policy violation"}
                          </p>
                        </div>
                      ) : (u.warningCount || 0) > 0 ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                            <AlertTriangle className="w-3 h-3 text-amber-700" />
                            WARN {u.warningCount}/3
                          </span>
                          <p className="text-[10px] text-amber-800 font-medium truncate max-w-[160px]" title={u.lastWarningReason || "Warning issued"}>
                            {3 - u.warningCount} left: &ldquo;{u.lastWarningReason}&rdquo;
                          </p>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          ACTIVE (0/3)
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {u.id !== user.id && (
                          <>
                            <button
                              onClick={() => handleImpersonate(u)}
                              disabled={u.isBanned}
                              title={`Log into ${u.username}'s session for testing`}
                              className="px-2 py-1 bg-[#faf9f5] hover:bg-stone-200 text-[#3d3929] border border-stone-300 rounded-lg text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <LogIn className="w-3 h-3 text-[#c96442]" />
                              <span>Login As</span>
                            </button>

                            <button
                              onClick={() => {
                                setResetModalUser(u);
                                setNewPasswordInput("TestPass@2026");
                                setResetSuccessMsg(null);
                              }}
                              title="Set or reset account password for testing"
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1"
                            >
                              <Key className="w-3 h-3 text-amber-700" />
                              <span>Set Password</span>
                            </button>

                            {!u.isBanned ? (
                              <>
                                <button
                                  onClick={() => {
                                    setWarnModalUser(u);
                                    setWarnReasonInput("");
                                  }}
                                  title={`Issue warning to ${u.username} (${u.warningCount || 0}/3)`}
                                  className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1"
                                >
                                  <AlertTriangle className="w-3 h-3 text-amber-700" />
                                  <span>Warn</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setBanModalUser(u);
                                    setBanReasonInput("");
                                  }}
                                  title={`Permanently ban ${u.username}`}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1"
                                >
                                  <ShieldAlert className="w-3 h-3" />
                                  <span>Ban</span>
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setUnbanModalUser(u)}
                                title={`Restore access for ${u.username}`}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1"
                              >
                                <CheckCircle className="w-3 h-3" />
                                <span>Unban</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: REPORT QUEUE */}
      {activeTab === "reports" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 space-y-4">
          <h2 className="font-bold text-lg text-slate-900">
            Content Reports & Moderation Queue
          </h2>

          {reportsLoading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading reports...</div>
          ) : reportsList.length > 0 ? (
            <div className="space-y-4">
              {reportsList.map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-600 text-white">
                        {rep.targetType} REPORT
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        Reason: {rep.reason}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        rep.status === "PENDING"
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {rep.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Reported by {rep.reporter?.username} [{rep.reporter?.grade}] • {formatTimeAgo(rep.createdAt)}
                    </span>
                  </div>

                  {rep.details && (
                    <p className="text-xs text-slate-700 italic bg-white p-3 rounded-lg border border-slate-200">
                      "{rep.details}"
                    </p>
                  )}

                  {/* Target Preview */}
                  {rep.resource && (
                    <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1">
                      <span className="font-bold text-slate-400 uppercase text-[10px]">Resource Details:</span>
                      <p className="font-bold text-slate-900">{rep.resource.title} ({rep.resource.grade} • {rep.resource.subject})</p>
                      <p className="text-slate-500">Author: {rep.resource.author?.username} [{rep.resource.author?.grade}]</p>
                      <div className="pt-2 flex items-center gap-2">
                        <a
                          href={rep.resource.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-semibold text-slate-700"
                        >
                          Inspect File
                        </a>
                        <button
                          onClick={() => handleDeleteResource(rep.resource.id)}
                          className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[11px] font-bold hover:bg-rose-700 shadow-xs"
                        >
                          Delete Inappropriate Upload
                        </button>
                      </div>
                    </div>
                  )}

                  {rep.comment && (
                    <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1">
                      <span className="font-bold text-slate-400 uppercase text-[10px]">Comment Details:</span>
                      <p className="text-slate-800 italic font-medium">"{rep.comment.content}"</p>
                      <p className="text-slate-500">Author: {rep.comment.author?.username} [{rep.comment.author?.grade}]</p>
                      <div className="pt-2">
                        <button
                          onClick={() => handleDeleteComment(rep.comment.id)}
                          className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[11px] font-bold hover:bg-rose-700 shadow-xs"
                        >
                          Delete Inappropriate Comment
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                    {rep.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleResolveReport(rep.id, "DISMISSED")}
                          className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          Dismiss Report
                        </button>
                        <button
                          onClick={() => handleResolveReport(rep.id, "RESOLVED")}
                          className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-xs"
                        >
                          Mark Resolved
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No pending reports in moderation queue.</p>
          )}
        </div>
      )}

      {/* TAB 4: ANNOUNCEMENTS MANAGEMENT */}
      {activeTab === "announcements" && (
        <div className="space-y-6">
          {/* Create Announcement Form */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 space-y-4">
            <h2 className="font-bold text-lg text-slate-900">
              Publish School-Wide Announcement
            </h2>
            <p className="text-xs text-slate-500">
              Announcements appear prominently at the top of every student's dashboard and trigger notifications.
            </p>

            {announcementNotice && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{announcementNotice}</span>
              </div>
            )}

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="e.g. Science Olympiad Exam Sample Papers Now Available"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                  Announcement Details *
                </label>
                <textarea
                  required
                  rows={3}
                  value={announcementContent}
                  onChange={(e) => setAnnouncementContent(e.target.value)}
                  placeholder="Detail the exam schedule, revision targets, or school notice..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                    Priority Banner Level
                  </label>
                  <select
                    value={announcementPriority}
                    onChange={(e) => setAnnouncementPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  >
                    <option value="NORMAL">NORMAL (Indigo Notice)</option>
                    <option value="HIGH">HIGH (Amber Notice)</option>
                    <option value="URGENT">URGENT (Terracotta / Red Alert)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                    Active Duration *
                  </label>
                  <select
                    value={announcementDuration}
                    onChange={(e) => setAnnouncementDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  >
                    {ANNOUNCEMENT_DURATIONS.map((dur) => (
                      <option key={dur.value} value={dur.value}>
                        {dur.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={announcementSubmitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs shadow-indigo-500/20 transition-all hover:shadow-md"
                >
                  {announcementSubmitting ? "Broadcasting..." : "Publish Announcement"}
                </button>
              </div>
            </form>
          </div>

          {/* Existing Announcements List */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Active & Past School Announcements
            </h3>

            <div className="space-y-3">
              {announcementsList.map((ann) => (
                <div
                  key={ann.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {ann.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {ann.priority}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Duration: {ann.durationOption}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-sans">
                      {ann.content}
                    </p>
                    <div className="text-[11px] text-slate-400 font-medium">
                      Created {formatTimeAgo(ann.createdAt)}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="p-1.5 text-rose-500 hover:bg-slate-200/60 rounded-lg"
                    title="Delete announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal for Admin Test Access */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#faf9f5] border border-[#e9e6dc] rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Key className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#3d3929]">
                    Set Test Password
                  </h3>
                  <p className="text-xs text-[#706d63]">
                    Assign credentials for {resetModalUser.username} [{resetModalUser.grade}]
                  </p>
                </div>
              </div>
              <button
                onClick={() => setResetModalUser(null)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {resetSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl space-y-2 text-xs">
                <p className="font-bold">{resetSuccessMsg}</p>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setResetModalUser(null)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                  Enter a new password for this user. You can use this exact password to log into their account at <strong>/login</strong> for testing.
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3d3929] mb-1">
                    New Password
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      minLength={6}
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="e.g. TestPass@2026"
                      className="flex-1 px-3 py-2 bg-white border border-[#dad9d4] rounded-xl text-xs font-mono text-[#3d3929] focus:outline-none focus:ring-2 focus:ring-[#c96442]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setNewPasswordInput(`TestPass@${Math.floor(1000 + Math.random() * 9000)}`)
                      }
                      className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setResetModalUser(null)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-4 py-2 bg-[#c96442] hover:bg-[#b05435] text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50"
                  >
                    {resetLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Short Form Modal: Issue Official Warning */}
      {warnModalUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#faf9f5] border border-[#e9e6dc] rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#3d3929]">
                    Issue Official Warning
                  </h3>
                  <p className="text-xs text-[#706d63]">
                    Target: {warnModalUser.username} [{warnModalUser.grade}] &bull; {warnModalUser.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWarnModalUser(null)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Strike status indicator */}
            <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
              (warnModalUser.warningCount || 0) >= 2
                ? "bg-rose-50 border-rose-200 text-rose-900 font-bold"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}>
              {(warnModalUser.warningCount || 0) === 0 ? (
                <span>
                  <strong>Strike 1 of 3:</strong> The student will have 2 chances remaining before being banned.
                </span>
              ) : (warnModalUser.warningCount || 0) === 1 ? (
                <span>
                  <strong>Strike 2 of 3:</strong> The student will have only 1 chance remaining before an automatic permanent ban.
                </span>
              ) : (
                <span>
                  ⚠️ <strong>STRIKE 3 of 3 (FINAL STRIKE):</strong> Submitting this warning will <strong>AUTOMATICALLY PERMANENTLY BAN</strong> this student and blacklist their email address from ever registering again!
                </span>
              )}
            </div>

            <form onSubmit={handleWarnSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3d3929] mb-1">
                  Reason for Warning * (Displayed to Student)
                </label>
                <textarea
                  required
                  rows={3}
                  value={warnReasonInput}
                  onChange={(e) => setWarnReasonInput(e.target.value)}
                  placeholder="e.g. Inappropriate language in comment section, spamming invalid notes..."
                  className="w-full px-3 py-2 bg-white border border-[#dad9d4] rounded-xl text-xs text-[#3d3929] focus:outline-none focus:ring-2 focus:ring-[#c96442]"
                />
              </div>

              {/* Quick Presets */}
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                  Quick Reason Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Inappropriate language in comments",
                    "Spamming duplicate or low quality files",
                    "Disrespectful behavior towards classmates",
                    "Academic dishonesty / plagiarism",
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setWarnReasonInput(preset)}
                      className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] rounded-md font-medium transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setWarnModalUser(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={warnSubmitting || !warnReasonInput.trim()}
                  className={`px-4 py-2 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50 ${
                    (warnModalUser.warningCount || 0) >= 2
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  {warnSubmitting
                    ? "Submitting..."
                    : (warnModalUser.warningCount || 0) >= 2
                    ? "Confirm Strike 3 & Auto-Ban"
                    : "Issue Official Warning"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Short Form Modal: Permanent Ban */}
      {banModalUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#faf9f5] border border-[#e9e6dc] rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-100 text-rose-800 rounded-xl">
                  <ShieldAlert className="w-5 h-5 text-rose-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#3d3929]">
                    Permanently Ban Student
                  </h3>
                  <p className="text-xs text-[#706d63]">
                    Target: {banModalUser.username} [{banModalUser.grade}] &bull; {banModalUser.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBanModalUser(null)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 leading-relaxed font-semibold">
              ⚠️ Permanent Action: Banning will immediately revoke all active sessions and permanently block <span className="underline decoration-rose-400 font-mono">{banModalUser.email}</span> so this email address can NEVER be used to register an account on PadhoOrion again.
            </div>

            <form onSubmit={handleBanSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3d3929] mb-1">
                  Reason for Permanent Ban * (Displayed to User on Login)
                </label>
                <textarea
                  required
                  rows={3}
                  value={banReasonInput}
                  onChange={(e) => setBanReasonInput(e.target.value)}
                  placeholder="e.g. Severe violation of school community safety guidelines, harassment..."
                  className="w-full px-3 py-2 bg-white border border-[#dad9d4] rounded-xl text-xs text-[#3d3929] focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Quick Presets */}
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                  Quick Reason Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Severe violation of community guidelines",
                    "Classmate harassment / abusive behavior",
                    "Malicious spam or harmful content upload",
                    "Fake student account / identity fraud",
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setBanReasonInput(preset)}
                      className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] rounded-md font-medium transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setBanModalUser(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={banSubmitting || !banReasonInput.trim()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  {banSubmitting ? "Executing Ban..." : "Confirm Permanent Ban & Block Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Unban Confirmation */}
      {unbanModalUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#faf9f5] border border-[#e9e6dc] rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#3d3929]">
                    Unban Student Account
                  </h3>
                  <p className="text-xs text-[#706d63]">
                    Target: {unbanModalUser.username} [{unbanModalUser.grade}] &bull; {unbanModalUser.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUnbanModalUser(null)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 leading-relaxed">
              Unbanning will restore full login access for <strong>{unbanModalUser.username}</strong>, reset their warning count back to <strong>0 of 3</strong>, and remove <strong>{unbanModalUser.email}</strong> from the banned email registry.
            </div>

            <form onSubmit={handleUnbanSubmit} className="space-y-4">
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setUnbanModalUser(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={unbanSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  {unbanSubmitting ? "Restoring Account..." : "Confirm Unban & Reset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
