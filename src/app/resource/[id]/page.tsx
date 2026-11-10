"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  Image as ImageIcon,
  Download,
  Heart,
  Bookmark,
  Share2,
  Trash2,
  Flag,
  MessageSquare,
  CornerDownRight,
  Eye,
  Check,
  Calendar,
  Layers,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthorIdentity } from "@/components/AuthorIdentity";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { ReportModal } from "@/components/ReportModal";
import { formatTimeAgo, formatFileSize } from "@/lib/utils";
import { GradeTag } from "@/components/GradeTag";

export default function ResourceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user } = useAuth();

  const [resource, setResource] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Comment input state
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ id: string; author: string } | null>(null);
  const [replyText, setReplyText] = useState("");

  // Confirmation Modals state
  const [showCommentConfirm, setShowCommentConfirm] = useState(false);
  const [pendingCommentData, setPendingCommentData] = useState<{
    content: string;
    parentId?: string | null;
  } | null>(null);
  const [isPublishingComment, setIsPublishingComment] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [reportModalData, setReportModalData] = useState<{
    targetType: "RESOURCE" | "COMMENT";
    targetId: string;
    targetTitle: string;
  } | null>(null);

  const fetchResource = async () => {
    try {
      const res = await fetch(`/api/resources/${id}`);
      if (res.ok) {
        const data = await res.json();
        setResource(data.resource);
        setIsLiked(data.isLiked);
        setIsBookmarked(data.isBookmarked);
        setLikesCount(data.resource._count?.likes ?? 0);
      } else {
        router.push("/grades");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchResource();
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch(`/api/resources/${id}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.liked);
        setLikesCount(data.likesCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch(`/api/resources/${id}/bookmark`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsBookmarked(data.bookmarked);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/resources/${id}/download`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        const link = document.createElement("a");
        link.href = data.fileUrl;
        link.download = data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setResource((prev: any) => ({
          ...prev,
          downloadsCount: (prev?.downloadsCount || 0) + 1,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInitiateComment = (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }

    const text = parentId ? replyText.trim() : newComment.trim();
    if (!text) return;

    setPendingCommentData({ content: text, parentId: parentId || null });
    setShowCommentConfirm(true);
  };

  const handleConfirmedComment = async () => {
    if (!pendingCommentData) return;
    setIsPublishingComment(true);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceId: id,
          content: pendingCommentData.content,
          parentId: pendingCommentData.parentId,
        }),
      });

      if (res.ok) {
        setNewComment("");
        setReplyText("");
        setReplyingTo(null);
        setShowCommentConfirm(false);
        setPendingCommentData(null);
        await fetchResource();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to post comment.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPublishingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await fetch(`/api/comments?id=${commentId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchResource();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteResource = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/resources/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/grades");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-sm text-slate-500 font-medium">
        Loading resource details...
      </div>
    );
  }

  if (!resource) return null;

  const isPdf = resource.fileType?.includes("pdf") || resource.fileName?.endsWith(".pdf");
  const isImage = resource.fileType?.startsWith("image/") || /\.(png|jpe?g|webp|svg)$/i.test(resource.fileName);
  const canDeleteResource = user && (user.id === resource.authorId || user.role === "ADMIN");

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Top Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          href={`/grades/${encodeURIComponent(resource.grade)}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {resource.grade}</span>
        </Link>

        <div className="flex items-center gap-2">
          {canDeleteResource && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Resource</span>
            </button>
          )}

          <button
            onClick={() =>
              setReportModalData({
                targetType: "RESOURCE",
                targetId: resource.id,
                targetTitle: resource.title,
              })
            }
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
            title="Report this resource"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Resource Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 bg-slate-50/70 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <GradeTag grade={resource.grade} size="md" />
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {resource.category}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200/70 text-slate-700">
              {resource.subject}
            </span>
            <span className="text-xs text-slate-400 ml-auto flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatTimeAgo(resource.createdAt)}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-2 tracking-tight">
            {resource.title}
          </h1>

          <div className="text-sm text-slate-500 font-medium mb-5">
            <span className="text-slate-900 font-bold">{resource.chapter}</span> • {resource.topic}
          </div>

          {/* Author Identity with Mandatory Grade Tag */}
          <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">Contributed by:</span>
              <AuthorIdentity
                username={resource.author.username}
                grade={resource.author.grade}
                avatarUrl={resource.author.avatarUrl}
                size="md"
              />
            </div>

            {/* Social action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isLiked
                    ? "bg-rose-50 text-rose-600 border-rose-200 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current text-rose-500" : ""}`} />
                <span>{likesCount} Likes</span>
              </button>

              <button
                onClick={handleBookmark}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isBookmarked
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs shadow-indigo-500/20"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-current" : ""}`} />
                <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
              </button>

              <button
                onClick={handleShare}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
                title="Share link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>

              <button
                onClick={handleDownload}
                disabled={downloading}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-indigo-500/20 transition-all hover:shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloading ? "Downloading..." : "Download File"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Description & Tags */}
        <div className="p-6 sm:p-8 space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 mb-1.5 tracking-tight">
              Description & Revision Overview
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed font-sans whitespace-pre-line">
              {resource.description}
            </p>
          </div>

          {resource.tags && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-xs font-bold text-slate-400">Tags:</span>
              {resource.tags.split(",").map((t: string) => (
                <span
                  key={t}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600"
                >
                  #{t.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Embedded Viewer */}
        <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-base text-slate-900 tracking-tight">
                Document Preview ({resource.fileName})
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {formatFileSize(resource.fileSize || 0)} • {resource.downloadsCount} total downloads
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col items-center justify-center min-h-[400px]">
            {isPdf ? (
              <iframe
                src={`${resource.fileUrl}#toolbar=0`}
                className="w-full h-[600px] border-none"
                title={resource.title}
              />
            ) : isImage ? (
              <div className="p-4 w-full flex justify-center">
                <img
                  src={resource.fileUrl}
                  alt={resource.title}
                  className="max-h-[650px] w-auto object-contain rounded-xl border border-slate-100 shadow-sm"
                />
              </div>
            ) : (
              <div className="p-8 text-center space-y-3">
                <FileText className="w-16 h-16 text-indigo-600 mx-auto" />
                <p className="text-sm font-bold text-slate-900">
                  {resource.fileName}
                </p>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
                >
                  Download to View
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comment Section */}
      <section id="comments" className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Community Discussion ({resource.comments?.length || 0})
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Every comment requires destination confirmation
          </span>
        </div>

        {/* Post New Comment Box */}
        {user ? (
          <form onSubmit={(e) => handleInitiateComment(e)} className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-slate-400">Posting as:</span>
              <AuthorIdentity
                username={user.username}
                grade={user.grade}
                avatarUrl={user.avatarUrl}
                size="sm"
                isLink={false}
              />
            </div>

            <textarea
              required
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ask a question, request a chapter clarification, or thank the student author..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
            />

            <div className="flex items-center justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
              >
                Post Comment
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
            Please{" "}
            <Link href="/login" className="font-bold text-indigo-600 hover:underline">
              Log In
            </Link>{" "}
            to join this academic conversation.
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4 pt-4">
          {resource.comments?.length > 0 ? (
            resource.comments.map((comment: any) => {
              const canDeleteComment = user && (user.id === comment.authorId || user.role === "ADMIN");

              return (
                <div
                  key={comment.id}
                  className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3"
                >
                  {/* Comment Author Header with Grade Tag */}
                  <div className="flex items-center justify-between">
                    <AuthorIdentity
                      username={comment.author.username}
                      grade={comment.author.grade}
                      avatarUrl={comment.author.avatarUrl}
                      size="sm"
                    />

                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <span>{formatTimeAgo(comment.createdAt)}</span>
                      {canDeleteComment && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          setReportModalData({
                            targetType: "COMMENT",
                            targetId: comment.id,
                            targetTitle: comment.content.slice(0, 40),
                          })
                        }
                        className="p-1 hover:text-rose-600 hover:bg-slate-100 rounded"
                        title="Report comment"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Comment Body */}
                  <p className="text-sm text-slate-800 font-sans leading-relaxed">
                    {comment.content}
                  </p>

                  {/* Reply Button */}
                  {user && (
                    <div className="pt-1">
                      {replyingTo?.id === comment.id ? (
                        <form
                          onSubmit={(e) => handleInitiateComment(e, comment.id)}
                          className="mt-2 space-y-2 pl-4 border-l-2 border-indigo-500"
                        >
                          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                            <span>Replying to {comment.author.username}</span>
                            <button
                              type="button"
                              onClick={() => setReplyingTo(null)}
                              className="text-rose-600 hover:underline"
                            >
                              Cancel
                            </button>
                          </div>
                          <textarea
                            required
                            rows={2}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write your reply..."
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          />
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg"
                            >
                              Post Reply
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => {
                            setReplyingTo({ id: comment.id, author: comment.author.username });
                            setReplyText("");
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                        >
                          <CornerDownRight className="w-3.5 h-3.5" />
                          <span>Reply</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Threaded Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 pl-4 sm:pl-6 border-l-2 border-slate-200 space-y-3 pt-2">
                      {comment.replies.map((reply: any) => {
                        const canDeleteReply = user && (user.id === reply.authorId || user.role === "ADMIN");

                        return (
                          <div
                            key={reply.id}
                            className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <AuthorIdentity
                                username={reply.author.username}
                                grade={reply.author.grade}
                                avatarUrl={reply.author.avatarUrl}
                                size="sm"
                              />
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                <span>{formatTimeAgo(reply.createdAt)}</span>
                                {canDeleteReply && (
                                  <button
                                    onClick={() => handleDeleteComment(reply.id)}
                                    className="p-0.5 text-rose-500 hover:bg-slate-200 rounded"
                                    title="Delete reply"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-slate-800 font-sans">
                              {reply.content}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 italic">
              No comments yet. Start the conversation about this study note!
            </p>
          )}
        </div>
      </section>

      {/* COMMENT CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={showCommentConfirm}
        title="Confirm Comment Publication"
        message="Are you sure you want to post this comment here?"
        destinationDetails={[
          { label: "Resource", value: resource.title },
          { label: "Grade", value: resource.grade },
        ]}
        confirmText="Yes, Post"
        cancelText="No, Go Back"
        isSubmitting={isPublishingComment}
        onConfirm={handleConfirmedComment}
        onCancel={() => {
          setShowCommentConfirm(false);
          setPendingCommentData(null);
        }}
      />

      {/* Delete Resource Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Resource Confirmation"
        message={`Are you sure you want to permanently delete "${resource.title}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="destructive"
        isSubmitting={isDeleting}
        onConfirm={handleDeleteResource}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Report Modal */}
      {reportModalData && (
        <ReportModal
          isOpen={true}
          targetType={reportModalData.targetType}
          targetId={reportModalData.targetId}
          targetTitle={reportModalData.targetTitle}
          onClose={() => setReportModalData(null)}
        />
      )}
    </div>
  );
}
