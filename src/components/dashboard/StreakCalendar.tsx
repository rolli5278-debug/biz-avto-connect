import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StreakCalendarProps {
  userId: string;
  /** Array of 14 booleans: index 0 = 13 days ago, index 13 = today */
  streakData: boolean[];
  className?: string;
}

function getDayLabel(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1);
}

function getDateLabel(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function StreakCalendar({ streakData, className }: StreakCalendarProps) {
  // Ensure we have exactly 14 entries; pad with false if needed
  const normalized = Array.from({ length: 14 }, (_, i) => streakData[i] ?? false);

  // Current streak = consecutive trues from the end (today backwards)
  let currentStreak = 0;
  for (let i = normalized.length - 1; i >= 0; i--) {
    if (normalized[i]) currentStreak++;
    else break;
  }

  // Total active days in the window
  const activeDays = normalized.filter(Boolean).length;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={currentStreak > 0 ? {
              rotate: [-5, 5, -5],
              scale: [1, 1.15, 1],
            } : {}}
            transition={currentStreak > 0 ? {
              repeat: Infinity,
              duration: 1.6,
              ease: 'easeInOut',
            } : {}}
          >
            <Flame className={cn(
              'h-5 w-5',
              currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground/40'
            )} />
          </motion.div>
          <span className="text-sm font-semibold">
            {currentStreak > 0 ? (
              <span className="text-orange-500">{currentStreak}-day streak!</span>
            ) : (
              <span className="text-muted-foreground">No active streak</span>
            )}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {activeDays}/14 days active
        </span>
      </div>

      {/* Calendar grid */}
      <div className="flex items-end gap-1.5">
        {normalized.map((active, i) => {
          const daysAgo = 13 - i;
          const isToday = daysAgo === 0;
          const dayLetter = getDayLabel(daysAgo);
          const dateLabel = getDateLabel(daysAgo);

          return (
            <motion.div
              key={i}
              className="flex flex-col items-center gap-1 flex-1 min-w-0 group relative"
              initial={{ opacity: 0, scaleY: 0.5 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: i * 0.04, duration: 0.3, ease: 'easeOut' }}
            >
              {/* Tooltip */}
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-popover border border-border text-popover-foreground text-[10px] font-medium px-2 py-1 rounded-md shadow-md whitespace-nowrap">
                  {dateLabel}
                </div>
                <div className="w-1.5 h-1.5 bg-popover border-b border-r border-border rotate-45 mx-auto -mt-[3px]" />
              </div>

              {/* Square */}
              <div
                className={cn(
                  'w-full aspect-square rounded-md transition-all duration-200',
                  'group-hover:scale-110 group-hover:brightness-110',
                  active
                    ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-sm shadow-emerald-500/30'
                    : 'bg-muted/60 dark:bg-muted/30',
                  isToday && !active && 'ring-2 ring-primary/60 ring-offset-1 ring-offset-background',
                  isToday && active && 'ring-2 ring-emerald-400/80 ring-offset-1 ring-offset-background shadow-emerald-400/40',
                )}
              >
                {active && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-white/60" />
                  </div>
                )}
              </div>

              {/* Day label */}
              <span className={cn(
                'text-[9px] font-medium leading-none',
                isToday ? 'text-primary font-bold' : 'text-muted-foreground/60',
              )}>
                {isToday ? 'T' : dayLetter}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 pt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-400/30 border border-emerald-400/40" />
          <span className="text-[11px] text-muted-foreground">Practiced</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-muted/60" />
          <span className="text-[11px] text-muted-foreground">Missed</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="w-3 h-3 rounded-sm ring-2 ring-primary/60 ring-offset-background" />
          <span className="text-[11px] text-muted-foreground">Today</span>
        </div>
      </div>
    </div>
  );
}

export default StreakCalendar;
