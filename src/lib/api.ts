// src/lib/api.ts
// Helper fetch ke backend Pages Functions. Base URL kosong = same-origin
// (frontend & functions di-deploy bareng di satu domain Cloudflare Pages).

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
  requestsPerWeek: number;
  features: string[];
}

export interface PricingResponse {
  currency: string;
  plans: PricingPlan[];
  note: string;
}

// Fallback ini HARUS tetap sinkron manual dengan functions/_lib/plans.ts
// kalau backend belum bisa diakses (misal saat development frontend saja).
export const FALLBACK_PRICING: PricingResponse = {
  currency: "IDR",
  plans: [
    {
      id: "free",
      name: "Free",
      price: 0,
      priceDisplay: "Gratis",
      requestsPerWeek: 500,
      features: [
        "Akses ke semua provider (Gemini, Groq, OpenRouter, HF, NVIDIA)",
        "500 request per minggu",
        "Rate limit 20 request/menit",
        "Tanpa akses prioritas TTS",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: 49000,
      priceDisplay: "Rp49.000/bulan",
      requestsPerWeek: 5000,
      features: [
        "Akses ke semua provider (Gemini, Groq, OpenRouter, HF, NVIDIA)",
        "5.000 request per minggu",
        "Rate limit 60 request/menit",
        "Akses prioritas Atlas TTS",
        "Dukungan email prioritas",
      ],
    },
  ],
  note: "Kuota mingguan, reset otomatis. Tidak ada biaya tersembunyi — kelebihan pemakaian akan diblokir (429), bukan ditagih otomatis.",
};

export async function fetchPricing(): Promise<PricingResponse> {
  try {
    const res = await fetch("/api/pricing");
    if (!res.ok) throw new Error(`Pricing endpoint returned ${res.status}`);
    return (await res.json()) as PricingResponse;
  } catch {
    // Backend belum ter-deploy atau lagi down — tampilkan fallback statis
    // biar landing page tetap berguna, bukan blank.
    return FALLBACK_PRICING;
  }
}

export interface GenerateKeyResponse {
  apiKey: string;
  plan: string;
  weeklyLimit: number;
  message: string;
}

export async function generateApiKey(sessionToken: string, label?: string): Promise<GenerateKeyResponse> {
  const res = await fetch("/api/keys", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify(label ? { label } : {}),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || "Gagal membuat API key.");
  }

  return (await res.json()) as GenerateKeyResponse;
}
