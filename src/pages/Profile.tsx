import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Camera, Save, Loader2, User, MapPin, Globe2, Bell, Lock,
  Trash2, Shield, LogOut, ChevronRight, Crown, Zap, CheckCircle2,
  Moon, Sun, Star, Trophy, Clock, BookOpen, Brain,
  Languages, Volume2, Eye, EyeOff, AlertTriangle, Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { LevelBadge } from '@/components/shared/LevelBadge';
import { XPBadge } from '@/components/shared/XPBadge';
import { StreakCounter } from '@/components/shared/StreakCounter';
import { calculateLevel, formatXP, cn } from '@/lib/utils';
import type { CEFRLevel, SubscriptionType } from '@/types';

// ── Schemas ────────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(200, 'Bio must be under 200 characters').optional(),
  location: z.string().max(100).optional(),
  nativeLanguage: z.string().min(1, 'Please select your native language'),
});

const preferencesSchema = z.object({
  targetLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  dailyGoal: z.coerce.number().min(1).max(20),
  reminderTime: z.string().regex(/^\d{2}:\d{2}$/, 'Enter a valid time (HH:MM)'),
  uiLanguage: z.enum(['en', 'uz']),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Enter your current password'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PreferencesValues = z.infer<typeof preferencesSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_USER = {
  id: 'mock-user-1',
  name: 'Alisher Navoi',
  email: 'alisher.navoi@example.com',
  bio: "English learner from Tashkent. Working toward B2 level for my career in software engineering.",
  location: 'Tashkent, Uzbekistan',
  avatar_url: null as string | null,
  level: 'B1' as CEFRLevel,
  xp: 4250,
  streak: 7,
  subscription_type: 'free' as SubscriptionType,
  nativeLanguage: 'uz',
};

const MOCK_STATS = {
  total_xp: 4250,
  current_streak: 7,
  longest_streak: 14,
  lessons_completed: 23,
  words_learned: 187,
  minutes_practiced: 340,
};

const MOCK_ACHIEVEMENTS = [
  { id: 'a1', title: 'First Lesson', icon: '🎯', rarity: 'common' as const, earned: true },
  { id: 'a2', title: 'Week Warrior', icon: '🔥', rarity: 'rare' as const, earned: true },
  { id: 'a3', title: 'Word Collector', icon: '📚', rarity: 'rare' as const, earned: true },
  { id: 'a4', title: 'XP Hunter', icon: '⭐', rarity: 'epic' as const, earned: false },
  { id: 'a5', title: 'Speed Learner', icon: '⚡', rarity: 'common' as const, earned: false },
  { id: 'a6', title: 'Marathon', icon: '🏃', rarity: 'epic' as const, earned: false },
  { id: 'a7', title: 'Grammar Guru', icon: '📝', rarity: 'rare' as const, earned: false },
  { id: 'a8', title: 'Legend', icon: '👑', rarity: 'legendary' as const, earned: false },
];

const NATIVE_LANGUAGES = [
  { value: 'uz', label: "O'zbek (Uzbek)" },
  { value: 'ru', label: 'Русский (Russian)' },
  { value: 'kk', label: 'Қазақ (Kazakh)' },
  { value: 'tg', label: 'Тоҷикӣ (Tajik)' },
  { value: 'ky', label: 'Кыргыз (Kyrgyz)' },
  { value: 'tr', label: 'Türkçe (Turkish)' },
  { value: 'ar', label: 'العربية (Arabic)' },
  { value: 'zh', label: '中文 (Chinese)' },
  { value: 'other', label: 'Other' },
];

const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// ── Helpers ───────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
  );
}

