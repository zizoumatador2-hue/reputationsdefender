# Variable Cost Audit

Scope: the repository at branch `ccr-095ce8d5-c5ysbd` (commit `59b99a5`).
Method: searched source, functions, scripts, workflows, and dependencies for SDK imports, provider hosts, environment variables, schedules, and background jobs. No API key values are recorded here.

## 1. Result in one paragraph

The site makes **no AI, media-generation, embedding, search, translation, or email-provider calls**. The sample scan is built from a fixed template (`src/lib/sample-report.ts`), so it costs no model tokens. The only variable costs are:

- Cloudflare Pages and Functions requests, which are metered per request.
- An optional lead webhook (`LEAD_WEBHOOK_URL`), which is configured by you and may bill per task in the receiving tool.
- Stripe, which is not active. Its only cost is the standard transaction fee on payments that do not exist yet.

Because nothing expensive runs per request, the cost-optimization phases that target models, prompts, media, and caches do not apply to this codebase today. They become relevant when a real analysis step is added (see section 6).

## 2. Inventory

| # | Source | Provider | Where | Trigger | Sync | Billable unit | Status |
|---|---|---|---|---|---|---|---|
| 1 | Static hosting | Cloudflare Pages | `dist/`, deploy workflow | Each deploy | n/a | Builds and bandwidth, within plan limits | Not live yet |
| 2 | Pages Functions | Cloudflare Workers | `functions/api/*.ts` | Each POST to `/api/scan`, `/api/contact`, `/api/checkout` | Sync | Requests and CPU time | Active once deployed |
| 3 | Bot check | Cloudflare Turnstile | `src/lib/server.ts` `verifyTurnstile` | Each form POST, only if `TURNSTILE_SECRET_KEY` is set | Sync | Free | Optional |
| 4 | Lead delivery | Any webhook (CRM, Zapier/Make, own endpoint) | `src/lib/server.ts` `forwardLead` | Each accepted scan or contact | Sync | Depends on the receiver (often per task or per run) | Only if `LEAD_WEBHOOK_URL` is set |
| 5 | Payments | Stripe | `functions/api/checkout.ts` | Only if the user clicks a paid-plan checkout that the UI does not yet call | Sync | Stripe transaction fee on paid invoices | Not active; returns 503 without keys |
| 6 | Analytics | Google Analytics 4 | `src/components/Analytics.astro` | Page views and events, only if `PUBLIC_GA_MEASUREMENT_ID` is set | Client | Free tier | Optional |
| 7 | Image download at build time | fal.ai CDN (static URL, no API key) | `scripts/fetch-images.mjs` | `prebuild`, only for files missing from `public/images` | Build | None (no account, no billing) | Runs during build; skips existing files |
| 8 | Deploy automation | Cloudflare API | `.github/workflows/deploy.yml`, `scripts/*.sh|py` | Push to `main` and manual dispatch | Build | GitHub Actions minutes | Present; see leak L3 |

Not present in the repository: OpenAI, Anthropic, Gemini, Replicate, ElevenLabs, HeyGen, embedding providers, vector databases, search or maps APIs, translation, SMS or WhatsApp, email providers, queues, cron jobs, scheduled functions, or background workers. `package.json` lists only `astro` and `@astrojs/sitemap`.

## 3. Request flows

**Free scan (`POST /api/scan`)**
1. Browser validates the form (`src/scripts/scan.ts`, `src/lib/validation.ts`). Invalid input makes no network call.
2. Function checks the honeypot and the timing window, verifies Turnstile if configured, and re-validates.
3. If `LEAD_WEBHOOK_URL` is set, one outbound POST is made (`forwardLead`).
4. Response is a template built from the input. No external data is read.

Duplicate risk: a double-click is blocked while the button is busy (`setBusy`). A user who retries after a network error sends a second request and a second webhook call. Nothing server-side deduplicates by email or input hash.

**Contact (`POST /api/contact`)**: same shape as the scan, with one webhook call per accepted message.

**Checkout (`POST /api/checkout`)**: returns 503 without `STRIPE_SECRET_KEY` and the plan's price ID. With keys, it creates one Stripe Checkout session per request. The UI does not call it yet.

**Build (`npm run build`)**: `prebuild` runs `fetch-images.mjs`. For each listed image it checks whether the file exists and downloads only if missing. Re-runs are free.

**Deploy workflow**: runs on every push to `main`. Builds once and makes one Pages deploy. The Cloudflare domain-link step runs curl calls with `continue-on-error`.

## 4. Cost model (what can be stated honestly)

