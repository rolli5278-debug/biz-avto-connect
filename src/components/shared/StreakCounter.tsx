import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  sm: { container: 'h-7 px-2 gap-1 text-xs rounded-lg', emoji: 'text-sm' },
  md: { container: 'h-9 px-3 gap-1.5 text-sm rounded-xl', emoji: 'text-base' },
  lg: { container: 'h-11 px-4 gap-2 text-base rounded-xl', emoji: 'text-lg' },
};

function getStreakTier(streak: number): {
  bg: string;
  text: string;
  ring: string;
  emoji: string;
  glow: string;
} {
  if (streak === 0)
    return {
      bg: 'bg-slate-100/80 dark:bg-slate-800/60',
      text: 'text-slate-500 dark:text-slate-400',
      ring: 'ring-slate-300/40 dark:ring-slate-600/40',
      emoji: '❄️',
      glow: '',
    };
  if (streak < 7)
    return {
      bg: 'bg-gradient-to-r from-orange-400/20 to-red-400/15',
      text: 'text-orange-600 dark:text-orange-400',
      ring: 'ring-orange-400/40',
      emoji: '🔥',
      glow: 'shadow-orange-400/20',
    };
  if (streak < 30)
    return {
      bg: 'bg-gradient-to-r from-amber-400/20 to-orange-400/15',
      text: 'text-amber-600 dark:text-amber-400',
      ring: 'ring-amber-400/40',
      emoji: '⚡',
      glow: 'shadow-amber-400/25',
    };
  if (streak < 100)
    return {
      bg: 'bg-gradient-to-r from-violet-400/20 to-purple-400/15',
      text: 'text-violet-600 dark:text-violet-400',
      ring: 'ring-violet-400/40',
      emoji: '💎',
      glow: 'shadow-violet-400/25',
    };
  return {
    bg: 'bg-gradient-to-r from-yellow-400/25 to-amber-300/20',
    text: 'text-yellow-600 dark:text-yellow-400',
    ring: 'ring-yellow-400/50',
    emoji: '👑',
    glow: 'shadow-yellow-400/30',
  };
}

export function StreakCounter({ streak, size = 'md', className }: StreakCounterProps) {
  const tier = getStreakTier(streak);
  const sizes = SIZE_MAP[size];
  const isActive = streak > 0;

  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        'inline-flex items-center font-semibold ring-1 shadow-sm select-none',
        tier.bg,
        tier.text,
        tier.ring,
        tier.glow && `shadow-sm ${tier.glow}`,
        sizes.container,
        className
      )}
    >
      {/* Animated fire emoji */}
      <motion.span
        className={cn('shrink-0', sizes.emoji)}
        animate={
          isActive
            ? {
                rotate: [-5, 5, -5],
                scale: [1, 1.12, 1],
              }
            : {}
        }
        transition={
          isActive
            ? {
                rotate: { repeat: Infinity, duration: 1.4, ease: 'easeInOut' },
                scale: { repeat: Infinity, duration: 1.4, ease: 'easeInOut' },
              }
            : {}
        }
      >
        {tier.emoji}
      </motion.span>

      {/* Streak count */}
      <span>{streak}</span>

      {/* "days" label for md/lg */}
      {size !== 'sm' && (
        <span className="opacity-60 text-[0.75em] font-normal">
          {streak === 1 ? 'day' : 'days'}
        </span>
      )}

      {/* Pulse ring for active streaks */}
      {isActive && (
        <motion.span
          className={cn(
            'absolute inset-0 rounded-[inherit] pointer-events-none',
            'ring-2',
            tier.ring
          )}
          animate={{ opacity: [0.6, 0, 0.6] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          style={{ position: 'absolute' }}
        />
      )}
    </motion.div>
  );
}
