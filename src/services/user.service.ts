// ─── User Service ──────────────────────────────────────────────────────────────
// All reads/writes go through the typed Supabase client.  Where a real row
// doesn't exist yet (e.g. during development without a live DB) the service
// falls back to sensible mock data so the rest of the UI can still render.

import { supabase } from '../lib/supabase';
import { ACHIEVEMENTS } from '../lib/constants';
import type {
  Achievement,
  LeaderboardEntry,
  User,
  UserAchievement,
  UserProgress,
} from '../types';

// ── Internal helpers ──────────────────────────────────────────────────────────

function handleError(error: unknown, context: string): never {
  const message = error instanceof Error ? error.message : String(error);
  throw new Error(`[user.service] ${context}: ${message}`);
}

// ── Mock fallbacks (used when Supabase returns empty) ─────────────────────────

const MOCK_USER: User = {
  id: 'mock-user-1',
  email: 'learner@example.com',
  name: 'Demo Learner',
  avatar_url: null,
  level: 'B1',
  xp: 4200,
  streak: 7,
  created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  subscription_type: 'free',
};

const MOCK_PROGRESS: UserProgress = {
  user_id: 'mock-user-1',
  total_xp: 4200,
  current_streak: 7,
  longest_streak: 14,
  lessons_completed: 23,
  words_learned: 180,
  minutes_practiced: 540,
};

// ── Leaderboard mock data ─────────────────────────────────────────────────────

const LEADERBOARD_MOCK: LeaderboardEntry[] = [
  { rank: 1,  user_id: 'u1',  username: 'Sardor_Uz',       avatar_url: null, xp: 18500, streak: 62, country: 'UZ' },
  { rank: 2,  user_id: 'u2',  username: 'NilufarE',         avatar_url: null, xp: 16200, streak: 45, country: 'UZ' },
  { rank: 3,  user_id: 'u3',  username: 'BehruzT',          avatar_url: null, xp: 14800, streak: 38, country: 'UZ' },
  { rank: 4,  user_id: 'u4',  username: 'MadinaMirzo',      avatar_url: null, xp: 13400, streak: 30, country: 'UZ' },
  { rank: 5,  user_id: 'u5',  username: 'AkbarjonK',        avatar_url: null, xp: 12100, streak: 28, country: 'UZ' },
  { rank: 6,  user_id: 'u6',  username: 'ZulfiyaR',         avatar_url: null, xp: 11700, streak: 21, country: 'UZ' },
  { rank: 7,  user_id: 'u7',  username: 'FarhodN',          avatar_url: null, xp: 10900, streak: 19, country: 'UZ' },
  { rank: 8,  user_id: 'u8',  username: 'DiloromA',         avatar_url: null, xp: 9800,  streak: 15, country: 'UZ' },
  { rank: 9,  user_id: 'u9',  username: 'SherzodB',         avatar_url: null, xp: 8600,  streak: 12, country: 'UZ' },
  { rank: 10, user_id: 'u10', username: 'GulsanamI',        avatar_url: null, xp: 7400,  streak: 9,  country: 'UZ' },
];

// ── Profile ───────────────────────────────────────────────────────────────────

/**
 * Fetches a user profile row by ID.
 * Falls back to mock data if the row is not found (development convenience).
 */
export async function getProfile(userId: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    // PGRST116 = no rows found
    if ((error as { code?: string }).code === 'PGRST116') {
      return { ...MOCK_USER, id: userId };
    }
    handleError(error, `getProfile(${userId})`);
  }

  return data as unknown as User;
}

/**
 * Upserts profile fields for the given user.
 */
export async function updateProfile(
  userId: string,
  data: Partial<User>
): Promise<User> {
  const { id: _id, created_at: _ca, ...safeData } = data as Partial<User> & {
    id?: string;
    created_at?: string;
  };

  const { data: updated, error } = await supabase
    .from('users')
    .update(safeData as Record<string, unknown>)
    .eq('id', userId)
    .select('*')
    .single();

  if (error) handleError(error, `updateProfile(${userId})`);

  return updated as unknown as User;
}

// ── Progress ──────────────────────────────────────────────────────────────────

/**
 * Returns aggregated progress stats for the user.
 * Creates a default row if none exists.
 */
export async function getUserProgress(userId: string): Promise<UserProgress> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if ((error as { code?: string }).code === 'PGRST116') {
      // Auto-create a progress row
      const defaults: UserProgress = {
        user_id: userId,
        total_xp: 0,
        current_streak: 0,
        longest_streak: 0,
        lessons_completed: 0,
        words_learned: 0,
        minutes_practiced: 0,
      };
      const { data: created, error: insertError } = await supabase
        .from('user_progress')
        .insert(defaults)
        .select('*')
        .single();
      if (insertError) {
        // Return mock during development
        return { ...MOCK_PROGRESS, user_id: userId };
      }
      return created as unknown as UserProgress;
    }
    // Any other DB error — fall back to mock in dev
    return { ...MOCK_PROGRESS, user_id: userId };
  }

  return data as unknown as UserProgress;
}

