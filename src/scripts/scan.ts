import { trackEvent } from '../lib/analytics';
import { clearFormErrors, showFieldErrors, showStatus, setBusy, submitForm } from './forms';
import { validateScan } from '../lib/validation';

interface ScanReport {
  isSample: true;
  subject: string;
  location: string;
  score: number;
  band: string;
  bandTone: string;
  bandMeaning: string;
  searchVisibility: number;
  reviewPresence: number;
  positiveSignals: string[];
  potentialRisks: string[];
  recommendations: string[];
  limitations: string[];
}

const form = document.getElementById('scan-form') as HTMLFormElement | null;
const results = document.getElementById('scan-results');

const SVG_NS = 'http://www.w3.org/2000/svg';

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function scoreRing(score: number): SVGSVGElement {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 120 120');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('score-ring');
  const track = document.createElementNS(SVG_NS, 'circle');
  track.setAttribute('cx', '60');
  track.setAttribute('cy', '60');
  track.setAttribute('r', String(radius));
  track.setAttribute('class', 'ring-track');
  const progress = document.createElementNS(SVG_NS, 'circle');
  progress.setAttribute('cx', '60');
  progress.setAttribute('cy', '60');
  progress.setAttribute('r', String(radius));
  progress.setAttribute('class', 'ring-progress');
  progress.setAttribute('stroke-dasharray', String(circumference));
  progress.setAttribute('stroke-dashoffset', String(circumference * (1 - score / 100)));
  svg.append(track, progress);
  return svg;
}

function metricCard(label: string, value: number, note: string): HTMLElement {
  const card = el('div', 'card metric');
  card.append(el('p', 'metric-label', label), el('p', 'metric-value', `${value}/100`), el('p', 'metric-note', note));
  return card;
}

function listCard(title: string, items: string[], ordered = false): HTMLElement {
  const card = el('section', 'card list-card');
  card.append(el('h3', '', title));
  const list = el(ordered ? 'ol' : 'ul');
  items.forEach((item) => list.append(el('li', '', item)));
  card.append(list);
  return card;
}

function renderReport(report: ScanReport): void {
  if (!results) return;
  results.replaceChildren();
  results.hidden = false;

  const banner = el('div', 'sample-banner');
  banner.setAttribute('role', 'note');
  banner.append(
    el('strong', '', 'Sample report. '),
    el('span', '', 'Live search and review analysis is not connected yet, so these results are illustrative and do not describe what the internet currently says.')
  );

  const heading = el('h2', 'report-heading', `Reputation report for ${report.subject}`);
  heading.tabIndex = -1;
  const meta = el('p', 'report-meta', `Location: ${report.location}`);

  const overview = el('div', 'report-overview');
  const scoreCard = el('div', `card score-card tone-${report.bandTone}`);
  const ringWrap = el('div', 'ring-wrap');
  ringWrap.append(scoreRing(report.score), el('p', 'ring-score', String(report.score)));
  scoreCard.append(
    ringWrap,
    el('p', 'score-band', report.band),
    el('p', 'score-meaning', report.bandMeaning),
    el('p', 'score-caption', 'Sample score. Informational only, not an official rating.')
  );
  const metrics = el('div', 'metric-grid');
  metrics.append(
    metricCard('Search Visibility', report.searchVisibility, 'How prominently your name appears in results.'),
    metricCard('Review Presence', report.reviewPresence, 'How visible reviews and ratings are.')
  );
  overview.append(scoreCard, metrics);

  const lists = el('div', 'report-lists');
  lists.append(
    listCard('Positive Signals', report.positiveSignals),
    listCard('Potential Reputation Risks', report.potentialRisks),
    listCard('Recommendations', report.recommendations, true)
  );

  const limits = el('details', 'report-limits');
  limits.append(el('summary', '', 'What this sample does and does not show'));
  const limitList = el('ul');
  report.limitations.forEach((item) => limitList.append(el('li', '', item)));
  limits.append(limitList);

  const cta = el('div', 'report-cta card');
  cta.append(
    el('h3', '', 'Want a full review of these results?'),
    el('p', '', 'Tell us a little more and our team can walk through options with you. There is no obligation.')
  );
  const consult = el('a', 'btn btn-primary', 'Request a Consultation');
  consult.setAttribute('href', '/contact/?topic=consultation&from=scan');
  consult.dataset.track = 'report_consultation';
  const again = el('button', 'btn btn-outline', 'Run Another Scan');
  again.type = 'button';
  again.addEventListener('click', () => {
    results.hidden = true;
    form?.querySelector<HTMLInputElement>('input[name="subject"]')?.focus();
    results.replaceChildren();
  });
  const actions = el('div', 'hero-actions');
  actions.append(consult, again);
  cta.append(actions);

  results.append(banner, heading, meta, overview, lists, limits, cta);
  heading.focus();
  results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

if (form && results) {
  const startedInput = form.querySelector<HTMLInputElement>('input[name="startedAt"]');
  if (startedInput) startedInput.value = String(Date.now());

  // Pre-select "business" when arriving from a business page (/free-reputation-scan/?type=business).
  if (new URLSearchParams(location.search).get('type') === 'business') {
    const business = form.querySelector<HTMLInputElement>('input[name="subjectType"][value="business"]');
    if (business) business.checked = true;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFormErrors(form);
    // Validate in the browser first for immediate feedback. The server re-validates everything.
    const check = validateScan(Object.fromEntries(new FormData(form).entries()));
    if (!check.ok) {
      showFieldErrors(form, check.errors);
      return;
    }
    const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    setBusy(submit, true, 'Analyzing…');
    trackEvent('scan_submit', { subject_type: check.value.subjectType });

    const result = await submitForm('/api/scan', form);
    setBusy(submit, false);

    if (result.ok && result.data.report) {
      trackEvent('scan_result_view', { mode: 'sample' });
      renderReport(result.data.report as ScanReport);
      return;
    }
    if (result.data.message) showStatus(form, result.data.message, 'error');
    showFieldErrors(form, result.errors);
    if (!result.data.message && Object.keys(result.errors).length === 0) {
      showStatus(form, 'Something went wrong. Please try again in a few minutes.', 'error');
    }
  });
}
