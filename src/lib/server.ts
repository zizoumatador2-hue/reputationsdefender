// Server-only helpers for Cloudflare Pages Functions. Never import this file
// from a client-side script or an Astro page; it reads secrets from `env`.

export type Env = Record<string, string | undefined>;

export const MAX_BODY_BYTES = 16 * 1024;

export function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex'
    }
  });
}

/** Reads a form-encoded, multipart, or JSON body. Returns null when the body is oversized or unreadable. */
export async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  const length = Number(request.headers.get('content-length') ?? 0);
  if (length > MAX_BODY_BYTES) return null;
  const type = request.headers.get('content-type') ?? '';
  try {
    if (type.includes('application/json')) {
      const data = await request.json();
      return data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
    }
    const form = await request.formData();
    return Object.fromEntries(form.entries());
  } catch {
    return null;
  }
}

/**
 * Verifies a Cloudflare Turnstile token. When TURNSTILE_SECRET_KEY is not set,
 * verification is skipped so local development works; production should set it.
 */
export async function verifyTurnstile(
  token: unknown,
  env: Env,
  ip: string | null
): Promise<boolean> {
  const secret = env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== 'string' || token.length === 0) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

/**
 * Sends a lead to LEAD_WEBHOOK_URL (a CRM, Zapier/Make, or your own endpoint).
 * Returns 'not_configured' when the variable is missing; throws when delivery fails.
 */
export async function forwardLead(
  env: Env,
  payload: Record<string, unknown>
): Promise<'sent' | 'not_configured'> {
  const url = env.LEAD_WEBHOOK_URL;
  if (!url) return 'not_configured';
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (env.LEAD_WEBHOOK_SECRET) headers.authorization = `Bearer ${env.LEAD_WEBHOOK_SECRET}`;
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`Lead webhook responded with ${res.status}`);
  return 'sent';
}
