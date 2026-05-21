import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, BookOpen, Brain, Clock, ChevronRight,
  Mic, CreditCard, HelpCircle, Trophy, Crown, Medal,
  TrendingUp, Flame, Star, ArrowRight, User2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { StatsCard } from '@/components/dashboard/StatsCard';
import { StreakCalendar } from '@/components/dashboard/StreakCalendar';
import { DailyGoalCard } from '@/components/dashboard/DailyGoalCard';
import { LessonCard } from '@/components/dashboard/LessonCard';
import { WordOfTheDay } from '@/components/dashboard/WordOfTheDay';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { StreakCounter } from '@/components/shared/StreakCounter';
import { XPBadge } from '@/components/shared/XPBadge';
import { ProgressRing } from '@/components/shared/ProgressRing';

import { calculateLevel, formatXP, cn } from '@/lib/utils';
import type { Lesson, LeaderboardEntry, Achievement, VocabularyWord } from '@/types';

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_USER = {
  id: 'mock-user-1',
  name: 'Alisher Navoi',
  email: 'alisher@example.com',
  avatar_url: null as string | null,
  level: 'B1' as const,
  xp: 4250,
  streak: 7,
  subscription_type: 'free' as const,
  created_at: '2025-01-01T00:00:00Z',
};

const MOCK_PROGRESS = {
  user_id: 'mock-user-1',
  total_xp: 4250,
  current_streak: 7,
  longest_streak: 14,
  lessons_completed: 23,
  words_learned: 187,
  minutes_practiced: 340,
};

// 14-day streak data: last 14 days, today is last item
const MOCK_STREAK_DATA: boolean[] = [
  true, false, true, true, true, false, true,
  true, true, false, true, true, true, true,
];

const MOCK_LESSONS: Lesson[] = [
  {
    id: '1',
    title: 'Present Perfect Tense Mastery',
    description: 'Learn how to use the present perfect tense in everyday conversation with practical examples.',
    level: 'B1',
    type: 'grammar',
    duration_minutes: 15,
    xp_reward: 50,
    content: { body: '' },
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Business Vocabulary Essentials',
    description: 'Expand your professional vocabulary with 30 key business terms and their usage.',
    level: 'B2',
    type: 'vocabulary',
    duration_minutes: 20,
    xp_reward: 65,
    content: { body: '' },
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '3',
    title: 'Talking About Your Day',
    description: 'Practice speaking fluently about daily routines, hobbies, and personal experiences.',
    level: 'B1',
    type: 'speaking',
    duration_minutes: 25,
    xp_reward: 80,
    content: { body: '' },
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '4',
    title: 'News Listening Comprehension',
    description: 'Sharpen your listening skills with authentic BBC news clips and comprehension questions.',
    level: 'B2',
    type: 'listening',
    duration_minutes: 18,
    xp_reward: 55,
    content: { body: '' },
    created_at: '2025-01-01T00:00:00Z',
    is_premium: true,
  },
];

const RECOMMENDED_LESSON: Lesson = {
  id: '5',
  title: 'Conditionals: Second & Third',
  description: 'Master conditional sentences for hypothetical situations. Includes interactive exercises and AI feedback.',
  level: 'B1',
  type: 'grammar',
  duration_minutes: 22,
  xp_reward: 70,
  content: { body: '' },
  created_at: '2025-01-01T00:00:00Z',
  tags: ['grammar', 'conditionals', 'intermediate'],
};

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, user_id: 'u1', username: 'SarahL', avatar_url: null, xp: 8920, streak: 21, country: 'UZ' },
  { rank: 2, user_id: 'u2', username: 'Murod_99', avatar_url: null, xp: 7340, streak: 15, country: 'UZ' },
  { rank: 3, user_id: 'u3', username: 'Emily_K', avatar_url: null, xp: 6150, streak: 9, country: 'US' },
  { rank: 12, user_id: 'mock-user-1', username: 'You', avatar_url: null, xp: 4250, streak: 7, country: 'UZ' },
];

