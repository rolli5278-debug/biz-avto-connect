import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookmarkPlus, Share2, Volume2, CheckCircle2, Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { VocabularyWord } from '@/types';

export interface WordOfTheDayProps {
  word: VocabularyWord;
  onAddToFlashcards?: (word: VocabularyWord) => void;
  className?: string;
}

const PART_OF_SPEECH_COLORS: Record<string, { bg: string; text: string }> = {
  noun:      { bg: 'bg-blue-100 dark:bg-blue-950/60',   text: 'text-blue-700 dark:text-blue-300' },
  verb:      { bg: 'bg-rose-100 dark:bg-rose-950/60',   text: 'text-rose-700 dark:text-rose-300' },
  adjective: { bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-300' },
  adverb:    { bg: 'bg-violet-100 dark:bg-violet-950/60', text: 'text-violet-700 dark:text-violet-300' },
  phrase:    { bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300' },
};

function getPosColor(category: string) {
  const key = category.toLowerCase();
  return PART_OF_SPEECH_COLORS[key] ?? {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
  };
}

export function WordOfTheDay({ word, onAddToFlashcards, className }: WordOfTheDayProps) {
  const [added, setAdded] = useState(false);
  const posColor = getPosColor(word.category);

  const handleAdd = () => {
    if (added) return;
    setAdded(true);
    onAddToFlashcards?.(word);
    toast.success(`"${word.word}" added to your flashcards!`);
  };

  const handleShare = async () => {
    const text = `Word of the Day: "${word.word}" — ${word.definition}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Word of the Day', text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
      }
    } catch {
      toast.error('Could not share');
    }
  };

  const handleAudio = () => {
    if (word.audio_url) {
      const a = new Audio(word.audio_url);
      a.play().catch(() => null);
    } else if ('speechSynthesis' in window) {
      const utt = new SpeechSynthesisUtterance(word.word);
      utt.lang = 'en-US';
      utt.rate = 0.85;
      window.speechSynthesis.speak(utt);
    } else {
      toast.info('Audio not available');
    }
  };

  // Highlight the word in the example sentence
  const highlightWord = (sentence: string, w: string) => {
    const regex = new RegExp(`(${w})`, 'gi');
    const parts = sentence.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="font-semibold text-primary underline decoration-dotted">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={className}
    >
      <Card className="relative overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-shadow duration-300">
        {/* Background decoration */}
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.04] pointer-events-none -translate-y-1/3 translate-x-1/3"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }}
        />

        <CardContent className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-violet-500" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Word of the Day
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={handleAudio}
                aria-label="Pronounce word"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={handleShare}
                aria-label="Share word"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Word & POS */}
          <div className="space-y-1.5">
            <div className="flex items-end gap-3 flex-wrap">
              <motion.h2
                key={word.word}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-bold tracking-tight text-foreground"
              >
                {word.word}
              </motion.h2>
              {word.pronunciation && (
                <span className="text-muted-foreground text-sm pb-1 font-mono">
                  /{word.pronunciation}/
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                'text-xs font-semibold px-2.5 py-0.5 rounded-full',
                posColor.bg, posColor.text,
              )}>
                {word.category}
              </span>
              <span className={cn(
                'text-xs font-medium px-2.5 py-0.5 rounded-full',
                word.difficulty === 'easy'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : word.difficulty === 'medium'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400',
              )}>
                {word.difficulty}
              </span>
              {word.level && (
                <span className="text-xs text-muted-foreground font-medium">
                  {word.level}
                </span>
              )}
            </div>
          </div>

          {/* Definition */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Definition</p>
            <p className="text-sm leading-relaxed text-foreground">
              {word.definition}
            </p>
          </div>

          {/* Uzbek translation */}
          <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-muted/40 border border-border/50">
            <span className="text-lg leading-none flex-shrink-0">🇺🇿</span>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium mb-0.5">O'zbek tarjimasi</p>
              <p className="text-sm font-semibold">{word.translation_uz}</p>
            </div>
          </div>

          {/* Example sentence */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Example</p>
            <p className="text-sm text-muted-foreground leading-relaxed italic">
              "{highlightWord(word.example_sentence, word.word)}"
            </p>
          </div>

          {/* Synonyms */}
          {word.synonyms && word.synonyms.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground font-medium">Synonyms:</span>
              {word.synonyms.slice(0, 3).map((syn) => (
                <span
                  key={syn}
                  className="text-xs px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/50"
                >
                  {syn}
                </span>
              ))}
            </div>
          )}

          {/* Add to Flashcards button */}
          <Button
            className={cn(
              'w-full h-9 gap-2 text-sm font-medium transition-all duration-200',
              added && 'bg-emerald-500 hover:bg-emerald-600',
            )}
            onClick={handleAdd}
            disabled={added}
          >
            <AnimatePresence mode="wait">
              {added ? (
                <motion.span
                  key="added"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Added to Flashcards
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2"
                >
                  <BookmarkPlus className="h-4 w-4" />
                  Add to Flashcards
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default WordOfTheDay;
