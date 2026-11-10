"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, Upload, Bookmark, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user || pathname === "/landing") return null;

  const links = [
    { label: "Home", href: "/", icon: Home },
    { label: "Grades", href: "/grades", icon: Layers },
    { label: "Upload", href: "/upload", icon: Upload },
    { label: "Bookmarks", href: "/bookmarks", icon: Bookmark },
    {
      label: user ? "Profile" : "Log In",
      href: user ? `/profile/${encodeURIComponent(user.username)}` : "/login",
      icon: User,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5">
      <div className="flex items-center justify-around">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center py-1 px-3 rounded-lg text-xs transition-colors ${
                isActive
                  ? "text-indigo-600 font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
