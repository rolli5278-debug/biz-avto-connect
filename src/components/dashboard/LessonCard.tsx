import { motion } from 'framer-motion';
import {
  BookOpen, Mic, Headphones, PenLine, AlignLeft, Layers,
  CheckCircle2, Clock, Star, Lock, ChevronRight, Play,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Lesson, LessonType, CEFRLevel } from '@/types';

export interface LessonCardProps {
  lesson: Lesson;
  completed?: boolean;
  /** Score as a value 0–100 */
  score?: number;
  /** Progress 0–100 if partially complete */
  progress?: number;
  onClick: () => void;
  className?: string;
  /** Compact variant for sidebar / dashboard preview */
  compact?: boolean;
}

// ── Type → Icon & Color ────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<LessonType, {
  icon: typeof BookOpen;
  emoji: string;
  bg: string;
  text: string;
  label: string;
}> = {
  grammar: {
    icon: AlignLeft,
    emoji: '📝',
    bg: 'bg-blue-100 dark:bg-blue-950/60',
    text: 'text-blue-600 dark:text-blue-400',
    label: 'Grammar',
  },
  vocabulary: {
    icon: Layers,
    emoji: '📚',
    bg: 'bg-violet-100 dark:bg-violet-950/60',
    text: 'text-violet-600 dark:text-violet-400',
    label: 'Vocabulary',
  },
  speaking: {
    icon: Mic,
    emoji: '🎤',
    bg: 'bg-rose-100 dark:bg-rose-950/60',
    text: 'text-rose-600 dark:text-rose-400',
    label: 'Speaking',
  },
  listening: {
    icon: Headphones,
    emoji: '🎧',
    bg: 'bg-amber-100 dark:bg-amber-950/60',
    text: 'text-amber-600 dark:text-amber-400',
    label: 'Listening',
  },
  reading: {
    icon: BookOpen,
    emoji: '📖',
    bg: 'bg-emerald-100 dark:bg-emerald-950/60',
    text: 'text-emerald-600 dark:text-emerald-400',
    label: 'Reading',
  },
  writing: {
    icon: PenLine,
    emoji: '✍️',
    bg: 'bg-indigo-100 dark:bg-indigo-950/60',
    text: 'text-indigo-600 dark:text-indigo-400',
    label: 'Writing',
  },
};

const LEVEL_BADGE: Record<CEFRLevel, string> = {
  A1: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  A2: 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300',
  B1: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
  B2: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300',
  C1: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
  C2: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
};

function ScoreDots({ score }: { score: number }) {
  const filled = Math.round((score / 100) * 5);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-3 w-3',
            i < filled ? 'fill-amber-400 text-amber-400' : 'fill-none text-muted-foreground/30',
          )}
        />
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function LessonCard({
  lesson,
  completed = false,
  score,
  progress,
  onClick,
  className,
  compact = false,
}: LessonCardProps) {
  const typeConfig = TYPE_CONFIG[lesson.type] ?? TYPE_CONFIG.grammar;
  const TypeIcon = typeConfig.icon;
  const levelBadgeClass = LEVEL_BADGE[lesson.level] ?? 'bg-gray-100 text-gray-700';
  const isPartial = !completed && (progress ?? 0) > 0;
  const buttonLabel = completed ? 'Review' : isPartial ? 'Continue' : 'Start';

  if (compact) {
    return (
      <motion.div
        whileHover={{ x: 3 }}
        transition={{ duration: 0.18 }}
        onClick={onClick}
        className={cn(
          'flex items-center gap-3 p-3 rounded-xl cursor-pointer',
          'hover:bg-accent/50 transition-colors group',
          className,
        )}
      >
        {/* Icon */}
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg',
          typeConfig.bg,
        )}>
          {typeConfig.emoji}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{lesson.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn('text-[11px] font-medium', typeConfig.text)}>{typeConfig.label}</span>
            <span className="text-muted-foreground/40 text-[11px]">·</span>
            <span className="text-[11px] text-muted-foreground">{lesson.duration_minutes} min</span>
          </div>
        </div>

        {/* Status */}
        <div className="flex-shrink-0">
          {completed ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={cn('group', className)}
    >
      <Card className="relative overflow-hidden border-border/60 shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
        {/* Completed overlay gradient */}
        {completed && (
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at top right, rgba(16,185,129,0.05) 0%, transparent 60%)' }}
          />
        )}

        {/* Premium lock badge */}
        {lesson.is_premium && (
          <div className="absolute top-3 right-3 z-10">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">
              <Lock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
              <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">PRO</span>
            </div>
          </div>
        )}

        <CardContent className="p-5" onClick={onClick}>
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            {/* Emoji thumbnail */}
            <div className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0',
              'transition-transform duration-200 group-hover:scale-105',
              typeConfig.bg,
            )}>
              {typeConfig.emoji}
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={cn(
                  'inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full',
                  levelBadgeClass,
                )}>
                  {lesson.level}
                </span>
                <span className={cn(
                  'inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full',
                  typeConfig.bg, typeConfig.text,
                )}>
                  <TypeIcon className="h-3 w-3" />
                  {typeConfig.label}
                </span>
              </div>
              <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {lesson.title}
              </h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
            {lesson.description}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{lesson.duration_minutes} min</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span>+{lesson.xp_reward} XP</span>
            </div>
            {completed && score !== undefined && (
              <div className="ml-auto">
                <ScoreDots score={score} />
              </div>
            )}
          </div>

          {/* Progress bar (if partially complete) */}
          {isPartial && (
            <div className="mb-3 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-2 pt-1 border-t border-border/40">
            {completed ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  Completed{score !== undefined ? ` · ${score}%` : ''}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto h-7 text-xs px-3 text-muted-foreground hover:text-foreground"
                  onClick={(e) => { e.stopPropagation(); onClick(); }}
                >
                  Review
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                className={cn(
                  'ml-auto h-8 text-xs px-4 gap-1.5 font-semibold',
                  'group-hover:shadow-md transition-shadow',
                )}
                onClick={(e) => { e.stopPropagation(); onClick(); }}
              >
                {isPartial ? (
                  <><ChevronRight className="h-3.5 w-3.5" />{buttonLabel}</>
                ) : (
                  <><Play className="h-3 w-3 fill-current" />{buttonLabel}</>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default LessonCard;
