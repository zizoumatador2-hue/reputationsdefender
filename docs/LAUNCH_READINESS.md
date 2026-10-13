# Launch Readiness: ReputationsDefender

This document covers what the site does today, what is still simulated, the environment variables it needs, how to deploy it, and what must be resolved before launch.

## 1. What is built

**Conversion path:** Home → Free Reputation Scan → sample report → Request a Consultation (contact form) → paid plan request.

| Area | Status |
|---|---|
| Homepage (hero, trust, how it works, services, audiences, pricing preview, FAQ, final CTA) | Built |
| Free Reputation Scan form with client and server validation, honeypot, timing check, optional Turnstile | Built |
| Results dashboard (score ring, bands, search visibility, review presence, signals, risks, recommendations) | Built. **Sample data only.** |
| Reputation Score page with band table and limits | Built |
| Reputation management, monitoring, business, and personal service pages | Built |
| Pricing page with example plans and feature comparison | Built. Prices are placeholders. |
| Contact page with form and delivery-not-configured state | Built |
| Resources hub listing the 7 existing guides | Built |
| Legal: Privacy Policy, Terms of Service, Disclaimer, Editorial Policy, Affiliate Disclosure | Built. Needs attorney review. |
| 404 page, sitemap, robots.txt, canonical and Open Graph tags, JSON-LD (Organization, FAQPage, Article, BreadcrumbList) | Built |
| Analytics hooks (GA4 when configured, dataLayer events, CTA click tracking) | Built. Inactive until IDs are set. |
| Stripe Checkout endpoint | Structure only. Returns 503 until configured. Not tested against live Stripe. |
| Live search, review, and brand-mention analysis | **Not built.** Requires an external data provider. |
| Lead storage | Not built. Leads go to `LEAD_WEBHOOK_URL` when set. |

## 2. Architecture

```
Static pages (Astro 5, output: static)  →  dist/
Pages Functions (functions/api/*.ts)    →  /api/scan, /api/contact, /api/checkout
Shared validation (src/lib/validation.ts) runs in the browser and on the server.
Server-only helpers (src/lib/server.ts) read secrets from env. Never imported by pages.
```

- `functions/api/scan.ts` validates the request and returns `buildSampleReport()` from `src/lib/sample-report.ts`. The response always includes `mode: "sample"`. **Replace `buildSampleReport` with a real analysis step** and change the mode only when real data is used.
- `functions/api/contact.ts` validates and forwards to `LEAD_WEBHOOK_URL`. Without it, it returns `503 not_configured`, and the UI tells the visitor to email instead. It never reports a silent success.
- `functions/api/checkout.ts` returns `503` until `STRIPE_SECRET_KEY` and the plan's price variable are set. The UI does not call it yet; paid plans link to the contact form.

## 3. Environment variables

Set public variables in the build environment (GitHub Actions or Pages build settings). Set server variables in Cloudflare Pages → Settings → Environment variables, marked as secrets.

| Variable | Type | Purpose | Required for |
|---|---|---|---|
| `PUBLIC_GA_MEASUREMENT_ID` | public, build | GA4 ID such as `G-XXXXXXX` | Analytics |
| `PUBLIC_GOOGLE_SITE_VERIFICATION` | public, build | Search Console HTML tag token | Search Console |
| `PUBLIC_TURNSTILE_SITE_KEY` | public, build | Turnstile widget key | Bot protection on forms |
| `TURNSTILE_SECRET_KEY` | secret | Verifies Turnstile tokens on the server | Bot protection (skipped if unset) |
| `LEAD_WEBHOOK_URL` | secret | Endpoint that receives lead JSON | Lead capture (contact always; scan saves when set) |
| `LEAD_WEBHOOK_SECRET` | secret | Sent as a Bearer token to the webhook | Optional |
| `STRIPE_SECRET_KEY` | secret | Stripe API key for Checkout | Payments |
| `STRIPE_PRICE_PERSONAL_MONTHLY` | secret | Stripe Price ID | Payments |
| `STRIPE_PRICE_BUSINESS_MONTHLY` | secret | Stripe Price ID | Payments |
| `STRIPE_PRICE_PROFESSIONAL_MONTHLY` | secret | Stripe Price ID | Payments |
| `PUBLIC_SITE_URL` | server | Base URL for Stripe redirects | Payments (defaults to the production domain) |

Never prefix a secret with `PUBLIC_`. Those values are embedded in the browser bundle.

## 4. Local development

```bash
npm install
npm run build          # static site to dist/
npm run check          # verifies titles, descriptions, canonicals, h1, links, sitemap
npx wrangler@3 pages dev dist --port 8788   # serves dist/ plus /api/* functions
```

`npm run dev` (Astro dev server) does **not** run the `/api/*` functions. Use `wrangler pages dev` to test forms end to end.

