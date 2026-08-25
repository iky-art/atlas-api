// src/lib/auth.ts
// Helper autentikasi. Session token disimpan di localStorage supaya user
// tetap login setelah reload — wajar untuk app produksi (beda dari sandbox
// artifact yang melarang localStorage).

const SESSION_KEY = "atlas_session_token";

export interface AuthUser {
  email: string;
  plan: string;
  planName?: string;
  weeklyLimit?: number;
}

export function getStoredSession(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function storeSession(token: string) {
  try {
    localStorage.setItem(SESSION_KEY, token);
  } catch {
    // localStorage bisa diblokir (mode privat dsb) — user tetap bisa pakai
    // app dalam sesi berjalan, hanya tidak persist setelah reload.
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // no-op
  }
}

async function parseAuthResponse(res: Response): Promise<{ sessionToken: string; email: string; plan: string }> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((body as { error?: string }).error || "Terjadi kesalahan.");
  }
  return body as { sessionToken: string; email: string; plan: string };
}

export async function register(email: string, password: string): Promise<AuthUser> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await parseAuthResponse(res);
  storeSession(data.sessionToken);
  return { email: data.email, plan: data.plan };
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await parseAuthResponse(res);
  storeSession(data.sessionToken);
  return { email: data.email, plan: data.plan };
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const token = getStoredSession();
  if (!token) return null;

  try {
    const res = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      clearSession();
      return null;
    }
    return (await res.json()) as AuthUser;
  } catch {
    return null;
  }
}

export function logout() {
  clearSession();
}
