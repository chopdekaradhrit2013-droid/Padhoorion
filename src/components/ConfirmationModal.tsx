"use client";

import React from "react";
import { AlertCircle, HelpCircle, X, ArrowRight } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  destinationDetails?: {
    label: string;
    value: string;
  }[];
  confirmText: string;
  cancelText?: string;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "primary" | "destructive";
}

export function ConfirmationModal({
  isOpen,
  title = "Confirm Action",
  message,
  destinationDetails,
  confirmText,
  cancelText = "No, Go Back",
  isSubmitting = false,
  onConfirm,
  onCancel,
  type = "primary",
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden transform transition-all text-slate-800"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            {type === "destructive" ? (
              <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
                <AlertCircle className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                <HelpCircle className="w-5 h-5" />
              </div>
            )}
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
            {message}
          </p>

          {/* Destination path */}
          {destinationDetails && destinationDetails.length > 0 && (
            <div className="p-4 bg-indigo-50/50 border border-indigo-100/80 rounded-xl space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block">
                Destination Target:
              </span>
              <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-900">
                {destinationDetails.map((detail, idx) => (
                  <React.Fragment key={idx}>
                    <span className="px-3 py-1 bg-white border border-indigo-200/60 text-indigo-900 rounded-lg shadow-2xs">
                      {detail.value}
                    </span>
                    {idx < destinationDetails.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-slate-500">
            * Once published, your contribution will be instantly accessible to the entire school community.
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50/80 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-xl bg-white hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`px-5 py-2 text-sm font-bold rounded-xl text-white shadow-sm transition-all flex items-center gap-2 ${
              type === "destructive"
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 hover:shadow-md"
            } ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Publishing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