const ACHIEVEMENTS: Array<Achievement & { earned: boolean }> = [
  { id: 'a1', title: 'First Lesson', description: 'Complete your first lesson', icon: '🎯', xp_reward: 50, condition: 'lessons_completed', threshold: 1, rarity: 'common', earned: true },
  { id: 'a2', title: 'Week Warrior', description: '7-day streak', icon: '🔥', xp_reward: 100, condition: 'streak', threshold: 7, rarity: 'rare', earned: true },
  { id: 'a3', title: 'Word Collector', description: 'Learn 100 words', icon: '📚', xp_reward: 150, condition: 'words_learned', threshold: 100, rarity: 'rare', earned: true },
  { id: 'a4', title: 'XP Hunter', description: 'Earn 5,000 XP', icon: '⭐', xp_reward: 200, condition: 'total_xp', threshold: 5000, rarity: 'epic', earned: false },
  { id: 'a5', title: 'Speed Learner', description: 'Complete 3 lessons in one day', icon: '⚡', xp_reward: 75, condition: 'daily_lessons', threshold: 3, rarity: 'common', earned: false },
  { id: 'a6', title: 'Marathon', description: '30-day streak', icon: '🏃', xp_reward: 500, condition: 'streak', threshold: 30, rarity: 'epic', earned: false },
];

const WORD_OF_THE_DAY: VocabularyWord = {
  id: 'wotd-1',
  word: 'Perseverance',
  definition: 'Continued effort to do or achieve something despite difficulties, failure, or opposition.',
  example_sentence: 'Her perseverance in learning English finally paid off when she got the job.',
  translation_uz: "Qat'iyat, bardoshlilik — qiyinchiliklarga qaramasdan maqsadga intilish",
  pronunciation: 'pɜːrsɪˈvɪərəns',
  audio_url: null,
  category: 'noun',
  difficulty: 'medium',
  level: 'B2',
  synonyms: ['tenacity', 'persistence', 'determination'],
  antonyms: ['laziness', 'irresolution'],
};

// ── Quick actions ──────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  {
    icon: BookOpen,
    label: 'Continue Learning',
    sub: 'Lesson 24 of 50',
    color: 'from-blue-500/10 to-indigo-500/10 border-blue-200/60 dark:border-blue-800/40',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100 dark:bg-blue-950/60',
    route: '/lessons',
  },
  {
    icon: Mic,
    label: 'Practice Speaking',
    sub: '5 topics ready',
    color: 'from-rose-500/10 to-pink-500/10 border-rose-200/60 dark:border-rose-800/40',
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-100 dark:bg-rose-950/60',
    route: '/speaking',
  },
  {
    icon: CreditCard,
    label: 'Review Flashcards',
    sub: '12 cards due',
    color: 'from-violet-500/10 to-purple-500/10 border-violet-200/60 dark:border-violet-800/40',
    iconColor: 'text-violet-500',
    iconBg: 'bg-violet-100 dark:bg-violet-950/60',
    route: '/flashcards',
  },
  {
    icon: HelpCircle,
    label: 'Take a Quiz',
    sub: 'Test your skills',
    color: 'from-amber-500/10 to-orange-500/10 border-amber-200/60 dark:border-amber-800/40',
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-100 dark:bg-amber-950/60',
    route: '/quiz',
  },
];

// ── Greeting ──────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ── Rank display ──────────────────────────────────────────────────────────────

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-4 w-4 text-amber-500" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-slate-400" />;
  if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />;
  return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
}

