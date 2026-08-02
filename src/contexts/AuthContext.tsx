import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { isGokapitalEmail, normalizeEmail } from "@/lib/emailValidation";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  accessDenied: string | null;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updatePassword: (password: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setAccessDenied(null); return; }
    const email = normalizeEmail(user.email ?? "");
    if (!isGokapitalEmail(email)) {
      void supabase.auth.signOut();
      setSession(null); setUser(null); setAccessDenied("domain"); return;
    }
    if (!user.email_confirmed_at) { setAccessDenied("unverified"); return; }
    setAccessDenied(null);
  }, [user]);

  const value: AuthContextValue = {
    session, user, loading, accessDenied,
    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email: normalizeEmail(email), password });
      return error ? { error: error.message } : {};
    },
    signUp: async (email, password) => {
      const normalized = normalizeEmail(email);
      if (!isGokapitalEmail(normalized)) return { error: "domain" };
      const { error } = await supabase.auth.signUp({ email: normalized, password });
      return error ? { error: error.message } : {};
    },
    signOut: async () => { await supabase.auth.signOut(); setSession(null); setUser(null); },
    resendConfirmation: async (email) => {
      const { error } = await supabase.auth.resend({ type: "signup", email: normalizeEmail(email) });
      return error ? { error: error.message } : {};
    },
    resetPassword: async (email) => {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizeEmail(email), {
        redirectTo: window.location.origin + "/auth/reset-password",
      });
      return error ? { error: error.message } : {};
    },
    updatePassword: async (password) => {
      const { error } = await supabase.auth.updateUser({ password });
      return error ? { error: error.message } : {};
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};