import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn, getLevelName } from '@/lib/utils';
import type { CEFRLevel } from '@/types';

interface LevelBadgeProps {
  level: string;
  showName?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

interface LevelStyle {
  badge: string;
  dot: string;
  ring: string;
  glow: string;
}

const LEVEL_STYLES: Record<CEFRLevel, LevelStyle> = {
  A1: {
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-500/30',
    glow: 'shadow-emerald-400/20',
  },
  A2: {
    badge: 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300',
    dot: 'bg-green-500',
    ring: 'ring-green-500/30',
    glow: 'shadow-green-400/20',
  },
  B1: {
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
    dot: 'bg-blue-500',
    ring: 'ring-blue-500/30',
    glow: 'shadow-blue-400/20',
  },
  B2: {
    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300',
    dot: 'bg-indigo-500',
    ring: 'ring-indigo-500/30',
    glow: 'shadow-indigo-400/20',
  },
  C1: {
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
    dot: 'bg-purple-500',
    ring: 'ring-purple-500/30',
    glow: 'shadow-purple-400/20',
  },
  C2: {
    badge:
      'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 dark:from-amber-950/60 dark:to-yellow-950/60 dark:text-amber-300',
    dot: 'bg-gradient-to-br from-amber-400 to-yellow-500',
    ring: 'ring-amber-400/40',
    glow: 'shadow-amber-400/25',
  },
};

const FALLBACK_STYLE: LevelStyle = {
  badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  dot: 'bg-gray-400',
  ring: 'ring-gray-400/30',
  glow: '',
};

const SIZE_MAP = {
  xs: 'text-[10px] px-1.5 py-0.5 rounded gap-1',
  sm: 'text-xs px-2 py-0.5 rounded-md gap-1',
  md: 'text-sm px-2.5 py-1 rounded-lg gap-1.5',
  lg: 'text-base px-3 py-1.5 rounded-xl gap-2',
};

const DOT_SIZE_MAP = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
};

export function LevelBadge({
  level,
  showName = false,
  size = 'sm',
  className,
}: LevelBadgeProps) {
  const style = LEVEL_STYLES[level as CEFRLevel] ?? FALLBACK_STYLE;
  const levelName = getLevelName(level);

  const badge = (
    <motion.span
      whileHover={{ scale: 1.06 }}
      className={cn(
        'inline-flex items-center font-semibold ring-1 select-none whitespace-nowrap',
        style.badge,
        style.ring,
        style.glow && `shadow-sm ${style.glow}`,
        SIZE_MAP[size],
        className
      )}
    >
      {/* Colored dot */}
      <span
        className={cn('shrink-0 rounded-full', style.dot, DOT_SIZE_MAP[size])}
        aria-hidden
      />

      {/* Level code */}
      <span>{level}</span>

      {/* Optional full name */}
      {showName && (
        <span className="opacity-70 font-normal">— {levelName}</span>
      )}
    </motion.span>
  );

  if (showName) return badge;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="text-xs font-medium">
          {level} · {levelName}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