## 5. Deployment (Cloudflare Pages)

1. Create the Pages project named `reputationsdefender` (or match `PROJECT` in `.github/workflows/deploy.yml`).
2. Add the variables from section 3.
3. Deploy with `wrangler pages deploy dist --project-name reputationsdefender`. Wrangler looks for `functions/` at the project root. This was verified with `wrangler pages dev`, not with a production deploy, so **confirm after the first deploy** that `POST /api/scan` returns JSON rather than the HTML page.
4. Attach `reputationsdefender.com` and `www` to the project.
5. Add a Cloudflare **Rate Limiting** rule for `/api/*` (for example, 10 requests per minute per IP). Application code cannot rate-limit reliably across edge locations.

**Known issues in the existing pipeline (not changed in this pass):**

- `.github/workflows/deploy.yml` runs the Wrangler deploy with `|| true`, so a failed deploy can still pass. Remove that suffix before relying on CI.
- `scripts/deploy.py` uploads static files only. It does not deploy `functions/`, so the forms would break if that script is used.

## 6. Trademark and brand risk: resolve before launch

**This is the most important item in this document.** The brand name "ReputationsDefender" is very close to a registered mark used for the same kind of service.

- A USPTO record shows the standard-character mark **REPUTATIONDEFENDER** (serial 77046395, registration 3397072 per the Justia record), registered for online reputation management services in Class 42. Source: [Justia trademark record](https://trademarks.justia.com/770/46/reputationdefender-77046395.html).
- The company was founded as ReputationDefender, renamed Reputation.com in 2011, and sold its ReputationDefender consumer business line in 2018. Source: [Wikipedia: Reputation.com](https://en.wikipedia.org/wiki/Reputation.com).
- The search did not confirm the current owner or status. Check the USPTO TSDR record directly.
- Owning a domain name does not create trademark rights. The brief also uses "Reputation Defender" and "Reputations Defender" interchangeably, which increases confusion.

**Recommendation:** Get a formal trademark clearance opinion from a US trademark attorney before any paid marketing. Consider a distinct brand that does not contain "Reputation Defender" or a close variant. This is not legal advice.

## 7. Content gaps versus the brief

- **Homepage length:** The brief asks for about 8,000 words on the homepage. The current homepage is around 2,000 words. Long homepages do not convert well, and padding would be thin content. Expand only where it answers real questions.
- **Cluster articles:** The brief asks for 20 or more supporting articles of 1,500 to 2,500 words each. The site has 7 existing guides. Each new article should be written and reviewed by a human with real expertise. Do not generate them in bulk.
- **Keyword list:** The 20 keyword groups appear across the homepage and service pages. Article titles can reuse the rest, but avoid repeating the same phrase in every heading.
- **Schema:** Google retired HowTo rich results in 2023, so step lists use semantic `<ol>` markup without HowTo schema. FAQ rich results are limited for most sites, but FAQPage markup is still valid.

## 8. Items to confirm before launch

- [ ] Attorney review of Privacy Policy, Terms, Disclaimer, and Affiliate Disclosure. Confirm the statement that form details are not used for ad profiles is true in your analytics and ad setup.
- [ ] Confirm the legal entity name and mailing address, which are not in the site yet.
- [ ] Replace the placeholder logo mark (`public/images/logo.png`) with a designed logo.
- [ ] Confirm example prices, plan features, and whether they will be offered.
- [ ] Set `PUBLIC_GA_MEASUREMENT_ID` and `PUBLIC_GOOGLE_SITE_VERIFICATION`; verify in Search Console and submit `sitemap-index.xml`.
- [ ] Set up Turnstile (`PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`).
- [ ] Set `LEAD_WEBHOOK_URL` so contact and scan leads are delivered.
- [ ] Add the Cloudflare rate-limit rule for `/api/*`.
- [ ] Decide on the brand (section 6).
- [ ] Test every form end to end on the production domain, on a phone.

## 9. What was verified in this pass

- `npm run build` succeeds with 31 static pages plus the sitemap.
- `npm run check` passes: titles, descriptions, canonicals, one `h1` per page, every internal link resolves, images are non-empty, and the sitemap includes the service pages.
- Pages Functions were exercised through `wrangler pages dev`: valid scan returns a sample report; invalid input returns field errors; the honeypot is rejected; contact returns `not_configured` without a webhook; checkout returns `503` without Stripe.
- Headless Chromium at 1280px and 390px: all key pages load with no horizontal overflow and no console errors (except the deliberate 404 test). The scan form validates in the browser, submits, renders the report, resets, and the mobile menu opens.
- **Not verified:** a live Stripe checkout, a live lead webhook, Turnstile tokens, GA events in a real property, and the production Cloudflare deployment.
