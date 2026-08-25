import { createContext, useContext, useEffect, useMemo, useState } from "react";
const Ctx = createContext(null);
const USERS_KEY = "atelier-users";
const SESSION_KEY = "atelier-session";
function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    /* ignore */
  }
}
function persistSession(session) {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}
export function AuthProvider({
  children
}) {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  // Client-only: localStorage isn't available during SSR, so we read it
  // after mount. `ready` stays false (and both server/client render the
  // same "not ready yet" output) until this runs, avoiding a hydration
  // mismatch.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setSession(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);
  const value = useMemo(() => ({
    session,
    ready,
    login: (email, password) => {
      const normalized = email.trim().toLowerCase();
      const user = loadUsers().find(u => u.email === normalized);
      if (!user || user.password !== password) {
        return {
          ok: false,
          error: "That email and password don't match any account."
        };
      }
      const next = {
        name: user.name,
        email: user.email
      };
      setSession(next);
      persistSession(next);
      return {
        ok: true
      };
    },
    signup: (name, email, password) => {
      const normalized = email.trim().toLowerCase();
      const users = loadUsers();
      if (users.some(u => u.email === normalized)) {
        return {
          ok: false,
          error: "An account with that email already exists — sign in instead."
        };
      }
      const user = {
        name: name.trim(),
        email: normalized,
        password
      };
      saveUsers([...users, user]);
      const next = {
        name: user.name,
        email: user.email
      };
      setSession(next);
      persistSession(next);
      return {
        ok: true
      };
    },
    logout: () => {
      setSession(null);
      persistSession(null);
    }
  }), [session, ready]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
