// functions/api/keys/index.ts
// POST /api/keys   Header: Authorization: Bearer <sessionToken>  → generate API key untuk user yang login
// GET  /api/keys   Header: Authorization: Bearer <apiKey>         → cek info key yang sedang dipakai
//
// Generate API key sekarang butuh login (session token dari /api/auth/login atau /api/auth/register).
// Ini beda dari GET, yang menerima API key (bukan session) untuk menanyakan info key itu sendiri.

import { generateApiKey, getApiKeyRecord, ApiKeyRecord } from "../../_lib/auth";
import { getSession, getUserByEmail } from "../../_lib/users";
import { getPlan } from "../../_lib/plans";

interface Env {
  ATLAS_KV: KVNamespace;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const authHeader = request.headers.get("Authorization");
  const session = await getSession(authHeader, env.ATLAS_KV);
  if (!session) {
    return Response.json(
      { error: "Login dulu untuk membuat API key.", reason: "login_required" },
      { status: 401 }
    );
  }

  const user = await getUserByEmail(session.email, env.ATLAS_KV);
  if (!user) {
    return Response.json({ error: "User tidak ditemukan." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const label = typeof (body as any)?.label === "string" ? (body as any).label : undefined;

  const key = generateApiKey();
  const record: ApiKeyRecord = {
    id: user.id,
    key,
    plan: user.plan,
    createdAt: new Date().toISOString(),
    label,
  };

  await env.ATLAS_KV.put(`apikey:${key}`, JSON.stringify(record));

  return Response.json({
    apiKey: key,
    plan: record.plan,
    weeklyLimit: getPlan(record.plan).requestsPerWeek,
    message: "Simpan API key ini baik-baik — tidak akan ditampilkan lagi.",
  });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const authHeader = request.headers.get("Authorization");
  const record = await getApiKeyRecord(authHeader, env.ATLAS_KV);

  if (!record) {
    return Response.json({ error: "Invalid or missing API key" }, { status: 401 });
  }

  const plan = getPlan(record.plan);
  return Response.json({
    id: record.id,
    label: record.label,
    plan: plan.id,
    planName: plan.name,
    weeklyLimit: plan.requestsPerWeek,
    createdAt: record.createdAt,
  });
};
