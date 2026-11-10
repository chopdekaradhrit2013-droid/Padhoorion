"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Upload as UploadIcon,
  FileText,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  X,
} from "lucide-react";
import { GRADES, CATEGORIES, SUBJECTS, GradeType, CategoryType, SubjectType } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { ConfirmationModal } from "@/components/ConfirmationModal";

function UploadContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const defaultGrade = (searchParams.get("grade") as GradeType) || (user?.grade as GradeType) || "7th Grade";
  const defaultCategory = (searchParams.get("category") as CategoryType) || "Handwritten Notes";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [grade, setGrade] = useState<GradeType>(defaultGrade);
  const [category, setCategory] = useState<CategoryType>(defaultCategory);
  const [subject, setSubject] = useState<SubjectType>("Mathematics");
  const [chapter, setChapter] = useState("");
  const [topic, setTopic] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      router.push("/login?redirect=/upload");
      return;
    }

    if (!title.trim() || !description.trim() || !chapter.trim() || !topic.trim()) {
      setError("Please fill in all required text fields.");
      return;
    }

    if (!file) {
      setError("Please attach a valid document (PDF) or image file.");
      return;
    }

    // MANDATORY confirmation modal before publishing
    setShowConfirmModal(true);
  };

  const handleConfirmedUpload = async () => {
    if (!file) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("grade", grade);
      formData.append("category", category);
      formData.append("subject", subject);
      formData.append("chapter", chapter.trim());
      formData.append("topic", topic.trim());
      formData.append("tags", tags.trim());
      formData.append("file", file);

      const res = await fetch("/api/resources/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to publish resource.");
      }

      setSuccess(true);
      setShowConfirmModal(false);

      setTimeout(() => {
        router.push(`/resource/${data.resource.id}`);
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to publish resource.");
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-4 sm:my-8 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/grades"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 mb-2 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Explorer</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Share Educational Resource
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
            Contribute your lecture notes, worksheets, or solved papers to help peers across the school.
          </p>

          <div className="mt-3.5 p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-900 font-medium">
            <strong>Open School Policy:</strong> You can upload to any grade (6th through 10th) regardless of your current profile grade. A confirmation modal will verify your destination before upload.
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center gap-2 font-medium">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>Resource published successfully! Redirecting to resource page...</span>
          </div>
        )}

        <form onSubmit={handlePreSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Resource Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 4: Linear Equations & Coordinate Geometry Comprehensive Notes"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
            />
          </div>

          {/* Destination Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Destination Grade *
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as GradeType)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white font-medium"
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white font-medium"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Subject *
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as SubjectType)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white font-medium"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chapter & Topic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Chapter / Unit *
              </label>
              <input
                type="text"
                required
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="e.g. Chapter 4: Linear Equations"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Specific Topic *
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Graph Plotting & Distance Formula"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Description & Highlights *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what is covered in this resource, teacher tips, key formulas, or practice problems included..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
            />
          </div>

          {/* File Attachment */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Attachment * (PDF or Images)
            </label>
            <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl transition-colors text-center">
              <input
                type="file"
                id="file-upload"
                required
                accept=".pdf,image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
                  <UploadIcon className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm text-slate-900">
                  {file ? file.name : "Click to select file or drag & drop"}
                </span>
                <span className="text-xs text-slate-400">
                  Supports PDF documents, PNG, JPG, WEBP (Max 25 MB)
                </span>
              </label>

              {file && (
                <div className="mt-3.5 inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 shadow-xs">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="font-semibold">{file.name}</span>
                  <span className="text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-0.5 text-rose-500 hover:bg-slate-100 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Optional Tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Keywords & Tags (Optional)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. algebra, coordinate-geometry, solved-numericals, unit-test-prep"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
            />
          </div>

          {/* Submit Trigger (Opens Confirmation Modal) */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 italic">
              * A confirmation prompt will verify your destination before upload.
            </span>

            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-500/20 transition-all hover:shadow-lg"
            >
              Continue to Confirm
            </button>
          </div>
        </form>
      </div>

      {/* MANDATORY CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Confirm Educational Upload"
        message="Are you sure you want to upload this resource?"
        destinationDetails={[
          { label: "Grade", value: grade },
          { label: "Subject", value: subject },
          { label: "Category", value: category },
        ]}
        confirmText="Yes, Upload"
        cancelText="No, Go Back"
        isSubmitting={isSubmitting}
        onConfirm={handleConfirmedUpload}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">Loading upload form...</div>}>
      <UploadContent />
    </Suspense>
  );
}
