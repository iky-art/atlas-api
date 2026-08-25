// functions/_lib/providers.ts
// Registry handler untuk tiap AI provider. Tambah provider baru = tambah satu entry di sini.

type ProviderHandler = (body: unknown, env: Record<string, string>) => Promise<unknown>;

async function callGemini(body: any, env: any) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
  );
  return res.json();
}

async function callGroq(body: any, env: any) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.GROQ_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function callOpenRouter(body: any, env: any) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function callHuggingFace(body: any, env: any) {
  const res = await fetch(`https://api-inference.huggingface.co/models/${body.model}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.HF_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function callNvidia(body: any, env: any) {
  const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.NVIDIA_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

const registry: Record<string, ProviderHandler> = {
  gemini: callGemini,
  groq: callGroq,
  openrouter: callOpenRouter,
  hf: callHuggingFace,
  nvidia: callNvidia,
};

export function getProviderHandler(provider: string): ProviderHandler | undefined {
  return registry[provider];
}
