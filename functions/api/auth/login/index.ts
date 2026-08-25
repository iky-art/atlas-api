// functions/api/auth/login/index.ts
// POST /api/auth/login  Body: { email, password }
// Return: { sessionToken, email, plan }

import { verifyUser, createSession } from "../../../_lib/users";

interface Env {
  ATLAS_KV: KVNamespace;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const body = await request.json().catch(() => null);

  const email = (body as any)?.email;
  const password = (body as any)?.password;

  if (typeof email !== "string" || typeof password !== "string") {
    return Response.json({ error: "Email dan password wajib diisi." }, { status: 400 });
  }

  const user = await verifyUser(email, password, env.ATLAS_KV);
  if (!user) {
    return Response.json({ error: "Email atau password salah." }, { status: 401 });
  }

  const sessionToken = await createSession(user, env.ATLAS_KV);

  return Response.json({
    sessionToken,
    email: user.email,
    plan: user.plan,
  });
};