function PasswordInput({ id, label, error, ...props }: {
  id: string; label: string; error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm">{label}</Label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-10 py-2 text-sm',
            'ring-offset-background placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-400 focus-visible:ring-red-300',
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(p => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}

// ── Subscription card ─────────────────────────────────────────────────────────

function SubscriptionCard({ plan }: { plan: SubscriptionType }) {
  const isPro = plan === 'pro' || plan === 'premium';
  return (
    <Card className={cn(
      'border overflow-hidden',
      isPro
        ? 'border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30'
        : 'border-border/60',
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center',
                isPro ? 'bg-violet-100 dark:bg-violet-950/60' : 'bg-muted',
              )}>
                {isPro ? <Crown className="h-4 w-4 text-violet-500" /> : <Zap className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div>
                <p className="text-sm font-bold capitalize">{plan} Plan</p>
                {isPro && (
                  <p className="text-[11px] text-violet-600 dark:text-violet-400 font-medium">Active subscription</p>
                )}
              </div>
            </div>
            {!isPro && (
              <ul className="space-y-1 mb-4">
                {[
                  'Unlimited lessons',
                  'AI speaking practice',
                  'Advanced analytics',
                  'Offline mode',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {isPro && (
            <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-0 text-[11px]">
              <Sparkles className="h-3 w-3 mr-1" />
              Active
            </Badge>
          )}
        </div>
        {!isPro && (
          <Button className="w-full h-9 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-shadow">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Pro · $9.99/mo
          </Button>
        )}
        {isPro && (
          <Button variant="outline" size="sm" className="h-8 text-xs text-muted-foreground">
            Manage subscription
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Profile() {
  const navigate = useNavigate();
  const [user] = useState(MOCK_USER);
  const [stats] = useState(MOCK_STATS);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar_url);
  const fileRef = useRef<HTMLInputElement>(null);

  // Notification toggles
  const [notifs, setNotifs] = useState({
    dailyReminder: true,
    streakAlert: true,
    newLessons: false,
    achievements: true,
    weeklyReport: true,
    emailMarketing: false,
  });

  // Privacy toggles
  const [privacy, setPrivacy] = useState({
    showOnLeaderboard: true,
    publicProfile: false,
    shareProgress: true,
  });

  const levelInfo = calculateLevel(user.xp);

  // ── Profile form ──────────────────────────────────────────────────────────
  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      bio: user.bio,
      location: user.location,
      nativeLanguage: user.nativeLanguage,
    },
  });

  // ── Preferences form ──────────────────────────────────────────────────────
  const prefsForm = useForm<PreferencesValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      targetLevel: 'B2',
      dailyGoal: 5,
      reminderTime: '09:00',
      uiLanguage: 'en',
    },
  });

  // ── Password form ──────────────────────────────────────────────────────────
  const pwdForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  const onSaveProfile = async (_data: ProfileValues) => {
    await new Promise(r => setTimeout(r, 800));
    toast.success('Profile updated successfully!');
  };

  const onSavePreferences = async (_data: PreferencesValues) => {
    await new Promise(r => setTimeout(r, 600));
    toast.success('Preferences saved!');
  };

  const onChangePassword = async (_data: PasswordValues) => {
    await new Promise(r => setTimeout(r, 800));
    toast.success('Password changed successfully!');
    pwdForm.reset();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB');
      return;
    }
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    toast.success('Avatar updated! (Save to confirm)');
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion requested. (Demo — no action taken)');
  };

  const handleSignOut = () => {
    toast.info('Signing out…');
    navigate('/auth');
  };

  const toggleNotif = (key: keyof typeof notifs) =>
    setNotifs(p => ({ ...p, [key]: !p[key] }));

  const togglePrivacy = (key: keyof typeof privacy) =>
    setPrivacy(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Header ── */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Profile & Settings</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Manage your account and learning preferences</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/50"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </motion.div>

        {/* ── Avatar + summary card ── */}
        <motion.div custom={0.07} variants={fadeUp} initial="hidden" animate="show">
          <Card className="border-border/60 shadow-sm overflow-hidden">
            {/* Gradient header strip */}
            <div
              className="h-24 w-full"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #0ea5e9 100%)' }}
            />
            <CardContent className="px-6 pb-6 -mt-12">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                {/* Avatar */}
                <div className="flex items-end gap-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20 ring-4 ring-background border-2 border-border/60 shadow-lg">
                      <AvatarImage src={avatarPreview ?? undefined} alt={user.name} />
                      <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className={cn(
                        'absolute -bottom-1 -right-1 w-8 h-8 rounded-full',
                        'bg-primary text-primary-foreground flex items-center justify-center',
                        'shadow-md hover:shadow-lg transition-shadow hover:scale-105',
                      )}
                      aria-label="Change avatar"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <div className="pb-1">
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <LevelBadge level={user.level} size="sm" />
                      <StreakCounter streak={user.streak} size="sm" />
                    </div>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="flex gap-4 sm:gap-6 flex-wrap pb-1">
                  {[
                    { label: 'XP', value: formatXP(user.xp) },
                    { label: 'Lessons', value: stats.lessons_completed.toString() },
                    { label: 'Words', value: stats.words_learned.toString() },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center">
                      <p className="text-lg font-bold tabular-nums">{value}</p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Level progress */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">
                    Level {user.level} progress
                  </span>
                  <span className="font-semibold tabular-nums">
                    {levelInfo.currentLevelXP.toLocaleString()} / {levelInfo.levelSpan.toLocaleString()} XP
                  </span>
                </div>
                <div className="relative h-2 rounded-full bg-muted/60 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${levelInfo.progress}%` }}
                    transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {levelInfo.nextLevelXP > 0
                    ? `${levelInfo.nextLevelXP.toLocaleString()} XP to ${CEFR_LEVELS[CEFR_LEVELS.indexOf(user.level) + 1] ?? 'C2'}`
                    : 'Maximum level reached!'}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div custom={0.14} variants={fadeUp} initial="hidden" animate="show">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 h-11">
              <TabsTrigger value="profile" className="text-xs sm:text-sm gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="text-xs sm:text-sm gap-1.5">
                <Brain className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Learning</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs sm:text-sm gap-1.5">
                <Bell className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Alerts</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="text-xs sm:text-sm gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
            </TabsList>

            {/* ── Profile tab ── */}
            <TabsContent value="profile" className="space-y-6 mt-0">
              <Card className="border-border/60 shadow-sm">
                <CardContent className="p-6">
                  <SectionHeader title="Personal Information" description="Update your public profile details" />
                  <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
                    {/* Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-sm">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <Input
                            id="name"
                            className={cn('pl-9', profileForm.formState.errors.name && 'border-red-400')}
                            {...profileForm.register('name')}
                          />
                        </div>
                        {profileForm.formState.errors.name && (
                          <p className="text-red-500 text-xs">{profileForm.formState.errors.name.message}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="location" className="text-sm">Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <Input
                            id="location"
                            className="pl-9"
                            placeholder="City, Country"
                            {...profileForm.register('location')}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-1.5">
                      <Label htmlFor="bio" className="text-sm">Bio</Label>
                      <Textarea
                        id="bio"
                        className="resize-none"
                        rows={3}
                        placeholder="Tell others about yourself and your learning goals…"
                        {...profileForm.register('bio')}
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {profileForm.watch('bio')?.length ?? 0}/200
                      </p>
                    </div>

                    {/* Native language */}
                    <div className="space-y-1.5">
                      <Label className="text-sm">Native Language</Label>
                      <Select
                        defaultValue={user.nativeLanguage}
                        onValueChange={(v) => profileForm.setValue('nativeLanguage', v)}
                      >
                        <SelectTrigger className="w-full sm:w-64">
                          <Languages className="h-4 w-4 text-muted-foreground mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {NATIVE_LANGUAGES.map(({ value, label }) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        className="gap-2"
                        disabled={profileForm.formState.isSubmitting}
                      >
                        {profileForm.formState.isSubmitting ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                        ) : (
                          <><Save className="h-4 w-4" /> Save Profile</>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Subscription */}
              <SubscriptionCard plan={user.subscription_type} />

              {/* Achievements grid */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3 pt-5 px-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      Achievements
                    </CardTitle>
                    <Badge variant="secondary" className="text-[11px]">
                      {MOCK_ACHIEVEMENTS.filter(a => a.earned).length}/{MOCK_ACHIEVEMENTS.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                    {MOCK_ACHIEVEMENTS.map((ach) => (
                      <motion.div
                        key={ach.id}
                        whileHover={{ scale: ach.earned ? 1.08 : 1.02 }}
                        title={ach.title}
                        className={cn(
                          'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all cursor-default',
                          ach.earned
                            ? cn(
                              ach.rarity === 'legendary' && 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-amber-200 dark:border-amber-800',
                              ach.rarity === 'epic' && 'bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200 dark:border-violet-800',
                              ach.rarity === 'rare' && 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800',
                              ach.rarity === 'common' && 'bg-muted/30 border-border/60',
                            )
                            : 'border-border/30 bg-muted/10 opacity-35 grayscale',
                        )}
                      >
                        <span className="text-xl">{ach.icon}</span>
                        <span className="text-[9px] font-semibold text-center leading-tight line-clamp-2">
                          {ach.title}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Stats summary */}
              <Card className="border-border/60 shadow-sm">
                <CardContent className="p-6">
                  <SectionHeader title="Learning Stats" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { icon: Zap, label: 'Total XP', value: formatXP(stats.total_xp), color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-950/60' },
                      { icon: BookOpen, label: 'Lessons Done', value: stats.lessons_completed.toString(), color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-950/60' },
                      { icon: Brain, label: 'Words Learned', value: stats.words_learned.toString(), color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-950/60' },
                      { icon: Clock, label: 'Minutes Practiced', value: stats.minutes_practiced.toString(), color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-950/60' },
                      { icon: Star, label: 'Best Streak', value: `${stats.longest_streak} days`, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-950/60' },
                      { icon: Trophy, label: 'Current Level', value: user.level, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-950/60' },
                    ].map(({ icon: Icon, label, value, color, bg }) => (
                      <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40">
                        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', bg)}>
                          <Icon className={cn('h-4 w-4', color)} />
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
                          <p className="text-sm font-bold tabular-nums">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Learning preferences tab ── */}
            <TabsContent value="preferences" className="space-y-6 mt-0">
              <Card className="border-border/60 shadow-sm">
                <CardContent className="p-6">
                  <SectionHeader
                    title="Learning Preferences"
                    description="Customize your learning experience"
                  />
                  <form onSubmit={prefsForm.handleSubmit(onSavePreferences)} className="space-y-5">
                    {/* Target level */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Target Level</Label>
                      <p className="text-xs text-muted-foreground">What CEFR level are you working towards?</p>
                      <div className="flex gap-2 flex-wrap">
                        {CEFR_LEVELS.map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => prefsForm.setValue('targetLevel', lvl)}
                            className={cn(
                              'px-4 py-2 rounded-xl text-sm font-semibold border transition-all',
                              prefsForm.watch('targetLevel') === lvl
                                ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                : 'bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted',
                            )}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Daily goal */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="dailyGoal" className="text-sm font-medium">Daily Lesson Goal</Label>
                        <div className="flex items-center gap-3">
                          <Input
                            id="dailyGoal"
                            type="number"
                            min={1}
                            max={20}
                            className="w-24 text-center font-bold"
                            {...prefsForm.register('dailyGoal')}
                          />
                          <span className="text-sm text-muted-foreground">lessons per day</span>
                        </div>
                        {prefsForm.formState.errors.dailyGoal && (
                          <p className="text-red-500 text-xs">{prefsForm.formState.errors.dailyGoal.message}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="reminderTime" className="text-sm font-medium">
                          <Bell className="inline h-3.5 w-3.5 mr-1" />
                          Daily Reminder
                        </Label>
                        <Input
                          id="reminderTime"
                          type="time"
                          className="w-36"
                          {...prefsForm.register('reminderTime')}
                        />
                      </div>
                    </div>

                    {/* UI Language */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        <Languages className="inline h-3.5 w-3.5 mr-1" />
                        Interface Language
                      </Label>
                      <div className="flex gap-3">
                        {[
                          { value: 'en', label: '🇬🇧 English' },
                          { value: 'uz', label: "🇺🇿 O'zbek" },
                        ].map(({ value, label }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => prefsForm.setValue('uiLanguage', value as 'en' | 'uz')}
                            className={cn(
                              'px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                              prefsForm.watch('uiLanguage') === value
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted',
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" className="gap-2" disabled={prefsForm.formState.isSubmitting}>
                        {prefsForm.formState.isSubmitting ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                        ) : (
                          <><Save className="h-4 w-4" /> Save Preferences</>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Connected accounts */}
              <Card className="border-border/60 shadow-sm">
                <CardContent className="p-6">
                  <SectionHeader
                    title="Connected Accounts"
                    description="Link social accounts for faster sign-in"
                  />
                  <div className="space-y-3">
                    {[
                      {
                        icon: (
                          <svg viewBox="0 0 24 24" className="h-4 w-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                        ),
                        name: 'Google',
                        status: 'Not connected',
                        connected: false,
                      },
                      {
                        icon: <Globe2 className="h-4 w-4 text-sky-500" />,
                        name: 'Telegram',
                        status: 'Not connected',
                        connected: false,
                      },
                    ].map(({ icon, name, status, connected }) => (
                      <div
                        key={name}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                            {icon}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{name}</p>
                            <p className="text-xs text-muted-foreground">{status}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={connected ? 'outline' : 'secondary'}
                          className="h-8 text-xs"
                          onClick={() => toast.info(`${name} connection coming soon!`)}
                        >
                          {connected ? 'Disconnect' : 'Connect'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Notifications tab ── */}
            <TabsContent value="notifications" className="space-y-6 mt-0">
              <Card className="border-border/60 shadow-sm">
                <CardContent className="p-6">
                  <SectionHeader
                    title="Notification Settings"
                    description="Choose what you want to be notified about"
                  />
                  <div className="space-y-1">
                    {[
                      { key: 'dailyReminder' as const, label: 'Daily study reminder', sub: 'Remind me to practice at my set time', icon: Bell },
                      { key: 'streakAlert' as const, label: 'Streak alert', sub: 'Alert when my streak is about to break', icon: Star },
                      { key: 'newLessons' as const, label: 'New lessons available', sub: 'Notify when new content is published', icon: BookOpen },
                      { key: 'achievements' as const, label: 'Achievement unlocked', sub: 'Celebrate when I earn a new badge', icon: Trophy },
                      { key: 'weeklyReport' as const, label: 'Weekly progress report', sub: 'Summary of my week every Sunday', icon: Zap },
                      { key: 'emailMarketing' as const, label: 'Promotional emails', sub: 'Tips, offers, and platform updates', icon: Globe2 },
                    ].map(({ key, label, sub, icon: Icon }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between py-3.5 border-b border-border/40 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                          </div>
                        </div>
                        <Switch
                          checked={notifs[key]}
                          onCheckedChange={() => toggleNotif(key)}
                          aria-label={label}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Privacy */}
              <Card className="border-border/60 shadow-sm">
                <CardContent className="p-6">
                  <SectionHeader
                    title="Privacy Settings"
                    description="Control your visibility on the platform"
                  />
                  <div className="space-y-1">
                    {[
                      { key: 'showOnLeaderboard' as const, label: 'Show on leaderboard', sub: 'Let others see your rank and XP' },
                      { key: 'publicProfile' as const, label: 'Public profile', sub: 'Allow anyone to view my profile page' },
                      { key: 'shareProgress' as const, label: 'Share progress', sub: 'Include me in community progress stats' },
                    ].map(({ key, label, sub }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between py-3.5 border-b border-border/40 last:border-0"
                      >
                        <div>
                          <p className="text-sm font-medium">{label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                        </div>
                        <Switch
                          checked={privacy[key]}
                          onCheckedChange={() => togglePrivacy(key)}
                          aria-label={label}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Account & Security tab ── */}
            <TabsContent value="account" className="space-y-6 mt-0">

              {/* Change password */}
              <Card className="border-border/60 shadow-sm">
                <CardContent className="p-6">
                  <SectionHeader
                    title="Change Password"
                    description="Use a strong password at least 8 characters long"
                  />
                  <form onSubmit={pwdForm.handleSubmit(onChangePassword)} className="space-y-4">
                    <PasswordInput
                      id="currentPwd"
                      label="Current Password"
                      error={pwdForm.formState.errors.currentPassword?.message}
                      autoComplete="current-password"
                      {...pwdForm.register('currentPassword')}
                    />
                    <PasswordInput
                      id="newPwd"
                      label="New Password"
                      error={pwdForm.formState.errors.newPassword?.message}
                      autoComplete="new-password"
                      {...pwdForm.register('newPassword')}
                    />
                    <PasswordInput
                      id="confirmPwd"
                      label="Confirm New Password"
                      error={pwdForm.formState.errors.confirmPassword?.message}
                      autoComplete="new-password"
                      {...pwdForm.register('confirmPassword')}
                    />
                    <div className="flex justify-end">
                      <Button type="submit" className="gap-2" disabled={pwdForm.formState.isSubmitting}>
                        {pwdForm.formState.isSubmitting ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</>
                        ) : (
                          <><Lock className="h-4 w-4" /> Update Password</>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Subscription card in account too */}
              <SubscriptionCard plan={user.subscription_type} />

              {/* Danger zone */}
              <Card className="border-red-200/60 dark:border-red-900/40 shadow-sm">
                <CardContent className="p-6">
                  <SectionHeader title="Danger Zone" description="These actions are irreversible" />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-red-700 dark:text-red-400">Delete Account</p>
                          <p className="text-xs text-red-600/70 dark:text-red-500/70 mt-0.5">
                            Permanently delete your account and all data. This cannot be undone.
                          </p>
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 text-xs gap-1.5 flex-shrink-0 ml-4"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete your account, all your progress, XP,
                              achievements, and flashcards. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteAccount}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Yes, delete my account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
