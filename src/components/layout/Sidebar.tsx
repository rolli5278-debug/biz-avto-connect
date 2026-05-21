import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Bot,
  BookOpen,
  Mic,
  GraduationCap,
  CreditCard,
  Award,
  Trophy,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
  Settings,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn, calculateLevel } from '@/lib/utils';
import type { User } from '@/types';
import { LevelBadge } from '@/components/shared/LevelBadge';

interface SidebarProps {
  currentPath: string;
  user: User;
  /** Called when user clicks sign-out in the sidebar */
  onSignOut?: () => void;
}

interface SidebarNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  /** Whether item requires Pro/Premium */
  pro?: boolean;
}

const NAV_ITEMS: SidebarNavItem[] = [
  { label: 'Dashboard',     href: '/app',             icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'AI Tutor',      href: '/app/tutor',       icon: <Bot className="w-5 h-5" /> },
  { label: 'Vocabulary',    href: '/app/vocabulary',  icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Speaking Room', href: '/app/speaking',    icon: <Mic className="w-5 h-5" /> },
  { label: 'Lessons',       href: '/app/lessons',     icon: <GraduationCap className="w-5 h-5" /> },
  { label: 'Flashcards',    href: '/app/flashcards',  icon: <CreditCard className="w-5 h-5" /> },
  { label: 'IELTS Prep',    href: '/app/ielts',       icon: <Award className="w-5 h-5" />, pro: true },
  { label: 'Leaderboard',   href: '/app/leaderboard', icon: <Trophy className="w-5 h-5" /> },
  { label: 'Profile',       href: '/app/profile',     icon: <UserIcon className="w-5 h-5" /> },
];

const BOTTOM_ITEMS: SidebarNavItem[] = [
  { label: 'Settings', href: '/app/settings', icon: <Settings className="w-5 h-5" /> },
];

function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Sidebar({ currentPath, user, onSignOut }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const levelInfo = calculateLevel(user.xp);
  const userInitials = getUserInitials(user.name || 'U');

  const isActive = (href: string) => {
    if (href === '/app') return currentPath === '/app' || currentPath === '/app/';
    return currentPath.startsWith(href);
  };

  function NavLink({ item }: { item: SidebarNavItem }) {
    const active = isActive(item.href);

    const linkEl = (
      <Link
        to={item.href}
        className={cn(
          'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
          active
            ? 'bg-gradient-to-r from-purple-600/15 to-blue-500/10 text-purple-700 dark:text-purple-300 shadow-sm'
            : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
          collapsed && 'justify-center px-2.5'
        )}
        aria-current={active ? 'page' : undefined}
      >
        {/* Active left bar */}
        {active && (
          <motion.span
            layoutId="active-pill"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-purple-600 to-blue-500"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}

        {/* Icon */}
        <span
          className={cn(
            'shrink-0 transition-colors',
            active
              ? 'text-purple-600 dark:text-purple-400'
              : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground'
          )}
        >
          {item.icon}
        </span>

        {/* Label */}
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.18 }}
              className="whitespace-nowrap overflow-hidden flex-1"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Badge */}
        {item.badge !== undefined && item.badge > 0 && !collapsed && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-auto shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-purple-500 text-white text-[11px] font-semibold flex items-center justify-center"
          >
            {item.badge}
          </motion.span>
        )}

        {/* Pro badge */}
        {item.pro && !collapsed && (
          <span className="ml-auto shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 leading-none">
            PRO
          </span>
        )}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={80}>
          <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium text-xs">
            {item.label}
            {item.pro && <span className="ml-1.5 text-amber-500">PRO</span>}
          </TooltipContent>
        </Tooltip>
      );
    }
    return linkEl;
  }

  return (
    <TooltipProvider>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="hidden md:flex flex-col h-screen sticky top-0 bg-sidebar border-r border-sidebar-border overflow-hidden shrink-0 z-40"
      >
        {/* ── Header / Logo ── */}
        <div className="flex items-center h-16 px-4 border-b border-sidebar-border shrink-0">
          <Link
            to="/app"
            className="flex items-center gap-2 min-w-0"
            aria-label="EnglishAI dashboard"
          >
            <motion.div
              whileHover={{ scale: 1.08, rotate: 5 }}
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-md shrink-0"
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-lg font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent tracking-tight whitespace-nowrap select-none"
                >
                  EnglishAI
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors shrink-0"
          >
            <motion.span
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.25 }}
              className="flex"
              aria-hidden
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.span>
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav
          className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-0.5"
          aria-label="App navigation"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        {/* ── Bottom section ── */}
        <div className="border-t border-sidebar-border px-2 py-2 shrink-0 space-y-0.5">
          {BOTTOM_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}

          {/* Sign out */}
          {onSignOut && (
            collapsed ? (
              <Tooltip delayDuration={80}>
                <TooltipTrigger asChild>
                  <button
                    onClick={onSignOut}
                    className="w-full flex items-center justify-center px-2.5 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-5 h-5 shrink-0" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">Sign out</TooltipContent>
              </Tooltip>
            ) : (
              <button
                onClick={onSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-5 h-5 shrink-0 text-sidebar-foreground/50" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.18 }}
                      className="whitespace-nowrap"
                    >
                      Sign out
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )
          )}
        </div>

        {/* ── User Mini-Profile ── */}
        <div className="border-t border-sidebar-border px-2 pb-3 pt-2 shrink-0">
          <button
            onClick={() => navigate('/app/profile')}
            className={cn(
              'w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-sidebar-accent transition-colors cursor-pointer',
              collapsed && 'justify-center px-0'
            )}
            aria-label="View profile"
          >
            {/* Avatar with online dot */}
            <div className="relative shrink-0">
              <Avatar className="w-8 h-8 ring-2 ring-purple-500/40">
                <AvatarImage src={user.avatar_url ?? undefined} alt={user.name} />
                <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span
                className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-sidebar"
                aria-label="Online"
              />
            </div>

            {/* User info + XP bar */}
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.18 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-semibold text-sidebar-foreground truncate leading-tight">
                    {user.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <LevelBadge level={user.level} size="xs" />
                    <span className="text-[11px] text-sidebar-foreground/50 tabular-nums">
                      {user.xp.toLocaleString()} XP
                    </span>
                  </div>
                  {/* XP progress bar */}
                  <div className="mt-1.5 h-1.5 rounded-full bg-sidebar-accent overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${levelInfo.progress}%` }}
                      transition={{ duration: 0.9, ease: 'easeOut', delay: 0.3 }}
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                      aria-label={`${levelInfo.progress}% to next level`}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
