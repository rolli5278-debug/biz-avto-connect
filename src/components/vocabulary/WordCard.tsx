import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Heart, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { VocabularyWord } from '@/types';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface WordCardProps {
  word: VocabularyWord;
  isSaved?: boolean;
  mastery?: number; // 0-5
  onSave?: () => void;
  showBack?: boolean;
}

// ─── Mastery stars ────────────────────────────────────────────────────────────

function MasteryStars({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'w-3 h-3',
            i < level ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'
          )}
        />
      ))}
    </div>
  );
}

// ─── Difficulty badge colours ─────────────────────────────────────────────────

const DIFF_STYLES = {
  easy: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  hard: 'bg-red-100 text-red-700 border-red-200',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function WordCard({ word, isSaved = false, mastery = 0, onSave, showBack = false }: WordCardProps) {
  const [flipped, setFlipped] = useState(showBack);
  const [saved, setSaved] = useState(isSaved);
  const [playingAudio, setPlayingAudio] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved((v) => !v);
    onSave?.();
  };

  const handleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPlayingAudio(true);
    // UI only — simulate playback
    setTimeout(() => setPlayingAudio(false), 1200);
  };

  return (
    <div
      className="relative cursor-pointer select-none"
      style={{ perspective: '1000px', height: 220 }}
      onClick={() => setFlipped((v) => !v)}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* ── FRONT ────────────────────────────────────────── */}
        <div
          className="absolute inset-0 rounded-2xl border border-slate-200 bg-white shadow-sm p-5 flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Top row */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <Badge
                variant="outline"
                className={cn('text-[10px] px-2 py-0.5 capitalize w-fit', DIFF_STYLES[word.difficulty])}
              >
                {word.difficulty}
              </Badge>
              {word.level && (
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 w-fit bg-indigo-100 text-indigo-700 border-indigo-200">
                  {word.level}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleAudio}
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center transition-colors',
                  playingAudio
                    ? 'bg-violet-100 text-violet-600'
                    : 'bg-slate-100 text-slate-500 hover:bg-violet-50 hover:text-violet-500'
                )}
                title="Play pronunciation"
              >
                <Volume2 className={cn('w-3.5 h-3.5', playingAudio && 'animate-pulse')} />
              </button>
              <button
                onClick={handleSave}
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center transition-colors',
                  saved
                    ? 'bg-rose-100 text-rose-500'
                    : 'bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-400'
                )}
                title={saved ? 'Remove from flashcards' : 'Add to flashcards'}
              >
                <Heart className={cn('w-3.5 h-3.5', saved && 'fill-rose-500')} />
              </button>
            </div>
          </div>

          {/* Word + phonetic */}
          <div className="text-center">
            <h3 className="text-3xl font-bold text-slate-800 mb-1">{word.word}</h3>
            <p className="text-sm text-slate-400 font-mono">{word.pronunciation}</p>
            <p className="text-xs text-slate-400 mt-2">Tap to reveal definition</p>
          </div>

          {/* Mastery + category */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 capitalize bg-slate-50 text-slate-500">
              {word.category}
            </Badge>
            <MasteryStars level={mastery} />
          </div>
        </div>

        {/* ── BACK ─────────────────────────────────────────── */}
        <div
          className="absolute inset-0 rounded-2xl border border-indigo-200 bg-gradient-to-br from-violet-50 to-indigo-50 shadow-sm p-5 flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {/* Part of speech */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-[10px] capitalize bg-violet-100 text-violet-700 border-violet-200">
              {word.category}
            </Badge>
            <span className="text-[10px] text-slate-400 font-mono">{word.pronunciation}</span>
          </div>

          {/* Definition */}
          <div className="space-y-2">
            <p className="text-sm text-slate-700 font-medium leading-snug">{word.definition}</p>
            <p className="text-xs text-slate-500 italic">"{word.example_sentence}"</p>
          </div>

          {/* Uzbek translation */}
          <div className="flex items-center gap-2 bg-white/60 rounded-xl px-3 py-2 border border-indigo-100">
            <span className="text-base">🇺🇿</span>
            <span className="text-sm text-amber-800 font-medium">{word.translation_uz}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
