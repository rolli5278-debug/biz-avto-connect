import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type Role = "admin" | "seller";

type AuthState = {
  loading: boolean;
  userId: string | null;
  email: string | null;
  role: Role | null;
};

const AuthCtx = createContext<AuthState>({ loading: true, userId: null, email: null, role: null });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ loading: true, userId: null, email: null, role: null });

  useEffect(() => {
    let alive = true;

    async function load() {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!alive) return;

      if (!session?.user) {
        setState({ loading: false, userId: null, email: null, role: null });
        return;
      }

      const user = session.user;

      const { data: prof } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      setState({
        loading: false,
        userId: user.id,
        email: user.email ?? null,
        role: (prof?.role as Role) ?? "seller",
      });
    }

    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => state, [state]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
