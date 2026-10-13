import { trackEvent } from '../lib/analytics';
import { clearFormErrors, showFieldErrors, showStatus, setBusy, submitForm } from './forms';
import { validateContact } from '../lib/validation';

const form = document.getElementById('contact-form') as HTMLFormElement | null;

if (form) {
  const params = new URLSearchParams(location.search);
  const topic = params.get('topic');
  const plan = params.get('plan');
  const topicSelect = form.elements.namedItem('topic') as HTMLSelectElement | null;
  if (topicSelect && topic && [...topicSelect.options].some((o) => o.value === topic)) topicSelect.value = topic;
  const planInput = form.elements.namedItem('plan') as HTMLInputElement | null;
  if (planInput && plan) planInput.value = plan.slice(0, 40);
  const startedInput = form.querySelector<HTMLInputElement>('input[name="startedAt"]');
  if (startedInput) startedInput.value = String(Date.now());

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFormErrors(form);
    const check = validateContact(Object.fromEntries(new FormData(form).entries()));
    if (!check.ok) {
      showFieldErrors(form, check.errors);
      return;
    }
    const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    setBusy(submit, true);
    const result = await submitForm('/api/contact', form);
    setBusy(submit, false);

    if (result.ok) {
      trackEvent('contact_submit', { topic: check.value.topic });
      const box = document.createElement('div');
      box.className = 'card form-success';
      box.setAttribute('role', 'status');
      box.textContent = result.data.message ?? 'Thanks. We will reply by email.';
      form.replaceWith(box);
      return;
    }
    if (result.data.message) showStatus(form, result.data.message, 'error');
    showFieldErrors(form, result.errors);
  });
}
