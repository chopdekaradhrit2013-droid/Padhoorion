"use client";

import React from "react";
import { getInitials } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function UserAvatar({
  name,
  avatarUrl,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-xs font-semibold",
    md: "w-10 h-10 text-sm font-bold",
    lg: "w-14 h-14 text-base font-extrabold",
    xl: "w-20 h-20 text-2xl font-black",
  };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`rounded-full object-cover border border-slate-200 shadow-sm ${sizeClasses[size]} ${className}`}
      />
    );
  }

  const initials = getInitials(name);

  return (
    <div
      className={`rounded-full flex items-center justify-center select-none bg-gradient-to-tr from-[#c96442] to-[#d97757] text-white border border-[#f0c8ba]/40 shadow-xs tracking-wider ${sizeClasses[size]} ${className}`}
      title={name}
    >
      <span>{initials}</span>
    </div>
  );
}
