// functions/_lib/plans.ts
// Sumber tunggal untuk definisi plan, limit mingguan, dan harga.
// Diimpor oleh rateLimit.ts (enforcement) dan /api/pricing (ditampilkan ke user).

export type PlanId = "free" | "pro";

export interface PlanConfig {
  id: PlanId;
  name: string;
  priceIdr: number; // 0 = gratis
  billingPeriod: "monthly" | null;
  requestsPerWeek: number;
  features: string[];
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    priceIdr: 0,
    billingPeriod: null,
    requestsPerWeek: 500,
    features: [
      "Akses ke semua provider (Gemini, Groq, OpenRouter, HF, NVIDIA)",
      "500 request per minggu",
      "Rate limit 20 request/menit",
      "Tanpa akses prioritas TTS",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceIdr: 49000, // TODO: konfirmasi angka final sebelum go-live
    billingPeriod: "monthly",
    requestsPerWeek: 5000,
    features: [
      "Akses ke semua provider (Gemini, Groq, OpenRouter, HF, NVIDIA)",
      "5.000 request per minggu",
      "Rate limit 60 request/menit",
      "Akses prioritas Atlas TTS",
      "Dukungan email prioritas",
    ],
  },
};

export function getPlan(planId: string | undefined): PlanConfig {
  return PLANS[(planId as PlanId) || "free"] || PLANS.free;
}