// ── Stagger helpers ───────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ── Main component ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const [user] = useState(MOCK_USER);
  const [progress] = useState(MOCK_PROGRESS);
  const levelInfo = calculateLevel(user.xp);

  // XP this week (mock)
  const xpThisWeek = 420;
  const dailyCompleted = 3;
  const dailyGoal = 5;

  const greeting = getGreeting();
  const firstName = user.name.split(' ')[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Welcome header ── */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-14 w-14 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                <AvatarImage src={user.avatar_url ?? undefined} alt={user.name} />
                <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              {/* Active indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">{greeting},</p>
              <h1 className="text-2xl font-bold tracking-tight">{firstName}!</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <LevelBadge level={user.level} size="sm" />
                <StreakCounter streak={user.streak} size="sm" />
                <XPBadge xp={user.xp} size="sm" />
              </div>
            </div>
          </div>

          {/* CTA */}
          <Button
            className="gap-2 font-semibold shadow-md hover:shadow-lg transition-shadow self-start sm:self-auto"
            onClick={() => { toast.info('Opening current lesson…'); navigate('/lessons'); }}
          >
            <BookOpen className="h-4 w-4" />
            Continue Learning
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Zap, title: 'XP This Week', value: `+${xpThisWeek}`, trend: 18, color: 'text-amber-500', delay: 0.1 },
            { icon: BookOpen, title: 'Lessons Completed', value: progress.lessons_completed, trend: 8, color: 'text-blue-500', delay: 0.18 },
            { icon: Brain, title: 'Words Learned', value: progress.words_learned, trend: 12, color: 'text-violet-500', delay: 0.26 },
            { icon: Clock, title: 'Minutes Practiced', value: `${progress.minutes_practiced}`, trend: -5, color: 'text-emerald-500', delay: 0.34 },
          ].map(({ icon, title, value, trend, color, delay }) => (
            <motion.div key={title} custom={delay} variants={fadeUp} initial="hidden" animate="show">
              <StatsCard icon={icon} title={title} value={value} trend={trend} color={color} />
            </motion.div>
          ))}
        </div>

        {/* ── Level progress + Streak ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Level progress card */}
          <motion.div custom={0.4} variants={fadeUp} initial="hidden" animate="show" className="lg:col-span-2">
            <Card className="border-border/60 shadow-sm h-full">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  {/* Ring */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <ProgressRing
                      value={levelInfo.progress}
                      size={100}
                      strokeWidth={8}
                      color="#8b5cf6"
                      animationDuration={1.4}
                    />
                    <LevelBadge level={levelInfo.level} showName size="md" />
                  </div>

                  {/* XP details */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold">Level Progress</p>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {levelInfo.currentLevelXP.toLocaleString()} / {levelInfo.levelSpan.toLocaleString()} XP
                        </span>
                      </div>
                      <div className="relative h-3 rounded-full bg-muted/60 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${levelInfo.progress}%` }}
                          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { label: 'Total XP', value: formatXP(user.xp) },
                        { label: 'To Next Level', value: levelInfo.nextLevelXP > 0 ? `${levelInfo.nextLevelXP.toLocaleString()} XP` : 'MAX' },
                        { label: 'Longest Streak', value: `${progress.longest_streak} days` },
                      ].map(({ label, value }) => (
                        <div key={label} className="px-3 py-2.5 rounded-xl bg-muted/40 border border-border/40">
                          <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
                          <p className="text-sm font-bold mt-0.5 tabular-nums">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Streak calendar */}
          <motion.div custom={0.48} variants={fadeUp} initial="hidden" animate="show">
            <Card className="border-border/60 shadow-sm h-full">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Activity (Last 14 Days)
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <StreakCalendar
                  userId={user.id}
                  streakData={MOCK_STREAK_DATA}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ── Quick actions ── */}
        <motion.div custom={0.55} variants={fadeUp} initial="hidden" animate="show">
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map(({ icon: Icon, label, sub, color, iconColor, iconBg, route }, i) => (
              <motion.div
                key={label}
                whileHover={{ y: -3, transition: { duration: 0.18 } }}
                whileTap={{ scale: 0.97 }}
              >
                <Card
                  className={cn(
                    'cursor-pointer border bg-gradient-to-br hover:shadow-md transition-all duration-200',
                    color,
                  )}
                  onClick={() => { toast.info(`Opening ${label}…`); navigate(route); }}
                >
                  <CardContent className="p-4">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', iconBg)}>
                      <Icon className={cn('h-5 w-5', iconColor)} />
                    </div>
                    <p className="text-sm font-semibold leading-snug">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Daily goal + Recommended lesson ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div custom={0.62} variants={fadeUp} initial="hidden" animate="show">
            <DailyGoalCard completed={dailyCompleted} goal={dailyGoal} className="h-full" />
          </motion.div>

          <motion.div custom={0.68} variants={fadeUp} initial="hidden" animate="show" className="lg:col-span-2">
            <Card className="border-border/60 shadow-sm h-full">
              <CardHeader className="pb-3 pt-5 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    Recommended for You
                  </CardTitle>
                  <Badge variant="secondary" className="text-[11px]">
                    AI Picked
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <LessonCard
                  lesson={RECOMMENDED_LESSON}
                  onClick={() => { toast.info(`Opening "${RECOMMENDED_LESSON.title}"…`); navigate('/lessons'); }}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ── Recent lessons + Word of day ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent lessons */}
          <motion.div custom={0.75} variants={fadeUp} initial="hidden" animate="show" className="lg:col-span-2">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3 pt-5 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    Recent Lessons
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                    onClick={() => navigate('/lessons')}
                  >
                    View all <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-1">
                {MOCK_LESSONS.map((lesson, i) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    completed={i === 0}
                    score={i === 0 ? 88 : undefined}
                    progress={i === 1 ? 45 : undefined}
                    compact
                    onClick={() => { toast.info(`Opening "${lesson.title}"…`); navigate('/lessons'); }}
                  />
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Word of the Day */}
          <motion.div custom={0.82} variants={fadeUp} initial="hidden" animate="show">
            <WordOfTheDay
              word={WORD_OF_THE_DAY}
              onAddToFlashcards={() => {}}
            />
          </motion.div>
        </div>

        {/* ── Leaderboard + Achievements ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Leaderboard */}
          <motion.div custom={0.88} variants={fadeUp} initial="hidden" animate="show">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3 pt-5 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    Leaderboard
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                    onClick={() => navigate('/leaderboard')}
                  >
                    Full board <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-2">
                {LEADERBOARD.map((entry, i) => {
                  const isUser = entry.user_id === user.id;
                  const isGap = i > 0 && entry.rank > LEADERBOARD[i - 1].rank + 1;

                  return (
                    <div key={entry.user_id}>
                      {isGap && (
                        <div className="flex items-center gap-2 py-1">
                          <div className="flex-1 border-t border-dashed border-border/50" />
                          <span className="text-[10px] text-muted-foreground/50">···</span>
                          <div className="flex-1 border-t border-dashed border-border/50" />
                        </div>
                      )}
                      <motion.div
                        whileHover={{ x: 2 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
                          isUser
                            ? 'bg-primary/8 border border-primary/15'
                            : 'hover:bg-muted/50',
                        )}
                      >
                        <div className="w-7 flex items-center justify-center flex-shrink-0">
                          <RankIcon rank={entry.rank} />
                        </div>
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={entry.avatar_url ?? undefined} />
                          <AvatarFallback className={cn(
                            'text-xs font-bold',
                            isUser ? 'bg-primary/20 text-primary' : 'bg-muted',
                          )}>
                            {isUser ? <User2 className="h-4 w-4" /> : entry.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-sm font-semibold truncate', isUser && 'text-primary')}>
                            {isUser ? 'You' : entry.username}
                          </p>
                          <p className="text-xs text-muted-foreground">{entry.streak}-day streak</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold tabular-nums">{entry.xp.toLocaleString()}</p>
                          <p className="text-[11px] text-muted-foreground">XP</p>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div custom={0.94} variants={fadeUp} initial="hidden" animate="show">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3 pt-5 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Star className="h-4 w-4 text-violet-500" />
                    Achievements
                  </CardTitle>
                  <Badge variant="secondary" className="text-[11px]">
                    {ACHIEVEMENTS.filter(a => a.earned).length}/{ACHIEVEMENTS.length} earned
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="grid grid-cols-3 gap-2">
                  {ACHIEVEMENTS.map((ach) => (
                    <motion.div
                      key={ach.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title={`${ach.title}: ${ach.description}`}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all cursor-default',
                        ach.earned
                          ? cn(
                            'border-border/60 bg-gradient-to-br',
                            ach.rarity === 'legendary' && 'from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-amber-200 dark:border-amber-800',
                            ach.rarity === 'epic' && 'from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200 dark:border-violet-800',
                            ach.rarity === 'rare' && 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800',
                            ach.rarity === 'common' && 'from-muted/30 to-muted/20',
                          )
                          : 'border-border/30 bg-muted/20 opacity-40 grayscale',
                      )}
                    >
                      <span className="text-2xl">{ach.icon}</span>
                      <p className="text-[11px] font-semibold text-center leading-snug line-clamp-2">
                        {ach.title}
                      </p>
                      {ach.earned && (
                        <span className={cn(
                          'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full',
                          ach.rarity === 'legendary' && 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
                          ach.rarity === 'epic' && 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400',
                          ach.rarity === 'rare' && 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400',
                          ach.rarity === 'common' && 'bg-muted text-muted-foreground',
                        )}>
                          {ach.rarity}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
