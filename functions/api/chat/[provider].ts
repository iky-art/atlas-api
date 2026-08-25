// functions/api/chat/[provider].ts
// Endpoint: POST /api/chat/:provider  (provider = gemini | groq | openrouter | hf | nvidia)
// API key provider diambil dari Environment Variables (Secrets) Cloudflare, bukan dari client.

import { getProviderHandler } from "../../_lib/providers";
import { checkRateLimit } from "../../_lib/rateLimit";
import { getApiKeyRecord } from "../../_lib/auth";

interface Env {
  ATLAS_KV: KVNamespace;
  GEMINI_API_KEY: string;
  GROQ_API_KEY: string;
  OPENROUTER_API_KEY: string;
  HF_API_KEY: string;
  NVIDIA_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const provider = params.provider as string;

  // 1. Validasi API key milik user
  const authHeader = request.headers.get("Authorization");
  const userKey = await getApiKeyRecord(authHeader, env.ATLAS_KV);
  if (!userKey) {
    return Response.json({ error: "Invalid or missing API key" }, { status: 401 });
  }

  // 2. Rate limiting: kuota mingguan sesuai plan + burst per menit
  const rl = await checkRateLimit(userKey.id, userKey.plan, env.ATLAS_KV);
  if (!rl.allowed) {
    const status = 429;
    const message =
      rl.reason === "weekly_limit"
        ? `Kuota mingguan (${rl.weeklyLimit} request) sudah habis. Upgrade ke Pro untuk kuota lebih besar, atau tunggu reset minggu depan.`
        : "Terlalu banyak request dalam waktu singkat. Coba lagi sebentar lagi.";
    return Response.json({ error: message, reason: rl.reason }, { status });
  }

  // 3. Ambil handler sesuai provider, forward request
  const handler = getProviderHandler(provider);
  if (!handler) {
    return Response.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
  }

  const body = await request.json();
  const result = await handler(body, env);

  return Response.json(result, {
    headers: { "X-RateLimit-Remaining-Weekly": String(rl.remainingWeekly ?? "") },
  });
};
