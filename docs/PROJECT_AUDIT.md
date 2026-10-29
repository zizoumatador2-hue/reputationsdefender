# Project Audit

Date of audit: 2026-10-29. Branch `ccr-095ce8d5-c5ysbd`. Read-only: no site files were changed.

## 1. Site type and offering
- Static Astro 5 site with a lead-generation funnel for US individuals and businesses: free preliminary reputation scan, then consultation or plan request.
- Services described (no live analysis yet): reputation management, monitoring, business reputation, personal reputation, reputation score.
- Pricing is example only. Paid checkout is not active.
- Content: 7 educational guides plus legal pages.

## 2. Target audience
- Individuals (executives, professionals, job seekers, public-facing people).
- Small businesses, clinics, law firms, real estate teams, agencies (named on the homepage and business page).

## 3. Pages present
Home, free scan, reputation management, monitoring, business, personal, reputation score, pricing, resources (guides index), 7 guide pages, contact, FAQ, about, editorial policy, affiliate disclosure, privacy, terms, disclaimer, 404.

## 4. Pages missing or weak
- No real testimonials or case studies. This is correct, since none exist, but it leaves a conversion gap that only real customers can fill.
- No thank-you page after contact or scan submission. Feedback appears inline only.
- No shareable permalink for a scan result.
- Guides: 7 articles, not the 20+ the brief asked for. Several category pages were removed or redirected during the rebuild.
- Old category routes (`/online-reputation/`, `/google-search/`, `/data-brokers/`, etc.) still exist but are not in the navigation. They are orphaned pages.

## 5. Design weaknesses (measured)
- **Typography:** system font stack only. No brand typeface, so the identity looks generic.
- **Logo:** placeholder shield mark, drawn in-house. It is not a finished identity.
- **Iconography:** no icon set. Checkmarks are text characters (`✓`).
- **Imagery:** none on content pages. The hero is a CSS-only sample dashboard, which is honest but visually sparse.
- **Repetition:** homepage repeats the same service information in three places (service cards, services grid, pricing preview), and the FAQ is repeated across pages.
- **Length:** homepage is about 10,200 px tall on desktop and about 18,000 px on mobile. The mobile page is long for a conversion landing page.

## 6. UX problems (measured with headless Chromium, 390 px and 1280 px)
- **Tap targets below 44 px:** 20–26 per page on mobile, 30–38 per page on desktop. Most are footer links, inline text links, and small form controls (the checkboxes and radio buttons). Examples: the brand link, "reputation monitoring" links, "Home" breadcrumb, and checkbox labels.
- **Text below 16 px on mobile:** 34–84 elements per page. Most are footer, breadcrumb, and caption text. The brief asks for 16 px minimum.
- **Sticky bottom CTA on mobile** covers part of the last content section. Padding is added, but the bar hides some content until scrolled.
- **Desktop header:** seven navigation links plus a CTA, which is dense at widths near 1080 px.
- **No horizontal overflow** on any tested page at 360, 390, 768, or 1280 px.

## 7. Mobile problems
- Long single-column pages with many repeated cards.
- Footer link lists take considerable space on small screens.
- Mobile menu is a full list rather than a designed mobile navigation.
- Sticky bottom CTA is useful but not visually integrated with the design system.

## 8. Current visual identity
- Colors: navy `#0b3d62` for primary, teal `#0f8f7e` for the main action, neutral grays for text and borders, warm amber for sample warnings. Dark mode tokens exist.
- Radii: 6, 10, and 16 px. Shadows: two levels.
- Consistent but generic. It reads as a corporate SaaS template, not a distinctive brand.

## 9. Technical stack
- Astro 5 static output, one CSS file inlined (critical), two external stylesheets loaded non-blocking (`global.css`, `app.css`).
- No UI framework and no animation library. Client JavaScript is small: forms, scan dashboard, click tracking, navigation toggle.
- Pages Functions for `/api/scan`, `/api/contact`, `/api/checkout`.
- Sitemap, robots.txt, canonical and Open Graph tags, JSON-LD (Organization, FAQPage, Article, BreadcrumbList).
- Analytics and Turnstile load only when configured.

## 10. Features to preserve (no removal or disabling during any redesign)
- Free scan form with validation, honeypot, timing check, and Turnstile hook; sample dashboard rendering and reset.
- Contact form with topic and plan prefill from the URL; not-configured message.
- Checkout endpoint (returns 503 until configured).
- Pricing data in `src/lib/pricing.ts`; score bands in `src/lib/score.ts`.
- All 7 guides and their URLs under `/privacy-guides/`.
- Redirect from `/privacy-guides/` to `/resources/`.
- Legal pages and their content.
- Sitemap, robots, canonical tags, structured data, and analytics hooks.

## 11. Template research (Phase 2)
- Could not be done. The site `lexingtonthemes.com` is not in the session's allowed network domains (DNS lookup failed). It must be allowed in the session's network settings before it can be checked. No template was evaluated or selected.

## 12. Blockers for a redesign
- **Brand name:** the registered-mark conflict (see launch document, section 6) must be resolved before a final identity is designed.
- **Logo:** a designed logo is needed; the placeholder should not be finalized.
- **Template access:** blocked as described above.
- **Testimonials and results:** must come from real customers only.
