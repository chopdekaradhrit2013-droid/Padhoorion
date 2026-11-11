"use client";

import React, { useState, useRef } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  Download,
  Moon,
  Sun,
  FileText,
  RotateCcw,
} from "lucide-react";

interface NoteReaderViewerProps {
  fileUrl: string;
  fileName: string;
  title: string;
  fileType: string;
  onDownload: () => void;
  downloading?: boolean;
}

export function NoteReaderViewer({
  fileUrl,
  fileName,
  title,
  fileType,
  onDownload,
  downloading = false,
}: NoteReaderViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [inverted, setInverted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const isPdf = fileType?.includes("pdf") || fileName?.endsWith(".pdf");
  const isImage = fileType?.startsWith("image/") || /\.(png|jpe?g|webp|svg)$/i.test(fileName);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 25, 250));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 25, 50));
  const handleReset = () => {
    setZoom(100);
    setRotation(0);
    setInverted(false);
  };
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!isFullScreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullScreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col ${
        isFullScreen
          ? "fixed inset-0 z-50 bg-stone-950 text-white rounded-none border-none p-4"
          : "bg-white dark:bg-stone-900 border-slate-200 dark:border-stone-800 shadow-sm"
      }`}
    >
      {/* Control Toolbar */}
      <div className="px-4 py-2.5 bg-slate-50 dark:bg-stone-800/90 border-b border-slate-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 dark:text-stone-100 truncate max-w-xs sm:max-w-md">
            {fileName}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-stone-700 text-[10px] font-mono text-slate-700 dark:text-stone-300">
            {zoom}%
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Zoom controls */}
          <div className="flex items-center rounded-lg bg-white dark:bg-stone-700 border border-slate-200 dark:border-stone-600 shadow-2xs">
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-stone-600 text-slate-600 dark:text-stone-200 rounded-l-lg transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              className="px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-stone-200 hover:bg-slate-100 dark:hover:bg-stone-600 border-x border-slate-200 dark:border-stone-600"
              title="Reset Zoom"
            >
              100%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-stone-600 text-slate-600 dark:text-stone-200 rounded-r-lg transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Rotate (images/scans) */}
          {isImage && (
            <button
              onClick={handleRotate}
              className="p-1.5 rounded-lg bg-white dark:bg-stone-700 border border-slate-200 dark:border-stone-600 text-slate-600 dark:text-stone-200 hover:bg-slate-100 dark:hover:bg-stone-600 transition shadow-2xs"
              title="Rotate 90° Clockwise"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* High Contrast Invert Toggle (Eye Comfort) */}
          <button
            onClick={() => setInverted(!inverted)}
            className={`p-1.5 rounded-lg border text-xs transition shadow-2xs ${
              inverted
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-white dark:bg-stone-700 border-slate-200 dark:border-stone-600 text-slate-600 dark:text-stone-200 hover:bg-slate-100"
            }`}
            title="Invert / Dark Reading Contrast"
          >
            {inverted ? <Sun className="w-3.5 h-3.5 text-amber-600" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Full Screen */}
          <button
            onClick={toggleFullScreen}
            className="p-1.5 rounded-lg bg-white dark:bg-stone-700 border border-slate-200 dark:border-stone-600 text-slate-600 dark:text-stone-200 hover:bg-slate-100 dark:hover:bg-stone-600 transition shadow-2xs"
            title={isFullScreen ? "Exit Fullscreen" : "Fullscreen Reading Mode"}
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Download */}
          <button
            onClick={onDownload}
            disabled={downloading}
            className="px-3 py-1.5 bg-[#c96442] hover:bg-[#b05536] text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs transition"
          >
            <Download className="w-3 h-3" />
            <span>{downloading ? "Downloading..." : "Download"}</span>
          </button>
        </div>
      </div>

      {/* Reader Canvas Area */}
      <div
        className={`flex-1 overflow-auto flex items-center justify-center p-4 min-h-[450px] ${
          isFullScreen ? "bg-stone-900" : "bg-slate-100/60 dark:bg-stone-950/60"
        }`}
      >
        {isPdf ? (
          <div
            className="w-full h-full flex justify-center transition-all duration-200"
            style={{
              filter: inverted ? "invert(92%) hue-rotate(180deg)" : "none",
            }}
          >
            <iframe
              src={`${fileUrl}#zoom=${zoom}`}
              className="w-full h-[650px] sm:h-[750px] border-none rounded-xl shadow-md bg-white"
              title={title}
            />
          </div>
        ) : isImage ? (
          <div className="w-full flex justify-center overflow-auto p-4">
            <img
              src={fileUrl}
              alt={title}
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                filter: inverted ? "invert(100%)" : "none",
                transformOrigin: "center center",
                transition: "transform 0.2s ease",
              }}
              className="max-h-[750px] w-auto object-contain rounded-xl shadow-lg border border-slate-200 dark:border-stone-800"
            />
          </div>
        ) : (
          <div className="p-8 text-center space-y-3">
            <FileText className="w-16 h-16 text-[#c96442] mx-auto" />
            <p className="text-sm font-bold text-slate-900 dark:text-stone-100">
              {fileName}
            </p>
            <button
              onClick={onDownload}
              className="px-5 py-2.5 bg-[#c96442] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#b05536]"
            >
              Download File to View
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

