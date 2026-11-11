"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 ${className}`} />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={theme === "dark" ? "Switch to Day Mode" : "Switch to Night Study Mode"}
      className={`p-2 rounded-xl transition-all duration-200 border text-xs font-bold flex items-center justify-center ${
        theme === "dark"
          ? "bg-stone-800 border-stone-700 text-amber-400 hover:bg-stone-700 shadow-xs"
          : "bg-white border-stone-200 text-stone-700 hover:bg-stone-100 hover:text-stone-900 shadow-2xs"
      } ${className}`}
      aria-label="Toggle Night Study Mode"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-stone-600 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}

