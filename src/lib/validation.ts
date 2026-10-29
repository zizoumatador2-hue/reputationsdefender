// Shared validation for scan, contact, and checkout requests.
// Runs in the browser for instant feedback and on the server, where the
// result is authoritative. Keep this file free of Node- or Worker-only APIs.

export const US_STATES: { code: string; name: string }[] = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'DC', name: 'District of Columbia' },
  { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' }, { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' }, { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' }, { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' }, { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' }, { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' }, { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' }, { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
];

const STATE_CODES = new Set(US_STATES.map((s) => s.code));

export const CONTACT_TOPICS = ['consultation', 'business', 'personal', 'enterprise', 'correction', 'general'] as const;
export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export const SUBJECT_TYPES = ['person', 'business'] as const;

export type FieldErrors = Record<string, string>;
export type Result<T> = { ok: true; value: T } | { ok: false; errors: FieldErrors };

export const LIMITS = {
  name: { min: 2, max: 120 },
  city: { min: 2, max: 80 },
  email: { max: 254 },
  url: { max: 255 },
  message: { min: 10, max: 2000 }
} as const;

const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;

/** Trims, strips control characters, and collapses whitespace. Single-line fields only. */
export function cleanLine(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.replace(CONTROL_CHARS, ' ').replace(/\s+/g, ' ').trim();
}

/** Like cleanLine, but keeps line breaks for multi-line fields. */
export function cleanMultiline(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, ' ').trim();
}

// Patterns that suggest a Social Security, card, or bank number was pasted in.
// These are a guardrail, not a full PII detector.
const SSN_LIKE = /\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/;
const CARD_LIKE = /\b(?:\d[ -]?){13,19}\b/;

export function containsSensitiveNumber(text: string): boolean {
  return SSN_LIKE.test(text) || CARD_LIKE.test(text);
}

const SENSITIVE_MESSAGE =
  "Please don't include Social Security, card, or bank account numbers. This form isn't meant for sensitive data.";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return value.length <= LIMITS.email.max && EMAIL.test(value);
}

/** Returns a normalized http(s) URL, '' when the input is empty, or null when invalid. */
export function normalizeWebsite(input: string): string | null {
  const raw = input.trim();
  if (!raw) return '';
  if (raw.length > LIMITS.url.max) return null;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (url.username || url.password) return null;
    if (!url.hostname.includes('.') || url.hostname.length > 253) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export interface ScanInput {
  subjectType: (typeof SUBJECT_TYPES)[number];
  subject: string;
  websiteUrl: string;
  city: string;
  state: string;
  email: string;
  consent: true;
}

export function validateScan(raw: Record<string, unknown>): Result<ScanInput> {
  const errors: FieldErrors = {};

  const subjectType = cleanLine(raw.subjectType);
  if (!(SUBJECT_TYPES as readonly string[]).includes(subjectType)) {
    errors.subjectType = 'Choose whether this scan is for a person or a business.';
  }

  const subject = cleanLine(raw.subject);
  if (subject.length < LIMITS.name.min) errors.subject = 'Enter a full name or business name.';
  else if (subject.length > LIMITS.name.max) errors.subject = `Keep this under ${LIMITS.name.max} characters.`;
  else if (containsSensitiveNumber(subject)) errors.subject = SENSITIVE_MESSAGE;

  const websiteUrl = normalizeWebsite(cleanLine(raw.websiteUrl));
  if (websiteUrl === null) errors.websiteUrl = 'Enter a valid website address, such as example.com.';

  const city = cleanLine(raw.city);
  if (city.length < LIMITS.city.min) errors.city = 'Enter your city.';
  else if (city.length > LIMITS.city.max) errors.city = `Keep this under ${LIMITS.city.max} characters.`;
  else if (containsSensitiveNumber(city)) errors.city = SENSITIVE_MESSAGE;

  const state = cleanLine(raw.state).toUpperCase();
  if (!STATE_CODES.has(state)) errors.state = 'Choose a US state or district.';

  const email = cleanLine(raw.email).toLowerCase();
  if (!isValidEmail(email)) errors.email = 'Enter an email address we can use to send your report.';

  const consent = raw.consent === true || raw.consent === 'on' || raw.consent === 'true';
  if (!consent) errors.consent = 'Please confirm you understand this is a preliminary assessment.';

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      subjectType: subjectType as ScanInput['subjectType'],
      subject,
      websiteUrl: websiteUrl ?? '',
      city,
      state,
      email,
      consent: true
    }
  };
}

export interface ContactInput {
  name: string;
  email: string;
  topic: ContactTopic;
  plan: string;
  message: string;
  consent: true;
}

export function validateContact(raw: Record<string, unknown>): Result<ContactInput> {
  const errors: FieldErrors = {};

  const name = cleanLine(raw.name);
  if (name.length < LIMITS.name.min) errors.name = 'Enter your name.';
  else if (name.length > LIMITS.name.max) errors.name = `Keep this under ${LIMITS.name.max} characters.`;

  const email = cleanLine(raw.email).toLowerCase();
  if (!isValidEmail(email)) errors.email = 'Enter a valid email address.';

  const topic = cleanLine(raw.topic) || 'general';
  if (!(CONTACT_TOPICS as readonly string[]).includes(topic)) errors.topic = 'Choose a topic from the list.';

  const plan = cleanLine(raw.plan).slice(0, 40);

  const message = cleanMultiline(raw.message);
  if (message.length < LIMITS.message.min) errors.message = `Tell us a little more (at least ${LIMITS.message.min} characters).`;
  else if (message.length > LIMITS.message.max) errors.message = `Keep this under ${LIMITS.message.max} characters.`;
  else if (containsSensitiveNumber(message)) errors.message = SENSITIVE_MESSAGE;

  const consent = raw.consent === true || raw.consent === 'on' || raw.consent === 'true';
  if (!consent) errors.consent = 'Please confirm you agree to be contacted about your request.';

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: { name, email, topic: topic as ContactTopic, plan, message, consent: true }
  };
}

/** Honeypot and timing checks. Real users leave the hidden field empty and take more than a second or two. */
export function checkAntiSpam(raw: Record<string, unknown>, now: number = Date.now()): FieldErrors {
  if (cleanLine(raw.fax)) return { form: 'We could not process this request. Please try again.' };
  const started = Number(raw.startedAt);
  if (!Number.isFinite(started) || started <= 0) return { form: 'Please reload the page and try again.' };
  const elapsed = now - started;
  if (elapsed < 1500 || elapsed > 24 * 60 * 60 * 1000) {
    return { form: 'Please take a moment to review your details, then submit again.' };
  }
  return {};
}
