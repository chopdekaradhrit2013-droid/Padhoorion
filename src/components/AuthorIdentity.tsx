"use client";

import React from "react";
import Link from "next/link";
import { UserAvatar } from "./UserAvatar";
import { GradeTag } from "./GradeTag";

interface AuthorIdentityProps {
  username: string;
  grade: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  showAvatar?: boolean;
  className?: string;
  isLink?: boolean;
}

export function AuthorIdentity({
  username,
  grade,
  avatarUrl,
  size = "md",
  showAvatar = true,
  className = "",
  isLink = true,
}: AuthorIdentityProps) {
  const content = (
    <div className={`inline-flex items-center gap-2 group ${className}`}>
      {showAvatar && (
        <UserAvatar
          name={username}
          avatarUrl={avatarUrl}
          size={size === "sm" ? "xs" : size === "md" ? "sm" : "md"}
        />
      )}
      <span className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
        {username}
      </span>
      <GradeTag grade={grade} size={size === "sm" ? "sm" : "md"} />
    </div>
  );

  if (!isLink) {
    return content;
  }

  return (
    <Link href={`/profile/${encodeURIComponent(username)}`} className="inline-block hover:underline decoration-indigo-500">
      {content}
    </Link>
  );
}
