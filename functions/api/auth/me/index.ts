// functions/api/auth/me/index.ts
// GET /api/auth/me  Header: Authorization: Bearer <sessionToken>
// Return info user yang lagi login, dipakai frontend buat cek status login saat reload.

import { getSession, getUserByEmail } from "../../../_lib/users";
import { getPlan } from "../../../_lib/plans";

interface Env {
  ATLAS_KV: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const authHeader = request.headers.get("Authorization");
  const session = await getSession(authHeader, env.ATLAS_KV);

  if (!session) {
    return Response.json({ error: "Sesi tidak valid atau sudah habis." }, { status: 401 });
  }

  const user = await getUserByEmail(session.email, env.ATLAS_KV);
  if (!user) {
    return Response.json({ error: "User tidak ditemukan." }, { status: 404 });
  }

  const plan = getPlan(user.plan);
  return Response.json({
    email: user.email,
    plan: plan.id,
    planName: plan.name,
    weeklyLimit: plan.requestsPerWeek,
  });
};
