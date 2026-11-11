"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Plus,
  MessageSquare,
  CheckCircle2,
  Clock,
  Search,
  Send,
  Check,
  BookOpen,
  Filter,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { GRADES, SUBJECTS } from "@/lib/constants";
import { UserAvatar } from "@/components/UserAvatar";
import { GradeTag } from "@/components/GradeTag";
import { formatTimeAgo } from "@/lib/utils";

export default function RequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "OPEN" | "FULFILLED">("all");
  const [search, setSearch] = useState("");

  // New Request Modal
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newGrade, setNewGrade] = useState(user?.grade || "8th Grade");
  const [newSubject, setNewSubject] = useState("Science");
  const [newChapter, setNewChapter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reply State
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyLoading, setReplyLoading] = useState<Record<string, boolean>>({});

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedGrade !== "all") params.set("grade", selectedGrade);
      if (selectedSubject !== "all") params.set("subject", selectedSubject);
      if (selectedStatus !== "all") params.set("status", selectedStatus);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/requests?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [selectedGrade, selectedSubject, selectedStatus]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setErrorMsg("Please enter what note you need.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim() || undefined,
          grade: newGrade,
          subject: newSubject,
          chapter: newChapter.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create request.");
      }

      setShowModal(false);
      setNewTitle("");
      setNewDescription("");
      setNewChapter("");
      await fetchRequests();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (requestId: string) => {
    const text = (replyText[requestId] || "").trim();
    if (!text) return;

    setReplyLoading((prev) => ({ ...prev, [requestId]: true }));
    try {
      const res = await fetch(`/api/requests/${requestId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      if (res.ok) {
        setReplyText((prev) => ({ ...prev, [requestId]: "" }));
        await fetchRequests();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to post reply.");
      }
    } catch (err) {
      console.error(err);
      alert("Error posting reply.");
    } finally {
      setReplyLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleToggleFulfill = async (requestId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "OPEN" ? "FULFILLED" : "OPEN";
      const res = await fetch(`/api/requests/${requestId}/fulfill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchRequests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fbeee8] dark:bg-[#c96442]/20 border border-[#f5d0c2] dark:border-[#c96442]/30 text-[#c96442] text-xs font-bold uppercase tracking-wider mb-2.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Student Note Exchange</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-stone-100 tracking-tight">
              Request a Note & Doubt Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-stone-400 mt-1 font-sans">
              Missed school or stuck on a chapter? Ask classmates to share their handwritten lecture copies or solved homework exercises.
            </p>
          </div>

          <button
            onClick={() => {
              if (!user) {
                window.location.href = "/login";
                return;
              }
              setShowModal(true);
            }}
            className="px-4 py-2.5 bg-[#c96442] hover:bg-[#b05536] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-[#c96442]/20 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Request a Note</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedStatus("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedStatus === "all"
                  ? "bg-[#c96442] text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 hover:bg-slate-200"
              }`}
            >
              All Requests
            </button>
            <button
              onClick={() => setSelectedStatus("OPEN")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                selectedStatus === "OPEN"
                  ? "bg-amber-500 text-amber-950 shadow-2xs"
                  : "bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 hover:bg-slate-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              <span>Open Needs</span>
            </button>
            <button
              onClick={() => setSelectedStatus("FULFILLED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                selectedStatus === "FULFILLED"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 hover:bg-slate-200"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Fulfilled</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-lg text-slate-800 dark:text-stone-200 font-medium"
            >
              <option value="all">All Grades</option>
              {GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-lg text-slate-800 dark:text-stone-200 font-medium"
            >
              <option value="all">All Subjects</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading student requests...</div>
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((req) => {
            const isAuthor = user?.id === req.authorId;
            const canManage = isAuthor || user?.role === "ADMIN";
            const isExpanded = expandedRequestId === req.id;

            return (
              <div
                key={req.id}
                className="p-5 sm:p-6 bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4 transition hover:border-[#c96442]/40"
              >
                {/* Top strip */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <UserAvatar name={req.author.username} avatarUrl={req.author.avatarUrl} size="sm" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-stone-100">
                          {req.author.username}
                        </span>
                        <GradeTag grade={req.author.grade} size="sm" />
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {formatTimeAgo(req.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300">
                      {req.subject}
                    </span>
                    <GradeTag grade={req.grade} size="sm" />

                    {req.status === "FULFILLED" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check className="w-3 h-3 text-emerald-600" />
                        FULFILLED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        OPEN NEED
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-stone-100">
                    {req.title}
                  </h3>
                  {req.chapter && (
                    <span className="inline-block text-xs font-semibold text-[#c96442] mt-0.5">
                      Chapter: {req.chapter}
                    </span>
                  )}
                  {req.description && (
                    <p className="text-xs text-slate-600 dark:text-stone-300 mt-2 font-sans leading-relaxed">
                      {req.description}
                    </p>
                  )}
                </div>

                {/* Responses & Actions Toolbar */}
                <div className="pt-3 border-t border-slate-100 dark:border-stone-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setExpandedRequestId(isExpanded ? null : req.id)}
                    className="inline-flex items-center gap-1.5 font-bold text-slate-600 dark:text-stone-300 hover:text-[#c96442] transition"
                  >
                    <MessageSquare className="w-4 h-4 text-[#c96442]" />
                    <span>
                      {req.responses?.length || 0} Classmate {req.responses?.length === 1 ? "Response" : "Responses"}
                    </span>
                    <span className="text-slate-400 text-[10px]">({isExpanded ? "Hide" : "View"})</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {canManage && (
                      <button
                        onClick={() => handleToggleFulfill(req.id, req.status)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          req.status === "OPEN"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{req.status === "OPEN" ? "Mark Fulfilled" : "Reopen"}</span>
                      </button>
                    )}

                    <Link
                      href="/upload"
                      className="px-2.5 py-1 rounded-lg bg-[#faf8f5] dark:bg-stone-800 hover:bg-[#c96442] hover:text-white text-[#c96442] border border-[#ebdccc] dark:border-stone-700 text-xs font-bold transition flex items-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Upload Notes for Class</span>
                    </Link>
                  </div>
                </div>

                {/* Expanded Replies Thread */}
                {isExpanded && (
                  <div className="pt-3 border-t border-slate-100 dark:border-stone-800 space-y-3 bg-slate-50/50 dark:bg-stone-950/40 p-4 rounded-xl">
                    <div className="space-y-2.5">
                      {req.responses?.length > 0 ? (
                        req.responses.map((reply: any) => (
                          <div
                            key={reply.id}
                            className="p-3 bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-xl space-y-1 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <UserAvatar name={reply.author.username} avatarUrl={reply.author.avatarUrl} size="xs" />
                                <span className="font-bold text-slate-900 dark:text-stone-100">
                                  {reply.author.username}
                                </span>
                                <GradeTag grade={reply.author.grade} size="sm" />
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {formatTimeAgo(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-slate-700 dark:text-stone-300 font-sans pl-7">
                              {reply.content}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          No replies yet. Be the first classmate to help!
                        </p>
                      )}
                    </div>

                    {/* Inline Reply Input */}
                    {user ? (
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="text"
                          value={replyText[req.id] || ""}
                          onChange={(e) => setReplyText({ ...replyText, [req.id]: e.target.value })}
                          onKeyDown={(e) => e.key === "Enter" && handleSendReply(req.id)}
                          placeholder="Reply to help this classmate with notes or advice..."
                          className="flex-1 px-3 py-2 text-xs bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-700 rounded-xl text-slate-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#c96442]/30"
                        />
                        <button
                          onClick={() => handleSendReply(req.id)}
                          disabled={replyLoading[req.id] || !replyText[req.id]?.trim()}
                          className="px-3.5 py-2 rounded-xl bg-[#c96442] hover:bg-[#b05536] text-white text-xs font-bold transition flex items-center gap-1 disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Reply</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 pt-1">
                        <Link href="/login" className="text-[#c96442] font-bold hover:underline">
                          Log in
                        </Link>{" "}
                        to reply to this request.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-2xl space-y-3">
          <HelpCircle className="w-12 h-12 text-[#c96442] mx-auto opacity-80" />
          <h3 className="font-bold text-base text-slate-900 dark:text-stone-100">
            No Note Requests Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Need lecture notes, homework copies, or formula sheets? Post a request to let your classmates know!
          </p>
        </div>
      )}

      {/* Modal: Create Note Request */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#c96442] text-white">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-stone-100">
                  Request Study Notes
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateRequest} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400 mb-1">
                  What notes or exercise do you need? *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Chapter 4 Carbon Compounds Lecture Notes"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl text-slate-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#c96442]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400 mb-1">
                    Grade Level
                  </label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl text-slate-900 dark:text-stone-100"
                  >
                    {GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400 mb-1">
                    Subject
                  </label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl text-slate-900 dark:text-stone-100"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400 mb-1">
                  Chapter / Topic (Optional)
                </label>
                <input
                  type="text"
                  value={newChapter}
                  onChange={(e) => setNewChapter(e.target.value)}
                  placeholder="e.g. Chemical Reactions - Page 34"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl text-slate-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400 mb-1">
                  Details / Specific Questions (Optional)
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe what specific derivations, homework problems, or lecture parts you need help with..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl text-slate-900 dark:text-stone-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-stone-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold bg-[#c96442] hover:bg-[#b05536] text-white rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {submitting ? "Posting..." : "Post Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

