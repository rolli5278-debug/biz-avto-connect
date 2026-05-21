import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { CEFRLevel } from '../types';

// ─── Tailwind class merging ────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── XP formatting ────────────────────────────────────────────────────────────

/**
 * Format a raw XP number into a human-readable string.
 * @example formatXP(1234) → "1,234 XP"
 */
export function formatXP(xp: number): string {
  return `${xp.toLocaleString('en-US')} XP`;
}

// ─── CEFR level helpers ───────────────────────────────────────────────────────

const LEVEL_NAMES: Record<CEFRLevel, string> = {
  A1: 'Beginner',
  A2: 'Elementary',
  B1: 'Intermediate',
  B2: 'Upper-Intermediate',
  C1: 'Advanced',
  C2: 'Mastery',
};

/**
 * Return the human-readable name for a CEFR level string.
 * Falls back to the raw string if unrecognised.
 */
export function getLevelName(level: string): string {
  return LEVEL_NAMES[level as CEFRLevel] ?? level;
}

const LEVEL_COLORS: Record<CEFRLevel, string> = {
  A1: 'text-emerald-500',
  A2: 'text-green-500',
  B1: 'text-blue-500',
  B2: 'text-indigo-500',
  C1: 'text-purple-500',
  C2: 'text-amber-500',
};

/**
 * Return a Tailwind CSS text-color class for a CEFR level.
 */
export function getLevelColor(level: string): string {
  return LEVEL_COLORS[level as CEFRLevel] ?? 'text-gray-500';
}

const LEVEL_BG_COLORS: Record<CEFRLevel, string> = {
  A1: 'bg-emerald-100 text-emerald-800',
  A2: 'bg-green-100 text-green-800',
  B1: 'bg-blue-100 text-blue-800',
  B2: 'bg-indigo-100 text-indigo-800',
  C1: 'bg-purple-100 text-purple-800',
  C2: 'bg-amber-100 text-amber-800',
};

/**
 * Return a Tailwind CSS badge class (bg + text) for a CEFR level.
 */
export function getLevelBadgeColor(level: string): string {
  return LEVEL_BG_COLORS[level as CEFRLevel] ?? 'bg-gray-100 text-gray-800';
}

// ─── Streak helpers ───────────────────────────────────────────────────────────

/**
 * Return a suitable emoji for a given day streak.
 */
export function getStreakEmoji(streak: number): string {
  if (streak === 0) return '❄️';
  if (streak < 3) return '🔥';
  if (streak < 7) return '💪';
  if (streak < 14) return '🚀';
  if (streak < 30) return '⚡';
  if (streak < 60) return '🌟';
  if (streak < 100) return '💎';
  return '👑';
}

// ─── XP → Level calculator ────────────────────────────────────────────────────

interface LevelThreshold {
  level: CEFRLevel;
  minXP: number;
  maxXP: number;
}

const LEVEL_THRESHOLDS: LevelThreshold[] = [
  { level: 'A1', minXP: 0,     maxXP: 999 },
  { level: 'A2', minXP: 1000,  maxXP: 2999 },
  { level: 'B1', minXP: 3000,  maxXP: 6999 },
  { level: 'B2', minXP: 7000,  maxXP: 13999 },
  { level: 'C1', minXP: 14000, maxXP: 24999 },
  { level: 'C2', minXP: 25000, maxXP: Infinity },
];

export interface LevelInfo {
  level: CEFRLevel;
  /** Progress toward the next level as a value from 0 to 100 */
  progress: number;
  /** XP required to reach the next level (0 if already at C2) */
  nextLevelXP: number;
  /** XP earned within the current level band */
  currentLevelXP: number;
  /** Total XP span of the current level band */
  levelSpan: number;
}

/**
 * Derive a user's CEFR level, progress percentage, and next-level XP
 * from their total accumulated XP.
 */
export function calculateLevel(xp: number): LevelInfo {
  const clampedXP = Math.max(0, xp);

  const threshold =
    LEVEL_THRESHOLDS.find(
      (t) => clampedXP >= t.minXP && clampedXP <= t.maxXP
    ) ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];

  const isMaxLevel = threshold.maxXP === Infinity;

  const levelSpan = isMaxLevel ? 0 : threshold.maxXP - threshold.minXP + 1;
  const currentLevelXP = clampedXP - threshold.minXP;
  const progress = isMaxLevel ? 100 : Math.min(100, Math.round((currentLevelXP / levelSpan) * 100));
  const nextLevelXP = isMaxLevel ? 0 : threshold.maxXP + 1 - clampedXP;

  return {
    level: threshold.level,
    progress,
    nextLevelXP,
    currentLevelXP,
    levelSpan,
  };
}

// ─── Duration formatting ──────────────────────────────────────────────────────

/**
 * Format a duration in minutes into a readable string.
 * @example
 *   formatDuration(45)   → "45 min"
 *   formatDuration(90)   → "1 hr 30 min"
 *   formatDuration(120)  → "2 hr"
 */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0 min';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

// ─── Misc helpers ─────────────────────────────────────────────────────────────

/**
 * Truncate a string to `maxLength` characters, appending "…" if truncated.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

/**
 * Capitalise the first letter of a string.
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Sleep for `ms` milliseconds. Useful in async mock functions.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Clamp a number between min and max (inclusive).
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Return a pseudo-random integer in [min, max].
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick a random element from an array.
 */
export function randomPick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}
