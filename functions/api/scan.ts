// POST /api/scan: validates a scan request and returns the SAMPLE report.
// Live analysis is not connected, so the response is always marked isSample.
import { json, readBody, verifyTurnstile, forwardLead, type Env } from '../../src/lib/server';
import { validateScan, checkAntiSpam, US_STATES } from '../../src/lib/validation';
import { buildSampleReport } from '../../src/lib/sample-report';

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

  const result = validateScan(raw);
  if (!result.ok) return json(400, { ok: false, errors: result.errors });

  const { value } = result;
  let leadStored = false;
  try {
    const outcome = await forwardLead(env, {
      type: 'free_scan',
      ...value,
      submittedAt: new Date().toISOString(),
      source: 'free-reputation-scan'
    });
    leadStored = outcome === 'sent';
  } catch {
    return json(503, {
      ok: false,
      code: 'lead_delivery_failed',
      message: 'We could not save your request right now. Please try again in a few minutes.'
    });
  }

  const stateName = US_STATES.find((s) => s.code === value.state)?.name ?? value.state;
  return json(200, {
    ok: true,
    mode: 'sample',
    leadStored,
    report: buildSampleReport(value, stateName)
  });
}
