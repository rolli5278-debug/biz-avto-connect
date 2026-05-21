import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Achievement } from '@/types';

interface AchievementToastProps {
  achievement: Achievement;
  /** Called when the toast finishes (auto-dismiss or manual close) */
  onDismiss?: () => void;
  /** Auto-dismiss duration in ms (default: 4000) */
  duration?: number;
  className?: string;
}

const RARITY_STYLES = {
  common: {
    gradient: 'from-slate-500/20 via-slate-400/10 to-slate-500/5',
    border: 'border-slate-400/30',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    icon: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    progress: 'bg-slate-400',
    shine: 'from-slate-200/0 via-slate-200/40 to-slate-200/0',
  },
  rare: {
    gradient: 'from-blue-500/20 via-blue-400/10 to-blue-500/5',
    border: 'border-blue-400/40',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
    icon: 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
    progress: 'bg-blue-500',
    shine: 'from-blue-200/0 via-blue-200/50 to-blue-200/0',
  },
  epic: {
    gradient: 'from-purple-500/25 via-violet-400/15 to-purple-500/5',
    border: 'border-purple-400/50',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
    icon: 'bg-gradient-to-br from-purple-500 to-violet-500 text-white',
    progress: 'bg-gradient-to-r from-purple-500 to-violet-500',
    shine: 'from-purple-300/0 via-purple-300/50 to-purple-300/0',
  },
  legendary: {
    gradient: 'from-amber-400/30 via-yellow-300/20 to-amber-400/5',
    border: 'border-amber-400/60',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    icon: 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white',
    progress: 'bg-gradient-to-r from-amber-400 to-yellow-500',
    shine: 'from-yellow-300/0 via-yellow-300/60 to-yellow-300/0',
  },
};

const FALLBACK_STYLE = RARITY_STYLES.common;

export function AchievementToast({
  achievement,
  onDismiss,
  duration = 4000,
  className,
}: AchievementToastProps) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  const style = RARITY_STYLES[achievement.rarity ?? 'common'] ?? FALLBACK_STYLE;

  // Auto-dismiss timer
  useEffect(() => {
    const startTime = performance.now();

    const raf = (now: number) => {
      const elapsed = now - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (elapsed < duration) {
        frame = requestAnimationFrame(raf);
      } else {
        setVisible(false);
      }
    };

    let frame = requestAnimationFrame(raf);
    return () => cancelAnimationFrame(frame);
  }, [duration]);

  const handleDismiss = () => {
    setVisible(false);
  };

  return (
    <AnimatePresence onExitComplete={onDismiss}>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.92, x: 20 }}
          animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
          exit={{ opacity: 0, y: -16, scale: 0.94, x: 20 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'relative overflow-hidden w-80 sm:w-96 rounded-2xl border shadow-xl',
            'bg-gradient-to-br',
            style.gradient,
            style.border,
            'bg-card backdrop-blur-sm',
            className
          )}
          role="alert"
          aria-live="assertive"
        >
          {/* Animated shimmer overlay */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
            className={cn(
              'absolute inset-0 pointer-events-none',
              'bg-gradient-to-r w-1/2',
              style.shine
            )}
            aria-hidden
          />

          {/* Floating sparkles for epic/legendary */}
          {(achievement.rarity === 'epic' || achievement.rarity === 'legendary') && (
            <>
              {[
                { top: '10%', left: '8%', delay: 0.1, size: 'w-3 h-3' },
                { top: '20%', right: '12%', delay: 0.3, size: 'w-2 h-2' },
                { bottom: '25%', left: '15%', delay: 0.5, size: 'w-2.5 h-2.5' },
              ].map((pos, i) => (
                <motion.div
                  key={i}
                  className={cn('absolute pointer-events-none opacity-70', pos.size)}
                  style={{ top: pos.top, left: pos.left, right: pos.right, bottom: pos.bottom }}
                  animate={{ rotate: 360, scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{
                    rotate: { duration: 3, repeat: Infinity, ease: 'linear', delay: pos.delay },
                    scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: pos.delay },
                    opacity: { duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: pos.delay },
                  }}
                  aria-hidden
                >
                  <Sparkles className="w-full h-full text-amber-400" />
                </motion.div>
              ))}
            </>
          )}

          <div className="relative p-4">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.15, type: 'spring', stiffness: 200 }}
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-sm',
                  style.icon
                )}
              >
                {achievement.icon ? (
                  <span role="img" aria-hidden>{achievement.icon}</span>
                ) : (
                  <Trophy className="w-6 h-6" />
                )}
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* "Achievement Unlocked" header */}
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-1.5 mb-0.5"
                >
                  <Trophy className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Achievement Unlocked
                  </span>
                </motion.div>

                {/* Title */}
                <motion.p
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  className="font-bold text-foreground text-sm leading-snug"
                >
                  {achievement.title}
                </motion.p>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed"
                >
                  {achievement.description}
                </motion.p>

                {/* XP reward + rarity badges */}
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-2 mt-2 flex-wrap"
                >
                  {/* XP reward */}
                  <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                    <Star className="w-3 h-3 fill-current" />
                    +{achievement.xp_reward} XP
                  </span>

                  {/* Rarity badge */}
                  {achievement.rarity && achievement.rarity !== 'common' && (
                    <span
                      className={cn(
                        'text-xs font-semibold px-2 py-0.5 rounded-full capitalize',
                        style.badge
                      )}
                    >
                      {achievement.rarity}
                    </span>
                  )}
                </motion.div>
              </div>

              {/* Close button */}
              <button
                onClick={handleDismiss}
                aria-label="Dismiss"
                className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 w-full bg-border/40 overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', style.progress)}
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
