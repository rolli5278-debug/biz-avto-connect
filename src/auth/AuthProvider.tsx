import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types';

// ── Context shape ─────────────────────────────────────────────────────────────

interface AuthState {
  loading: boolean;
  session: Session | null;
  supabaseUser: SupabaseUser | null;
  /** Enriched user profile from public.users table */
  user: User | null;
}

interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthCtx = createContext<AuthContextValue>({
  loading: true,
  session: null,
  supabaseUser: null,
  user: null,
  signOut: async () => {},
  refreshUser: async () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    loading: true,
    session: null,
    supabaseUser: null,
    user: null,
  });

  async function loadProfile(supabaseUser: SupabaseUser): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .maybeSingle();

    if (error || !data) {
      // Return a minimal user object from supabase auth data while profile loads
      return {
        id: supabaseUser.id,
        email: supabaseUser.email ?? '',
        name: supabaseUser.user_metadata?.full_name ?? supabaseUser.email?.split('@')[0] ?? 'Learner',
        avatar_url: supabaseUser.user_metadata?.avatar_url ?? null,
        level: 'A1',
        xp: 0,
        streak: 0,
        created_at: supabaseUser.created_at,
        subscription_type: 'free',
      };
    }

    return data as User;
  }

  async function hydrate(session: Session | null) {
    if (!session?.user) {
      setState({ loading: false, session: null, supabaseUser: null, user: null });
      return;
    }

    const profile = await loadProfile(session.user);
    setState({
      loading: false,
      session,
      supabaseUser: session.user,
      user: profile,
    });
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) hydrate(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) hydrate(session);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setState({ loading: false, session: null, supabaseUser: null, user: null });
  };

  const refreshUser = async () => {
    const { data } = await supabase.auth.getSession();
    await hydrate(data.session);
  };

  const value = useMemo(
    () => ({ ...state, signOut, refreshUser }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth() {
  return useContext(AuthCtx);
}
