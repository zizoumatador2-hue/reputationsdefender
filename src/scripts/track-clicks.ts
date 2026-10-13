import { trackEvent } from '../lib/analytics';

// Any element with data-track="label" reports a click. Keeps tracking out of markup logic.
document.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-track]') : null;
  if (!target) return;
  trackEvent('cta_click', {
    label: target.dataset.track ?? '',
    href: target.getAttribute('href') ?? '',
    page: location.pathname
  });
});
