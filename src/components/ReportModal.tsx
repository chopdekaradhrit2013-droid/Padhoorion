"use client";

import React, { useState } from "react";
import { Flag, X, AlertTriangle } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  targetType: "RESOURCE" | "COMMENT";
  targetId: string;
  targetTitle?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ReportModal({
  isOpen,
  targetType,
  targetId,
  targetTitle,
  onClose,
  onSuccess,
}: ReportModalProps) {
  const [reason, setReason] = useState("Inappropriate or abusive language");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          reason,
          details,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit report");
      }

      setMessage(data.message);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-800">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
              <Flag className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Report {targetType === "RESOURCE" ? "Resource" : "Comment"}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {targetTitle && (
            <p className="text-xs text-slate-500">
              Target: <span className="font-semibold text-slate-800 italic">"{targetTitle}"</span>
            </p>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg">
              {message}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Reason for report</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="Inappropriate or abusive language">Inappropriate or abusive language</option>
              <option value="Incorrect or misleading academic content">Incorrect or misleading academic content</option>
              <option value="Wrong grade or category classification">Wrong grade or category classification</option>
              <option value="Spam or promotional material">Spam or promotional material</option>
              <option value="Copyright or unauthorized distribution">Copyright or unauthorized distribution</option>
              <option value="Other concern">Other concern</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Additional details (optional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              placeholder="Provide context for our school moderators..."
              className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold disabled:opacity-50 shadow-xs"
            >
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
