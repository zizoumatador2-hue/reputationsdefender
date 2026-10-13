// POST /api/checkout: creates a Stripe Checkout session for a subscription plan.
// Returns 503 until STRIPE_SECRET_KEY and the plan's price ID are configured.
// The UI does not call this endpoint yet; paid plans link to the contact form.
import { json, readBody, type Env } from '../../src/lib/server';
import { PLANS } from '../../src/lib/pricing';

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const raw = await readBody(request);
  const planId = typeof raw?.planId === 'string' ? raw.planId : '';
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan || !plan.stripePriceEnv) return json(400, { ok: false, message: 'Choose a plan that is available online.' });

  const priceId = env[plan.stripePriceEnv];
  if (!env.STRIPE_SECRET_KEY || !priceId) {
    return json(503, {
      ok: false,
      code: 'not_configured',
      message: 'Online payments are not set up yet.',
      required: ['STRIPE_SECRET_KEY', plan.stripePriceEnv]
    });
  }

  const site = env.PUBLIC_SITE_URL || 'https://reputationsdefender.com';
  const body = new URLSearchParams({
    mode: 'subscription',
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    success_url: `${site}/pricing/?checkout=success`,
    cancel_url: `${site}/pricing/?checkout=cancelled`,
    'metadata[plan]': plan.id
  });

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, 'content-type': 'application/x-www-form-urlencoded' },
    body
  });
  if (!res.ok) return json(502, { ok: false, message: 'Could not start checkout. Please try again later.' });

  const session = (await res.json()) as { url?: string };
  if (!session.url) return json(502, { ok: false, message: 'Could not start checkout. Please try again later.' });
  return json(200, { ok: true, url: session.url });
}