| Quantity | Value | Basis |
|---|---|---|
| AI tokens per scan | 0 | Template, no model call. Measured by code inspection. |
| Outbound calls per accepted scan | 0 or 1 | 1 only when `LEAD_WEBHOOK_URL` is set. Configuration-derived. |
| Outbound calls per accepted contact | 0 or 1 | Same as scan. |
| Stripe fees | Not applicable | No live payments. |
| Cloudflare request cost | Unknown until production metrics exist | Depends on traffic and the plan. Check current Cloudflare pricing; do not treat any number here as measured. |
| Webhook provider cost | Unknown | Depends on the receiving tool and its plan. |

No dollar figures are given because no usage data exists yet. Estimating them now would be invented precision.

## 5. Cost leaks and risks

Classification: C0 immediate financial or abuse exposure; C1 high recurring waste; C2 moderate opportunity; C3 minor.

**L1 (C0, abuse): unthrottled submissions can trigger webhook spend.**
- Evidence: `functions/api/scan.ts` and `functions/api/contact.ts` forward every request that passes validation. The honeypot and timing checks are bypassed by any client that sends a valid body after 1.5 seconds.
- Turnstile is enforced only if `TURNSTILE_SECRET_KEY` is set. Without it, verification is skipped (`src/lib/server.ts`, `verifyTurnstile`).
- Impact: a script can send thousands of accepted submissions, each costing a webhook task.
- Safe fix: deploy with Turnstile enabled, add a Cloudflare Rate Limiting rule on `/api/*`, and rate-limit or deduplicate by email hash inside the receiver. The app code cannot rate-limit reliably across edge locations.
- Quality risk: none. Validation logic is unchanged.
- Validation: send 50 rapid POSTs with Turnstile on and confirm rejection; confirm the rule triggers in Cloudflare analytics.

**L2 (C1, duplicate work): repeat submissions create duplicate leads.**
- Evidence: no server-side deduplication in `functions/api/scan.ts` or `functions/api/contact.ts`.
- Impact: a retry after a timeout creates two leads and two webhook calls.
- Safe fix: derive an idempotency key from normalized email, topic, and a 10-minute time bucket; reject repeats inside the window. This needs storage (KV or D1). The Cloudflare connection needed to create it is not available in this session.
- Quality risk: a real second request inside 10 minutes would be dropped. Document it in the response.

**L3 (C2, duplicate deploys): two deploy paths can run on the same project.**
- Evidence: `.github/workflows/deploy.yml` runs on push to `main`. The Worker that was previously connected to GitHub also deployed on each push (screenshot evidence in this session). Connecting the Pages project to Git would add a third path.
- Impact: duplicate builds and deploys, minutes spent, and a higher chance of a conflicting live version.
- Safe fix: choose one path. Keep the GitHub Actions path or Pages Git integration, and disable the other.
- Quality risk: none.

**L4 (C2, wasted build work): image downloads run in every build.**
- Evidence: `scripts/fetch-images.mjs` checks existence before downloading, so it is cheap. However, the repository commits 0-byte placeholder images, so the check passes and the real files are never fetched.
- Impact: none on cost. This is a quality problem, not a cost problem. Logged here for completeness.
- Safe fix: remove unused empty images (see the separate note in the launch document).

**L5 (C3, logging): none detected.** The functions do not log request bodies. Keep it that way: do not add `console.log` of lead payloads.

**Not a leak:** no AI calls, no polling, no cron, no retries with backoff in application code. `forwardLead` does not retry, so a webhook failure returns 503 and the user retries manually. That is intentional and avoids retry storms.

## 6. What becomes relevant when real analysis is added

When `buildSampleReport` is replaced with live search or review analysis, the following phases of the cost brief apply and must be designed before launch:

- A per-scan cost model with request counts for search APIs and any model calls.
- Caching of search results by normalized query, with a short TTL, scoped so one user's private data is never shared.
- Quotas per IP and per email, enforced server-side.
- Model routing: deterministic templating for the report layout, a small model only for summaries if needed, and a schema check on output.
- Cost telemetry per scan without logging the submitted name or email in plain text (hash the identifiers).

None of this is implemented, because none of it is needed yet.

## 7. Required production metrics before any cost decision

- Requests per day for `/api/scan` and `/api/contact`, including rejected requests.
- Ratio of Turnstile rejections to accepted requests.
- Webhook calls per accepted submission (should be 1; more means retries).
- Cloudflare Functions request count and CPU time per day.
- Bounce rate and time to the first CTA click, to judge whether funnel traffic is worth the webhook cost.

## 8. Recommended monthly budget alerts

- Cloudflare account usage alert at 50% and 80% of the plan's included requests.
- Webhook receiver alert when tasks exceed 2× the number of accepted submissions for the month.
- A manual review trigger if accepted submissions exceed 5× the previous month.
