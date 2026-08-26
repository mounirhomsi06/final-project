// Client-side auth: a localStorage user list + session, matching the
// original app's behaviour (including blocking duplicate emails on signup).
// This is a front-end demo only — there is no real backend, so passwords
// are stored as plain text in the browser. Don't reuse a real password here.

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
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function login(email, password) {
  const normalized = email.trim().toLowerCase();
  const user = loadUsers().find((u) => u.email === normalized);
  if (!user || user.password !== password) {
    return { ok: false, error: "That email and password don't match any account." };
  }
  const session = { name: user.name, email: user.email };
  persistSession(session);
  return { ok: true, session };
}

export function signup(name, email, password) {
  const normalized = email.trim().toLowerCase();
  const users = loadUsers();
  if (users.some((u) => u.email === normalized)) {
    return { ok: false, error: "An account with that email already exists — sign in instead." };
  }
  const user = { name: name.trim(), email: normalized, password };
  saveUsers([...users, user]);
  const session = { name: user.name, email: user.email };
  persistSession(session);
  return { ok: true, session };
}

export function logout() {
  persistSession(null);
}
