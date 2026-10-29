// Browser-side event helper. Events go to window.dataLayer (for Google Tag Manager)
// and to gtag when Google Analytics is loaded. Analytics must never break the page.

type EventParams = Record<string, string | number | boolean>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params: EventParams = {}): void {
  try {
    if (typeof window === 'undefined') return;
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({ event: name, ...params });
    if (typeof window.gtag === 'function') window.gtag('event', name, params);
  } catch {
    /* ignore: analytics is best-effort */
  }
}
