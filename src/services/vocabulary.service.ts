// ─── Vocabulary Service ────────────────────────────────────────────────────────
// Reads vocabulary words and manages per-user flashcards (SM-2 algorithm) via
// Supabase.  Falls back to SAMPLE_VOCABULARY constants when the DB is empty so
// the UI works during development without a live database.

import { supabase } from '../lib/supabase';
import { SAMPLE_VOCABULARY, SM2_DEFAULTS } from '../lib/constants';
import type { FlashCard, VocabularyWord } from '../types';

// ── Internal helpers ──────────────────────────────────────────────────────────

function handleError(error: unknown, context: string): never {
  const message = error instanceof Error ? error.message : String(error);
  throw new Error(`[vocabulary.service] ${context}: ${message}`);
}

function uuid(): string {
  // Use crypto.randomUUID if available (modern browsers/Node), else fallback
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

// ── Filters ───────────────────────────────────────────────────────────────────

export interface VocabularyFilters {
  category?: string;
  level?: string;
  search?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  limit?: number;
  offset?: number;
}

// ── Words ─────────────────────────────────────────────────────────────────────

/**
 * Fetches vocabulary words from Supabase, optionally filtered by category,
 * CEFR level, or a text search on word/definition.
 * Falls back to SAMPLE_VOCABULARY when the DB returns no rows.
 */
export async function getWords(
  filters: VocabularyFilters = {}
): Promise<VocabularyWord[]> {
  let query = supabase
    .from('vocabulary_words')
    .select('*')
    .order('word', { ascending: true });

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.level) {
    query = query.eq('level', filters.level);
  }

  if (filters.difficulty) {
    query = query.eq('difficulty', filters.difficulty);
  }

  if (filters.search && filters.search.trim().length > 0) {
    const term = `%${filters.search.trim()}%`;
    query = query.or(`word.ilike.${term},definition.ilike.${term}`);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if (filters.offset) {
    query = query.range(
      filters.offset,
      filters.offset + (filters.limit ?? 20) - 1
    );
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    // Apply the same filters to the local mock data
    let mock = [...SAMPLE_VOCABULARY];

    if (filters.category) {
      mock = mock.filter((w) => w.category === filters.category);
    }
    if (filters.level) {
      mock = mock.filter((w) => w.level === filters.level);
    }
    if (filters.difficulty) {
      mock = mock.filter((w) => w.difficulty === filters.difficulty);
    }
    if (filters.search) {
      const term = filters.search.toLowerCase();
      mock = mock.filter(
        (w) =>
          w.word.toLowerCase().includes(term) ||
          w.definition.toLowerCase().includes(term)
      );
    }

    const start = filters.offset ?? 0;
    const end = start + (filters.limit ?? mock.length);
    return mock.slice(start, end);
  }

  return data as unknown as VocabularyWord[];
}

/**
 * Returns a single vocabulary word by ID.
 * Checks SAMPLE_VOCABULARY as a fallback.
 */
export async function getWordById(wordId: string): Promise<VocabularyWord> {
  const { data, error } = await supabase
    .from('vocabulary_words')
    .select('*')
    .eq('id', wordId)
    .single();

  if (error || !data) {
    const mockWord = SAMPLE_VOCABULARY.find((w) => w.id === wordId);
    if (mockWord) return mockWord;
    handleError(error ?? new Error('Word not found'), `getWordById(${wordId})`);
  }

  return data as unknown as VocabularyWord;
}

// ── Flashcards ────────────────────────────────────────────────────────────────

/**
 * Returns all flashcards for the given user, ordered by next_review date.
 */
export async function getUserFlashcards(userId: string): Promise<FlashCard[]> {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('user_id', userId)
    .order('next_review', { ascending: true });

  if (error) {
    // Return empty list if table not yet set up
    return [];
  }

  return (data ?? []) as unknown as FlashCard[];
}

/**
 * Adds a vocabulary word to the user's flashcard deck.
 * Prevents duplicates — returns existing card if word already added.
 */
export async function addToFlashcards(
  userId: string,
  wordId: string
): Promise<FlashCard> {
  // Check for existing card
  const { data: existing } = await supabase
    .from('flashcards')
    .select('*')
    .eq('user_id', userId)
    .eq('word_id', wordId)
    .maybeSingle();

  if (existing) {
    return existing as unknown as FlashCard;
  }

  // Fetch the word to populate front/back
  const word = await getWordById(wordId);

  const newCard: Omit<FlashCard, 'created_at' | 'updated_at'> = {
    id: uuid(),
    user_id: userId,
    word_id: wordId,
    front: word.word,
    back: `${word.definition}\n\n${word.translation_uz}`,
    next_review: new Date().toISOString(),
    ease_factor: SM2_DEFAULTS.ease_factor,
    interval: SM2_DEFAULTS.interval,
    repetitions: SM2_DEFAULTS.repetitions,
  };

  const { data, error } = await supabase
    .from('flashcards')
    .insert(newCard as never)
    .select('*')
    .single();

  if (error) handleError(error, `addToFlashcards(${userId}, ${wordId})`);

  return data as unknown as FlashCard;
}

/**
 * Updates flashcard fields (e.g. after a review session with SM-2 data).
 */
export async function updateFlashcard(
  cardId: string,
  data: Partial<FlashCard>
): Promise<FlashCard> {
  // Strip read-only fields
  const { id: _id, user_id: _uid, word_id: _wid, created_at: _ca, ...updateData } =
    data as FlashCard;

  const { data: updated, error } = await supabase
    .from('flashcards')
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('id', cardId)
    .select('*')
    .single();

  if (error) handleError(error, `updateFlashcard(${cardId})`);

  return updated as unknown as FlashCard;
}

/**
 * Returns cards that are due for review (next_review <= now).
 */
export async function getWordsToReview(userId: string): Promise<FlashCard[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('user_id', userId)
    .lte('next_review', now)
    .order('next_review', { ascending: true });

  if (error) {
    return [];
  }

  return (data ?? []) as unknown as FlashCard[];
}

/**
 * Marks a word as learned by incrementing the user_progress.words_learned
 * counter and pushing the flashcard interval to 30 days.
 */
export async function markWordLearned(
  userId: string,
  wordId: string
): Promise<void> {
  // Push the flashcard far into the future so it won't appear in reviews
  const { data: card } = await supabase
    .from('flashcards')
    .select('id')
    .eq('user_id', userId)
    .eq('word_id', wordId)
    .maybeSingle();

  if (card && (card as { id?: string }).id) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    await supabase
      .from('flashcards')
      .update({
        interval: 30,
        next_review: futureDate.toISOString(),
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', (card as { id: string }).id);
  }

  // Increment words_learned in progress table
  const { data: progress } = await supabase
    .from('user_progress')
    .select('words_learned')
    .eq('user_id', userId)
    .single();

  const currentCount = (progress as { words_learned?: number } | null)?.words_learned ?? 0;

  await supabase
    .from('user_progress')
    .update({ words_learned: currentCount + 1 })
    .eq('user_id', userId);
}

// ── SM-2 Algorithm helper ─────────────────────────────────────────────────────

/**
 * Applies the SM-2 spaced repetition algorithm to a flashcard review.
 *
 * @param card    The current flashcard state
 * @param quality 0-5 (0=total blackout, 5=perfect response)
 * @returns       Partial<FlashCard> with updated SRS fields — pass to updateFlashcard
 */
export function calculateNextReview(
  card: FlashCard,
  quality: 0 | 1 | 2 | 3 | 4 | 5
): Pick<FlashCard, 'ease_factor' | 'interval' | 'repetitions' | 'next_review'> {
  let { ease_factor, interval, repetitions } = card;

  if (quality < 3) {
    // Failed review — reset
    repetitions = 0;
    interval = 1;
  } else {
    // Successful review
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ease_factor);
    }
    repetitions += 1;
  }

  // Update ease factor (stays between 1.3 and 2.5)
  ease_factor = Math.max(
    1.3,
    ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    ease_factor: Math.round(ease_factor * 100) / 100,
    interval,
    repetitions,
    next_review: nextReview.toISOString(),
  };
}
