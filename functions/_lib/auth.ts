// functions/_lib/auth.ts
// Validasi API key user. Format tersimpan di KV: key = "apikey:<key>", value = JSON ApiKeyRecord

import { PlanId } from "./plans";

export interface ApiKeyRecord {
  id: string;       // user id internal
  key: string;       // API key itu sendiri (redundant tapi berguna buat display)
  plan: PlanId;
  createdAt: string;
  label?: string;     // nama bebas dari user, misal "Atlas Academy prod"
}

export async function getApiKeyRecord(
  authHeader: string | null,
  kv: KVNamespace
): Promise<ApiKeyRecord | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;

  const key = authHeader.replace("Bearer ", "").trim();
  if (!key) return null;

  const raw = await kv.get(`apikey:${key}`);
  if (!raw) return null;

  return JSON.parse(raw) as ApiKeyRecord;
}

export function generateApiKey(): string {
  // Format: atlas_live_<32 hex char random>
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `atlas_live_${hex}`;
}
