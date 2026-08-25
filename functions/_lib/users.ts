// functions/_lib/users.ts
// User & session sederhana untuk v1. Password di-hash pakai PBKDF2 (Web Crypto,
// tersedia native di Cloudflare Workers runtime — tanpa dependency tambahan).
// Catatan: ini basic auth untuk v1. Untuk produksi lebih matang, pertimbangkan
// tambah verifikasi email dan rate limit percobaan login.

import { PlanId } from "./plans";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  plan: PlanId;
  createdAt: string;
}

export interface SessionRecord {
  userId: string;
  email: string;
  createdAt: string;
}

function bufferToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

async function hashPassword(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = hexToBuffer(saltHex);
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return bufferToHex(bits);
}

export async function createUser(
  email: string,
  password: string,
  kv: KVNamespace
): Promise<UserRecord> {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await kv.get(`user:${normalizedEmail}`);
  if (existing) {
    throw new Error("Email sudah terdaftar.");
  }

  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = bufferToHex(saltBytes.buffer);
  const passwordHash = await hashPassword(password, salt);

  const user: UserRecord = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    passwordHash,
    salt,
    plan: "free",
    createdAt: new Date().toISOString(),
  };

  await kv.put(`user:${normalizedEmail}`, JSON.stringify(user));
  return user;
}

export async function verifyUser(
  email: string,
  password: string,
  kv: KVNamespace
): Promise<UserRecord | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const raw = await kv.get(`user:${normalizedEmail}`);
  if (!raw) return null;

  const user = JSON.parse(raw) as UserRecord;
  const hash = await hashPassword(password, user.salt);
  if (hash !== user.passwordHash) return null;

  return user;
}

export async function createSession(user: UserRecord, kv: KVNamespace): Promise<string> {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const token = `atlas_sess_${bufferToHex(bytes.buffer)}`;

  const session: SessionRecord = {
    userId: user.id,
    email: user.email,
    createdAt: new Date().toISOString(),
  };

  // Sesi berlaku 30 hari
  await kv.put(`session:${token}`, JSON.stringify(session), { expirationTtl: 60 * 60 * 24 * 30 });
  return token;
}

export async function getSession(
  authHeader: string | null,
  kv: KVNamespace
): Promise<SessionRecord | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) return null;

  const raw = await kv.get(`session:${token}`);
  if (!raw) return null;

  return JSON.parse(raw) as SessionRecord;
}

export async function getUserByEmail(email: string, kv: KVNamespace): Promise<UserRecord | null> {
  const raw = await kv.get(`user:${email.trim().toLowerCase()}`);
  return raw ? (JSON.parse(raw) as UserRecord) : null;
}
