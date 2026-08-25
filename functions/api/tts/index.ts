// functions/api/tts/index.ts
// Endpoint: POST /api/tts
// Fitur Atlas TTS - masih dalam pengembangan.

import { getApiKeyRecord } from "../../_lib/auth";

interface Env {
  ATLAS_KV: KVNamespace;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const authHeader = request.headers.get("Authorization");
  const userKey = await getApiKeyRecord(authHeader, env.ATLAS_KV);
  if (!userKey) {
    return Response.json({ error: "Invalid or missing API key" }, { status: 401 });
  }

  // TODO: implementasi TTS provider di sini
  return Response.json({ error: "TTS belum diimplementasikan" }, { status: 501 });
};
