"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiRequest } from "@/lib/api";

interface AuthState {
  email: string | null;
  token: string | null;
  /** True until the stored session (if any) has been read from localStorage. */
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const STORAGE_KEY = "pactforge.session";

const AuthContext = createContext<AuthState | null>(null);

function requestToken(path: string, email: string, password: string) {
  return apiRequest<{ token: string; email: string }>(path, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

type Session = { token: string; email: string };

export function AuthProvider({ children }: { children: ReactNode }) {
  // undefined = the stored session hasn't been read yet (localStorage is unavailable during SSR).
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const isLoading = session === undefined;

  useEffect(() => {
    let stored: Session | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) stored = JSON.parse(raw);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: restore the stored session on mount
    setSession(stored);
  }, []);

  const applySession = (next: Session | null) => {
    setSession(next);
    if (next) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const value: AuthState = {
    email: session?.email ?? null,
    token: session?.token ?? null,
    isLoading,
    signIn: async (email, password) => {
      applySession(await requestToken("/auth/login", email, password));
    },
    signUp: async (email, password) => {
      applySession(await requestToken("/auth/register", email, password));
    },
    signOut: () => applySession(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
