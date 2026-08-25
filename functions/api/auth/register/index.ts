// functions/api/auth/register/index.ts
// POST /api/auth/register  Body: { email, password }
// Return: { sessionToken, email, plan }

import { createUser, createSession } from "../../../_lib/users";

interface Env {
  ATLAS_KV: KVNamespace;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const body = await request.json().catch(() => null);

  const email = (body as any)?.email;
  const password = (body as any)?.password;

  if (typeof email !== "string" || !isValidEmail(email)) {
    return Response.json({ error: "Email tidak valid." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return Response.json({ error: "Password minimal 8 karakter." }, { status: 400 });
  }

  try {
    const user = await createUser(email, password, env.ATLAS_KV);
    const sessionToken = await createSession(user, env.ATLAS_KV);

    return Response.json({
      sessionToken,
      email: user.email,
      plan: user.plan,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal mendaftar.";
    return Response.json({ error: message }, { status: 409 });
  }
};
