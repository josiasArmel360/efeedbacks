import { create } from "zustand";

import type { User } from "@/lib/types";

export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated";

export interface AuthState {
  user: User | null;
  status: AuthStatus;
  setUser: (user: User | null) => void;
  setStatus: (status: AuthStatus) => void;
  updateUser: (patch: Partial<User>) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",

  setUser: (user) =>
    set({ user, status: user ? "authenticated" : "unauthenticated" }),

  setStatus: (status) => set({ status }),

  updateUser: (patch) =>
    set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),

  reset: () => set({ user: null, status: "unauthenticated" }),
}));

