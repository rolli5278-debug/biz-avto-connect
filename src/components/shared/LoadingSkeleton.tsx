import { cn } from '@/lib/utils';

// ─── Primitive ─────────────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted/60 dark:bg-muted/40',
        className
      )}
    />
  );
}

// ─── Card Skeleton ──────────────────────────────────────────────────────────────

export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/60 bg-card p-5 space-y-4 shadow-sm',
        className
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/5 rounded-full" />
          <Skeleton className="h-3 w-2/5 rounded-full" />
        </div>
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
      {/* Body lines */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-3 w-5/6 rounded-full" />
        <Skeleton className="h-3 w-4/6 rounded-full" />
      </div>
      {/* Footer */}
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-8 flex-1 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

// ─── Lesson Card Skeleton ───────────────────────────────────────────────────────

export function LessonCardSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm',
        className
      )}
    >
      {/* Thumbnail */}
      <Skeleton className="w-full h-36 rounded-none" />
      <div className="p-4 space-y-3">
        {/* Tags */}
        <div className="flex gap-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>
        {/* Title */}
        <Skeleton className="h-5 w-4/5 rounded-full" />
        <Skeleton className="h-4 w-3/5 rounded-full" />
        {/* Meta row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
          <Skeleton className="h-4 w-14 rounded-full" />
        </div>
        {/* Progress bar */}
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
    </div>
  );
}

// ─── Profile Skeleton ───────────────────────────────────────────────────────────

export function ProfileSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Avatar + info */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-6 rounded-2xl border border-border/60 bg-card shadow-sm">
        <Skeleton className="w-24 h-24 rounded-full shrink-0" />
        <div className="flex-1 space-y-3 w-full">
          <Skeleton className="h-6 w-48 rounded-full" />
          <Skeleton className="h-4 w-36 rounded-full" />
          <div className="flex gap-2 flex-wrap">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-2.5 w-full rounded-full" />
        </div>
        <Skeleton className="w-24 h-9 rounded-xl shrink-0" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/60 bg-card p-4 flex flex-col items-center gap-2"
          >
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-6 w-14 rounded-full" />
            <Skeleton className="h-3 w-16 rounded-full" />
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-36 rounded-full" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-card"
          >
            <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4 rounded-full" />
              <Skeleton className="h-3 w-1/3 rounded-full" />
            </div>
            <Skeleton className="w-12 h-5 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Leaderboard Skeleton ───────────────────────────────────────────────────────

export function LeaderboardSkeleton({ rows = 10, className }: SkeletonProps & { rows?: number }) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Header tabs */}
      <div className="flex gap-2 mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-xl" />
        ))}
      </div>

      {/* Top 3 podium */}
      <div className="flex items-end justify-center gap-3 pb-4">
        {[80, 96, 72].map((h, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="w-12 h-12 rounded-full" />
            <Skeleton className={`w-20 rounded-t-lg`} style={{ height: h }} />
          </div>
        ))}
      </div>

      {/* Row list */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/60 bg-card"
          style={{ opacity: 1 - i * 0.04 }}
        >
          <Skeleton className="w-6 h-6 rounded-full shrink-0" />
          <Skeleton className="w-9 h-9 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-28 rounded-full" />
            <Skeleton className="h-3 w-16 rounded-full" />
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-3 w-12 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Chat Message Skeleton ──────────────────────────────────────────────────────

export function ChatMessageSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('space-y-4 p-4', className)}>
      {/* Assistant message */}
      <div className="flex gap-3 items-start">
        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
        <div className="flex-1 space-y-2 max-w-[70%]">
          <Skeleton className="h-4 w-full rounded-2xl rounded-tl-none" />
          <Skeleton className="h-4 w-5/6 rounded-2xl" />
          <Skeleton className="h-4 w-4/6 rounded-2xl" />
        </div>
      </div>

      {/* User message */}
      <div className="flex gap-3 items-start flex-row-reverse">
        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
        <div className="flex-1 flex flex-col items-end space-y-2 max-w-[60%]">
          <Skeleton className="h-4 w-48 rounded-2xl rounded-tr-none" />
          <Skeleton className="h-4 w-36 rounded-2xl" />
        </div>
      </div>

      {/* Assistant message with grammar note */}
      <div className="flex gap-3 items-start">
        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
        <div className="flex-1 space-y-2 max-w-[75%]">
          <Skeleton className="h-4 w-full rounded-2xl rounded-tl-none" />
          <Skeleton className="h-4 w-3/4 rounded-2xl" />
          {/* Grammar correction block */}
          <Skeleton className="h-16 w-full rounded-xl mt-2" />
        </div>
      </div>

      {/* Typing indicator */}
      <div className="flex gap-3 items-start">
        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
        <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-none bg-muted/50 w-fit">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
