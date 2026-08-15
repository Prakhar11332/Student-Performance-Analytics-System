import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Role = "student" | "teacher" | "admin";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  studentId?: string;
  program?: string;
  year?: string;
};

type Credential = SessionUser & { password: string; locked?: boolean };

/** Mock credential store — role is derived from the account, never picked by the user. */
const ACCOUNTS: Credential[] = [
  {
    id: "u-1",
    name: "Aarav Menon",
    email: "aarav.menon@student.univ.edu",
    password: "student123",
    role: "student",
    studentId: "S-2201",
    program: "B.Tech Computer Science",
    year: "Third year",
  },
  {
    id: "u-2",
    name: "Dr. Neha Raghavan",
    email: "n.raghavan@univ.edu",
    password: "teacher123",
    role: "teacher",
  },
  {
    id: "u-3",
    name: "Registry Admin",
    email: "admin@univ.edu",
    password: "admin123",
    role: "admin",
  },
  {
    id: "u-4",
    name: "Locked Account",
    email: "locked@univ.edu",
    password: "locked123",
    role: "student",
    locked: true,
  },
];

const STORAGE_KEY = "spas.session";

type AuthValue = {
  user: SessionUser | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<SessionUser>;
  signOut: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as SessionUser);
    } catch {
      /* ignore malformed session */
    }
    setReady(true);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 700));
    const account = ACCOUNTS.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    if (!account) throw new Error("No account found for that email address.");
    if (account.locked)
      throw new Error("This account is locked. Contact the examination office to unlock it.");
    if (account.password !== password) throw new Error("Incorrect password. Please try again.");

    const { password: _pw, locked: _locked, ...session } = account;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setUser(session);
    return session;
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, ready, signIn, signOut }), [user, ready, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function homeForRole(role: Role) {
  return role === "student" ? "/student" : "/teacher";
}
