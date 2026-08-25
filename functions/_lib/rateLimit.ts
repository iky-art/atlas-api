// functions/_lib/rateLimit.ts
// Rate limit dua lapis:
//  1) Kuota MINGGUAN sesuai plan (free/pro) — reset tiap 7 hari dari first-use di window itu.
//  2) Batas per-menit anti-burst (biar satu user gak nembak ratusan request sekaligus).
// Disimpan di Cloudflare KV.

import { getPlan, PlanId } from "./plans";

const PER_MINUTE_LIMIT: Record<PlanId, number> = {
  free: 20,
  pro: 60,
};

function currentWeekKey(): string {
  // Minggu ISO sederhana: epoch days / 7 → cukup buat window mingguan rolling per-Senin.
  const now = new Date();
  const oneJan = new Date(now.getUTCFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - oneJan.getTime()) / 86400000);
  const week = Math.floor(dayOfYear / 7);
  return `${now.getUTCFullYear()}-w${week}`;
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: "weekly_limit" | "burst_limit";
  remainingWeekly?: number;
  weeklyLimit: number;
}

export async function checkRateLimit(
  userId: string,
  plan: PlanId,
  kv: KVNamespace
): Promise<RateLimitResult> {
  const planConfig = getPlan(plan);
  const weeklyLimit = planConfig.requestsPerWeek;

  // 1. Cek burst per menit dulu (murah, gagal cepat)
  const minuteKey = `ratelimit:minute:${userId}:${Math.floor(Date.now() / 60000)}`;
  const minuteCountRaw = await kv.get(minuteKey);
  const minuteCount = minuteCountRaw ? parseInt(minuteCountRaw, 10) : 0;

  if (minuteCount >= PER_MINUTE_LIMIT[plan]) {
    return { allowed: false, reason: "burst_limit", weeklyLimit };
  }

  // 2. Cek kuota mingguan
  const weekKey = `ratelimit:week:${userId}:${currentWeekKey()}`;
  const weekCountRaw = await kv.get(weekKey);
  const weekCount = weekCountRaw ? parseInt(weekCountRaw, 10) : 0;

  if (weekCount >= weeklyLimit) {
    return { allowed: false, reason: "weekly_limit", remainingWeekly: 0, weeklyLimit };
  }

  // 3. Increment kedua counter
  await kv.put(minuteKey, String(minuteCount + 1), { expirationTtl: 90 });
  await kv.put(weekKey, String(weekCount + 1), { expirationTtl: 60 * 60 * 24 * 8 }); // 8 hari safety margin

  return {
    allowed: true,
    remainingWeekly: weeklyLimit - (weekCount + 1),
    weeklyLimit,
  };
}
