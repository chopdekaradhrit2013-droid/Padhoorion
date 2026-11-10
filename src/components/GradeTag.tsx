"use client";

import React from "react";

interface GradeTagProps {
  grade: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function GradeTag({ grade, className = "", size = "md" }: GradeTagProps) {
  if (!grade) return null;

  const sizeClasses = {
    sm: "text-[11px] px-2 py-0.5 font-semibold",
    md: "text-xs px-2.5 py-0.5 font-semibold",
    lg: "text-sm px-3 py-1 font-bold",
  };

  const getGradeColors = (g: string) => {
    if (g.includes("6th")) return "bg-[#edf3e8] text-[#34532b] border-[#cfe0c7]";
    if (g.includes("7th")) return "bg-[#f7efe9] text-[#9c4c2c] border-[#ebd4c7]";
    if (g.includes("8th")) return "bg-[#faece7] text-[#c96442] border-[#f0c8ba]";
    if (g.includes("9th")) return "bg-[#f2effb] text-[#5e4db2] border-[#ded7f4]";
    if (g.includes("10th")) return "bg-[#f9f3e4] text-[#855e1d] border-[#ede1c3]";
    return "bg-[#ede9de] text-[#535146] border-[#dad9d4]";
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs tracking-tight ${getGradeColors(grade)} ${sizeClasses[size]} ${className}`}
      title={`Academic Standing: ${grade}`}
    >
      [{grade}]
    </span>
  );
}