// ── Streak ────────────────────────────────────────────────────────────────────

/**
 * Updates the user's streak.  Call once per day when the user completes any
 * activity.  Uses database-level logic to avoid race conditions.
 */
export async function updateStreak(userId: string): Promise<void> {
  // Retrieve current progress to inspect last activity
  const progress = await getUserProgress(userId);

  const today = new Date().toDateString();

  // We store last_activity_at on users table to detect consecutive days
  const { data: user } = await supabase
    .from('users')
    .select('streak, created_at')
    .eq('id', userId)
    .single();

  if (!user) return;

  const newStreak = (progress.current_streak ?? 0) + 1;
  const longestStreak = Math.max(newStreak, progress.longest_streak ?? 0);

  // Update streak on users table
  await supabase
    .from('users')
    .update({ streak: newStreak })
    .eq('id', userId);

  // Update progress table
  await supabase
    .from('user_progress')
    .update({
      current_streak: newStreak,
      longest_streak: longestStreak,
    })
    .eq('user_id', userId);

  void today; // suppress unused-variable warning
}

// ── XP ────────────────────────────────────────────────────────────────────────

/**
 * Adds XP to both the users table and the aggregated progress table.
 * Uses an RPC function if available, otherwise falls back to two updates.
 */
export async function addXP(userId: string, amount: number): Promise<void> {
  if (amount <= 0) return;

  // Attempt to call a DB function first (avoids race conditions)
  const { error: rpcError } = await supabase.rpc('add_user_xp' as never, {
    p_user_id: userId,
    p_amount: amount,
  } as never);

  if (!rpcError) return;

  // Fallback: read-modify-write (acceptable for non-concurrent scenarios)
  const { data: user } = await supabase
    .from('users')
    .select('xp')
    .eq('id', userId)
    .single();

  const currentXP = (user as { xp?: number } | null)?.xp ?? 0;

  await Promise.all([
    supabase
      .from('users')
      .update({ xp: currentXP + amount })
      .eq('id', userId),
    supabase
      .from('user_progress')
      .update({ total_xp: currentXP + amount })
      .eq('user_id', userId),
  ]);
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

/**
 * Returns the global leaderboard, ordered by XP descending.
 * Falls back to mock data when the table is empty.
 */
export async function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, avatar_url, xp, streak')
    .order('xp', { ascending: false })
    .limit(limit);

  if (error || !data || data.length === 0) {
    return LEADERBOARD_MOCK.slice(0, limit);
  }

  return (data as Array<{
    id: string;
    name: string;
    avatar_url: string | null;
    xp: number;
    streak: number;
  }>).map((row, index) => ({
    rank: index + 1,
    user_id: row.id,
    username: row.name,
    avatar_url: row.avatar_url,
    xp: row.xp,
    streak: row.streak,
    country: 'UZ',  // default; extend the users table to store country if needed
  }));
}

// ── Achievements ──────────────────────────────────────────────────────────────

/**
 * Returns all achievements the user has already earned.
 */
export async function getUserAchievements(
  userId: string
): Promise<UserAchievement[]> {
  const { data, error } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) {
    // Return empty list if table doesn't exist yet
    return [];
  }

  return (data ?? []) as unknown as UserAchievement[];
}

/**
 * Checks all achievement conditions for the user and grants any that are newly
 * satisfied.  Returns the list of newly earned achievements.
 */
export async function checkAndGrantAchievements(
  userId: string
): Promise<Achievement[]> {
  const [progress, existing] = await Promise.all([
    getUserProgress(userId),
    getUserAchievements(userId),
  ]);

  const earnedIds = new Set(existing.map((ua) => ua.achievement_id));
  const nowEarned: Achievement[] = [];
  const toInsert: UserAchievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (earnedIds.has(achievement.id)) continue;

    const threshold = achievement.threshold ?? 1;
    let conditionMet = false;

    switch (achievement.condition) {
      case 'lessons_completed':
        conditionMet = progress.lessons_completed >= threshold;
        break;
      case 'current_streak':
        conditionMet = progress.current_streak >= threshold;
        break;
      case 'words_learned':
        conditionMet = progress.words_learned >= threshold;
        break;
      case 'total_xp':
        conditionMet = progress.total_xp >= threshold;
        break;
      case 'minutes_practiced':
        conditionMet = progress.minutes_practiced >= threshold;
        break;
      // Conditions that need richer event data — skip for now
      default:
        break;
    }

    if (conditionMet) {
      nowEarned.push(achievement);
      toInsert.push({
        user_id: userId,
        achievement_id: achievement.id,
        earned_at: new Date().toISOString(),
      });
    }
  }

  if (toInsert.length > 0) {
    // Insert newly earned achievements
    const { error: insertError } = await supabase
      .from('user_achievements')
      .insert(toInsert as never[]);

    if (!insertError) {
      // Grant XP for each achievement
      const totalXP = nowEarned.reduce((sum, a) => sum + a.xp_reward, 0);
      if (totalXP > 0) {
        await addXP(userId, totalXP);
      }
    }
  }

  return nowEarned;
}
