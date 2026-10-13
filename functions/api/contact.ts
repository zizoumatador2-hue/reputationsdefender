// POST /api/contact: validates a contact or consultation request and forwards it.
import { json, readBody, verifyTurnstile, forwardLead, type Env } from '../../src/lib/server';
import { validateContact, checkAntiSpam } from '../../src/lib/validation';

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const raw = await readBody(request);
  if (!raw) return json(400, { ok: false, errors: { form: 'We could not read your request. Please try again.' } });

  const spam = checkAntiSpam(raw);
  if (Object.keys(spam).length > 0) return json(400, { ok: false, errors: spam });

  const human = await verifyTurnstile(raw['cf-turnstile-response'], env, request.headers.get('cf-connecting-ip'));
  if (!human) {
    return json(400, { ok: false, errors: { form: 'Verification failed. Please complete the check and try again.' } });
  }

  const result = validateContact(raw);
  if (!result.ok) return json(400, { ok: false, errors: result.errors });

  try {
    const outcome = await forwardLead(env, {
      type: 'contact',
      ...result.value,
      submittedAt: new Date().toISOString(),
      source: 'contact'
    });
    if (outcome === 'not_configured') {
      // Be explicit: the visitor is told to email us directly instead of seeing a silent success.
      return json(503, {
        ok: false,
        code: 'not_configured',
        message: 'Online form delivery is not set up yet. Please email us directly instead.'
      });
    }
  } catch {
    return json(503, {
      ok: false,
      code: 'delivery_failed',
      message: 'We could not send your message right now. Please try again or email us directly.'
    });
  }

  return json(200, { ok: true, message: 'Thanks. We received your request and will reply by email.' });
}
