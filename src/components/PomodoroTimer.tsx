"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  Minimize2,
  Maximize2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

type Mode = "focus" | "shortBreak" | "longBreak";

const MODE_DURATIONS: Record<Mode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export function PomodoroTimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [mode, setMode] = useState<Mode>("focus");
  const [timeLeft, setTimeLeft] = useState(MODE_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [goal, setGoal] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [completedSessions, setCompletedSessions] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Play a gentle dual-tone chime using Web Audio API (no external mp3 files needed)
  const playChime = () => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      playTone(523.25, 0, 0.4); // C5
      playTone(659.25, 0.15, 0.4); // E5
      playTone(783.99, 0.3, 0.6); // G5
    } catch {
      // Audio context might be restricted before interaction
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            playChime();

            if (mode === "focus") {
              setCompletedSessions((c) => c + 1);
              setMode("shortBreak");
              return MODE_DURATIONS.shortBreak;
            } else {
              setMode("focus");
              return MODE_DURATIONS.focus;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, soundEnabled]);

  const switchMode = (newMode: Mode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_DURATIONS[newMode]);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODE_DURATIONS[mode]);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const total = MODE_DURATIONS[mode];
  const progressPercent = Math.round(((total - timeLeft) / total) * 100);

  return (
    <>
      {/* Floating Launcher Pill */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          type="button"
          className="fixed bottom-20 md:bottom-6 right-6 z-40 px-3.5 py-2.5 rounded-full bg-[#c96442] text-white shadow-xl hover:bg-[#b05536] transition-all transform hover:scale-105 flex items-center gap-2 group cursor-pointer border-2 border-white/40"
          title="Open Student Focus Timer"
        >
          <Clock className="w-4 h-4 animate-spin-slow" />
          <span className="text-xs font-black tracking-wide">
            {isRunning ? formatTime(timeLeft) : "Study Timer"}
          </span>
          {isRunning && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </button>
      )}

      {/* Timer Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ${
            isMinimized
              ? "bottom-20 md:bottom-6 right-6 w-72"
              : "bottom-20 md:bottom-6 right-6 w-80 sm:w-88"
          } bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-[#faf9f5] dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#c96442] text-white">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold text-stone-900 dark:text-white">
                Student Focus Timer
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#fbeee8] dark:bg-[#c96442]/20 text-[#c96442] font-black">
                {completedSessions} done
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                title={soundEnabled ? "Mute Chime" : "Enable Chime"}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body */}
          {!isMinimized && (
            <div className="p-5 space-y-4">
              {/* Mode Buttons */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs font-bold text-center">
                <button
                  onClick={() => switchMode("focus")}
                  className={`py-1.5 rounded-lg transition-all ${
                    mode === "focus"
                      ? "bg-white dark:bg-stone-900 text-[#c96442] shadow-xs"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                  }`}
                >
                  Focus (25m)
                </button>
                <button
                  onClick={() => switchMode("shortBreak")}
                  className={`py-1.5 rounded-lg transition-all ${
                    mode === "shortBreak"
                      ? "bg-white dark:bg-stone-900 text-emerald-600 shadow-xs"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                  }`}
                >
                  Break (5m)
                </button>
                <button
                  onClick={() => switchMode("longBreak")}
                  className={`py-1.5 rounded-lg transition-all ${
                    mode === "longBreak"
                      ? "bg-white dark:bg-stone-900 text-indigo-600 shadow-xs"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                  }`}
                >
                  Rest (15m)
                </button>
              </div>

              {/* Big Timer Display */}
              <div className="text-center py-2 relative">
                <div className="text-5xl font-black tracking-tight text-stone-900 dark:text-white font-mono">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-[11px] text-stone-400 dark:text-stone-500 font-medium mt-1">
                  {mode === "focus"
                    ? "Deep Study Session"
                    : mode === "shortBreak"
                    ? "Hydrate & Relax"
                    : "Extended Rest"}
                </div>

                {/* Progress bar */}
                <div className="mt-3 w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      mode === "focus"
                        ? "bg-[#c96442]"
                        : mode === "shortBreak"
                        ? "bg-emerald-500"
                        : "bg-indigo-500"
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Goal Input */}
              <div>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="What are you studying right now?"
                  className="w-full px-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c96442]/30"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 text-white shadow-md transition-all transform active:scale-95 ${
                    isRunning
                      ? "bg-stone-800 dark:bg-stone-700 hover:bg-stone-900 shadow-stone-800/20"
                      : "bg-[#c96442] hover:bg-[#b05536] shadow-[#c96442]/30"
                  }`}
                >
                  {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isRunning ? "Pause" : "Start Session"}</span>
                </button>

                <button
                  onClick={resetTimer}
                  className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Minimized View */}
          {isMinimized && (
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-black text-stone-900 dark:text-white">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-[10px] text-stone-400 capitalize">({mode})</span>
              </div>
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="px-3 py-1 rounded-lg bg-[#c96442] text-white font-bold text-xs flex items-center gap-1 shadow-xs"
              >
                {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isRunning ? "Pause" : "Play"}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

