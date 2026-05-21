// ─── Core domain types for the AI English Learning Platform ───────────────────

// ── User & Auth ───────────────────────────────────────────────────────────────

export type SubscriptionType = 'free' | 'pro' | 'premium';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  /** CEFR level: A1 – C2 */
  level: CEFRLevel;
  xp: number;
  streak: number;
  created_at: string;
  subscription_type: SubscriptionType;
}

export interface UserProgress {
  user_id: string;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  lessons_completed: number;
  words_learned: number;
  minutes_practiced: number;
}

// ── Levels ────────────────────────────────────────────────────────────────────

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

// ── Lessons ───────────────────────────────────────────────────────────────────

export type LessonType =
  | 'grammar'
  | 'vocabulary'
  | 'speaking'
  | 'listening'
  | 'reading'
  | 'writing';

export interface LessonContent {
  /** Main instructional text / markdown */
  body: string;
  /** Optional embedded media URL */
  media_url?: string;
  /** Optional transcript for audio/video */
  transcript?: string;
  /** Key vocabulary highlighted in the lesson */
  key_vocabulary?: string[];
  /** Grammar rules explained in the lesson */
  grammar_points?: string[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: CEFRLevel;
  type: LessonType;
  duration_minutes: number;
  xp_reward: number;
  content: LessonContent;
  created_at: string;
  /** Optional thumbnail image URL */
  thumbnail_url?: string;
  /** Whether the lesson is locked behind a subscription */
  is_premium?: boolean;
  /** Tags for filtering / search */
  tags?: string[];
}

export interface UserLesson {
  lesson: Lesson;
  completed: boolean;
  score?: number;
  completed_at?: string;
}

// ── Vocabulary ────────────────────────────────────────────────────────────────

export type WordDifficulty = 'easy' | 'medium' | 'hard';

export interface VocabularyWord {
  id: string;
  word: string;
  definition: string;
  example_sentence: string;
  translation_uz: string;
  pronunciation: string;
  audio_url: string | null;
  category: string;
  difficulty: WordDifficulty;
  /** CEFR level recommendation */
  level?: CEFRLevel;
  /** Related words */
  synonyms?: string[];
  antonyms?: string[];
}

// ── Spaced Repetition / Flash Cards ──────────────────────────────────────────

export interface FlashCard {
  id: string;
  user_id: string;
  word_id: string;
  front: string;
  back: string;
  /** ISO timestamp for the next scheduled review */
  next_review: string;
  /** SM-2 ease factor (default 2.5) */
  ease_factor: number;
  /** Current review interval in days */
  interval: number;
  /** Number of successful repetitions */
  repetitions: number;
  created_at?: string;
  updated_at?: string;
}

// ── Chat / AI Tutor ───────────────────────────────────────────────────────────

export type ChatMessageRole = 'user' | 'assistant';
export type ChatMessageType = 'text' | 'grammar_correction' | 'vocab_tip';

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  created_at: string;
  type: ChatMessageType;
  /** Optional metadata, e.g. corrections or suggested words */
  metadata?: Record<string, unknown>;
}

export interface GrammarError {
  /** Original text fragment containing the error */
  original: string;
  /** Corrected replacement */
  corrected: string;
  /** Error category, e.g. "subject-verb agreement" */
  type: string;
  explanation: string;
  /** Character offset in the original string */
  offset?: number;
  /** Length of the error span */
  length?: number;
}

// ── Quizzes ───────────────────────────────────────────────────────────────────

export type QuizType =
  | 'multiple_choice'
  | 'fill_blank'
  | 'listening'
  | 'speaking';

export interface QuizQuestion {
  id: string;
  question: string;
  /** Options only for multiple_choice questions */
  options?: string[];
  correct_answer: string;
  explanation: string;
  points: number;
  /** Optional hint shown after a wrong answer */
  hint?: string;
  /** Optional media URL for listening questions */
  audio_url?: string;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  questions: QuizQuestion[];
  type: QuizType;
  /** Total achievable points */
  total_points?: number;
  /** Time limit in seconds (0 = unlimited) */
  time_limit?: number;
}

export interface QuizAttempt {
  quiz_id: string;
  user_id: string;
  answers: Record<string, string>;
  score: number;
  percentage: number;
  completed_at: string;
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url: string | null;
  xp: number;
  streak: number;
  country: string;
}

// ── Subscriptions ─────────────────────────────────────────────────────────────

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  is_popular: boolean;
  /** Badge text, e.g. "Best Value" */
  badge?: string;
  /** Number of AI messages per day (null = unlimited) */
  ai_messages_per_day: number | null;
  max_flashcards: number | null;
}

// ── Achievements ──────────────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  /** The condition key used to evaluate whether the achievement is earned */
  condition: string;
  /** Optional numeric threshold paired with the condition */
  threshold?: number;
  /** Rarity: affects display colour */
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  earned_at: string;
}

// ── Speaking ──────────────────────────────────────────────────────────────────

export interface SpeakingSession {
  id: string;
  user_id: string;
  topic: string;
  /** Duration in seconds */
  duration: number;
  /** Score out of 100 */
  score: number;
  feedback: string;
  created_at: string;
  /** Optional recording URL */
  audio_url?: string;
  /** Detailed rubric breakdown */
  rubric?: {
    fluency: number;
    pronunciation: number;
    vocabulary: number;
    grammar: number;
  };
}

// ── IELTS Practice ────────────────────────────────────────────────────────────

export type IELTSSkill = 'reading' | 'writing' | 'speaking' | 'listening';

export interface IELTSPractice {
  id: string;
  type: IELTSSkill;
  /** Sub-section label, e.g. "Task 1", "Part 2", "Passage A" */
  section: string;
  difficulty: WordDifficulty;
  content: string;
  /** Model answers or answer keys */
  answers: string[];
  /** Estimated band score range */
  band_range?: string;
  /** Time allowed in minutes */
  time_allowed?: number;
  /** Word count requirement for writing tasks */
  word_count?: number;
}

export interface IELTSFeedback {
  score: number;
  band: number;
  feedback: string;
  suggestions: string[];
  /** Per-criterion scores (Task Achievement, Coherence, Lexical Resource, Grammar) */
  criteria?: Record<string, number>;
}

// ── Navigation ────────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  /** Whether the route requires Pro or Premium subscription */
  requiresPro?: boolean;
  /** Badge count, e.g. for notifications */
  badge?: number;
}

// ── Daily Goal ────────────────────────────────────────────────────────────────

export interface DailyGoal {
  label: string;
  minutes: number;
  xp_per_day: number;
}
