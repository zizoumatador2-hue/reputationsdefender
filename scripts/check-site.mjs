// Verifies the built site in dist/: every page has a title, description, canonical URL,
// and one h1; internal links and images resolve to files; and the sitemap lists pages.
// Run after `npm run build`. Exits with status 1 when a check fails.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const SITE_ORIGIN = 'https://reputationsdefender.com';

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (name.endsWith('.html')) files.push(full);
  }
  return files;
}

// Map a site path such as /pricing/ to a file in dist, or null when nothing matches.
function resolveTarget(path) {
  const clean = path.split('#')[0].split('?')[0];
  const candidates = [
    join(DIST, clean),
    join(DIST, clean, 'index.html'),
    join(DIST, clean.replace(/\/$/, '') + '.html')
  ];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile()) ?? null;
}

const problems = [];
// Skip the 404 page and generated redirect stubs (meta refresh), which carry no content of their own.
const pages = walk(DIST).filter(
  (f) => !relative(DIST, f).startsWith('404') && !/http-equiv="refresh"/.test(readFileSync(f, 'utf8'))
);
const linkTargets = new Map();

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const page = '/' + relative(DIST, file).split(sep).join('/');
  const check = (ok, message) => { if (!ok) problems.push(`${page}: ${message}`); };

  check(/<title>[^<]{10,}<\/title>/.test(html), 'missing or very short <title>');
  check(/<meta name="description" content="[^"]{50,}"/.test(html), 'missing or very short meta description');
  check(/<link rel="canonical" href="https:\/\/reputationsdefender\.com[^"]*"/.test(html), 'missing canonical URL');
  check(/<meta property="og:title"/.test(html) && /<meta name="twitter:card"/.test(html), 'missing Open Graph or Twitter card tags');
  const h1Count = (html.match(/<h1[\s>]/g) ?? []).length;
  check(h1Count === 1, `expected one <h1>, found ${h1Count}`);
  check(/<html[^>]* lang="en/.test(html), 'missing lang attribute');

  for (const match of html.matchAll(/<a[^>]+href="([^"]+)"/g)) {
    const href = match[1];
    if (/^(mailto:|tel:|https?:|#|javascript:)/.test(href)) {
      if (href.startsWith(SITE_ORIGIN)) linkTargets.set(href.replace(SITE_ORIGIN, '') || '/', page);
      continue;
    }
    linkTargets.set(href, page);
  }
  for (const match of html.matchAll(/<img[^>]+src="(\/[^"]+)"/g)) {
    const src = match[1];
    const file2 = join(DIST, src.split('?')[0]);
    check(existsSync(file2) && statSync(file2).size > 0, `image ${src} is missing or empty`);
  }
  // Heading levels must not skip (h1 → h2 → h3, no gaps).
  let lastLevel = 0;
  for (const m of html.matchAll(/<h([1-6])[\s>]/g)) {
    const level = Number(m[1]);
    check(lastLevel === 0 || level <= lastLevel + 1, `heading level skips from h${lastLevel} to h${level}`);
    lastLevel = level;
  }
  // Every page with a rendered heading should also carry some alt text on images.
  check(!/<img(?![^>]*\balt=)[^>]*>/.test(html), 'an <img> is missing an alt attribute');
}

for (const [href, from] of linkTargets) {
  if (!href.startsWith('/')) continue;
  if (!resolveTarget(href)) problems.push(`${from}: broken internal link ${href}`);
}

const sitemapPath = join(DIST, 'sitemap-0.xml');
if (!existsSync(sitemapPath)) {
  problems.push('sitemap-0.xml was not generated');
} else {
  const sitemap = readFileSync(sitemapPath, 'utf8');
  for (const required of ['/free-reputation-scan/', '/pricing/', '/reputation-management/', '/business-reputation/', '/resources/']) {
    if (!sitemap.includes(`${SITE_ORIGIN}${required}`)) problems.push(`sitemap is missing ${required}`);
  }
}

console.log(`Checked ${pages.length} pages and ${linkTargets.size} link targets.`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error(` - ${p}`);
  process.exit(1);
}
console.log('All checks passed.');
