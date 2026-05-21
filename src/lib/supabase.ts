import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ─── Database type stub ────────────────────────────────────────────────────────
// Replace the inner table definitions with the output of `supabase gen types`
// once your schema is finalised.

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          level: string;
          xp: number;
          streak: number;
          created_at: string;
          subscription_type: 'free' | 'pro' | 'premium';
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      user_progress: {
        Row: {
          user_id: string;
          total_xp: number;
          current_streak: number;
          longest_streak: number;
          lessons_completed: number;
          words_learned: number;
          minutes_practiced: number;
        };
        Insert: Database['public']['Tables']['user_progress']['Row'];
        Update: Partial<Database['public']['Tables']['user_progress']['Row']>;
      };
      lessons: {
        Row: {
          id: string;
          title: string;
          description: string;
          level: string;
          type: string;
          duration_minutes: number;
          xp_reward: number;
          content: Record<string, unknown>;
          created_at: string;
          thumbnail_url: string | null;
          is_premium: boolean;
          tags: string[] | null;
        };
        Insert: Omit<Database['public']['Tables']['lessons']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['lessons']['Insert']>;
      };
      user_lessons: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          completed: boolean;
          score: number | null;
          completed_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['user_lessons']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['user_lessons']['Insert']>;
      };
      vocabulary_words: {
        Row: {
          id: string;
          word: string;
          definition: string;
          example_sentence: string;
          translation_uz: string;
          pronunciation: string;
          audio_url: string | null;
          category: string;
          difficulty: 'easy' | 'medium' | 'hard';
          level: string | null;
          synonyms: string[] | null;
          antonyms: string[] | null;
        };
        Insert: Omit<Database['public']['Tables']['vocabulary_words']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['vocabulary_words']['Insert']>;
      };
      flashcards: {
        Row: {
          id: string;
          user_id: string;
          word_id: string;
          front: string;
          back: string;
          next_review: string;
          ease_factor: number;
          interval: number;
          repetitions: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['flashcards']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['flashcards']['Insert']>;
      };
      achievements: {
        Row: {
          id: string;
          title: string;
          description: string;
          icon: string;
          xp_reward: number;
          condition: string;
          threshold: number | null;
          rarity: 'common' | 'rare' | 'epic' | 'legendary' | null;
        };
        Insert: Omit<Database['public']['Tables']['achievements']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['achievements']['Insert']>;
      };
      user_achievements: {
        Row: {
          user_id: string;
          achievement_id: string;
          earned_at: string;
        };
        Insert: Database['public']['Tables']['user_achievements']['Row'];
        Update: Partial<Database['public']['Tables']['user_achievements']['Row']>;
      };
      speaking_sessions: {
        Row: {
          id: string;
          user_id: string;
          topic: string;
          duration: number;
          score: number;
          feedback: string;
          created_at: string;
          audio_url: string | null;
        };
        Insert: Omit<Database['public']['Tables']['speaking_sessions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['speaking_sessions']['Insert']>;
      };
      ielts_practices: {
        Row: {
          id: string;
          type: 'reading' | 'writing' | 'speaking' | 'listening';
          section: string;
          difficulty: 'easy' | 'medium' | 'hard';
          content: string;
          answers: string[];
          band_range: string | null;
          time_allowed: number | null;
          word_count: number | null;
        };
        Insert: Omit<Database['public']['Tables']['ielts_practices']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['ielts_practices']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// ─── Environment variables ─────────────────────────────────────────────────────

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables.\n' +
      'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

// ─── Typed Supabase client ─────────────────────────────────────────────────────

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'x-app-name': 'english-learning-platform',
      },
    },
  }
);

// ─── Re-export helper types for consumer convenience ──────────────────────────

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
