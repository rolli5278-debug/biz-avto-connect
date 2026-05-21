import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle2, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface DailyGoalCardProps {
  completed: number;
  goal: number;
  className?: string;
}

function getMotivationalMessage(completed: number, goal: number): {
  message: string;
  color: string;
} {
  if (goal === 0) return { message: 'Set a daily goal to get started!', color: 'text-muted-foreground' };
  const ratio = completed / goal;
  if (ratio === 0) return { message: 'Start your first lesson today!', color: 'text-muted-foreground' };
  if (ratio < 0.25) return { message: "Great start — keep going!", color: 'text-blue-500' };
  if (ratio < 0.5) return { message: "You're making progress!", color: 'text-blue-500' };
  if (ratio < 0.75) return { message: "More than halfway there!", color: 'text-indigo-500' };
  if (ratio < 1) return { message: "Almost there — finish strong!", color: 'text-violet-500' };
  return { message: "Daily goal achieved! Amazing!", color: 'text-emerald-500' };
}

export function DailyGoalCard({ completed, goal, className }: DailyGoalCardProps) {
  const pct = goal > 0 ? Math.min(100, Math.round((completed / goal) * 100)) : 0;
  const achieved = completed >= goal && goal > 0;
  const { message, color } = getMotivationalMessage(completed, goal);

  return (
    <Card className={cn('relative overflow-hidden border-border/60 shadow-sm', className)}>
      {/* Glow effect when goal achieved */}
      <AnimatePresence>
        {achieved && (
          <motion.div
            key="glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>

      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
              achieved
                ? 'bg-emerald-100 dark:bg-emerald-950/50'
                : 'bg-primary/8 border border-primary/12',
            )}>
              <AnimatePresence mode="wait">
                {achieved ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </motion.div>
                ) : (
                  <motion.div key="target" initial={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Target className="h-5 w-5 text-primary" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Daily Goal</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold tabular-nums">
                  {completed}
                </span>
                <span className="text-sm text-muted-foreground font-normal">/ {goal}</span>
                <span className="text-xs text-muted-foreground">lessons</span>
              </div>
            </div>
          </div>

          {/* Animated flame for achieved */}
          <AnimatePresence>
            {achieved && (
              <motion.div
                key="flame"
                initial={{ opacity: 0, scale: 0, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: 'spring', stiffness: 250, damping: 18 }}
              >
                <motion.div
                  animate={{
                    rotate: [-8, 8, -8],
                    scale: [1, 1.15, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: 'easeInOut',
                  }}
                >
                  <Flame className="h-7 w-7 text-orange-500 drop-shadow-[0_0_6px_rgba(249,115,22,0.5)]" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Percentage badge */}
          {!achieved && (
            <span className={cn(
              'text-sm font-bold tabular-nums px-2 py-0.5 rounded-lg',
              pct === 0
                ? 'bg-muted/60 text-muted-foreground'
                : 'bg-primary/10 text-primary',
            )}>
              {pct}%
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="relative h-2.5 rounded-full bg-muted/60 overflow-hidden">
            <motion.div
              className={cn(
                'h-full rounded-full',
                achieved
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                  : 'bg-gradient-to-r from-primary/80 to-primary',
              )}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
            {/* Shimmer effect */}
            {pct > 0 && !achieved && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear', repeatDelay: 1 }}
              />
            )}
          </div>

          <p className={cn('text-xs font-medium', color)}>
            {message}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default DailyGoalCard;
