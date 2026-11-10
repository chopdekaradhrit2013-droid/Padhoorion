"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderOpen, Upload, Trash2, Eye, Download, Heart, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ResourceCard } from "@/components/ResourceCard";

export default function MyUploadsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) {
        router.push("/login?redirect=/my-uploads");
        return;
      }
      try {
        const res = await fetch(`/api/resources?authorId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setResources(data.resources || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700 mb-2.5">
            <FolderOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>Author Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Uploaded Resources
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
            Manage your educational contributions and track downloads and peer discussions.
          </p>
        </div>

        <Link
          href="/upload"
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm shadow-indigo-500/20 flex items-center gap-1.5 transition-all hover:shadow-md"
        >
          <Upload className="w-4 h-4" />
          <span>Upload New Resource</span>
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-slate-500 font-medium">Loading your uploads...</div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((res) => (
            <ResourceCard key={res.id} resource={res} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-lg text-slate-900">No uploads yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't uploaded any study materials yet. Start contributing to help your peers!
          </p>
          <Link
            href="/upload"
            className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs"
          >
            Upload Your First Resource
          </Link>
        </div>
      )}
    </div>
  );
}
