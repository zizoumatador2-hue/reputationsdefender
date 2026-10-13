// Shared helpers for the scan and contact forms: field errors, status messages, and submission.

export interface SubmitResult {
  ok: boolean;
  status: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  errors: Record<string, string>;
}

export function clearFormErrors(form: HTMLFormElement): void {
  form.querySelectorAll<HTMLElement>('[data-error-for]').forEach((el) => {
    el.textContent = '';
    el.hidden = true;
  });
  form.querySelectorAll<HTMLElement>('[aria-invalid="true"]').forEach((el) => el.removeAttribute('aria-invalid'));
  showStatus(form, '', 'error');
}

export function showStatus(form: HTMLFormElement, message: string, kind: 'error' | 'info'): void {
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  if (!status) return;
  status.textContent = message;
  status.dataset.kind = kind;
  status.hidden = message === '';
}

export function showFieldErrors(form: HTMLFormElement, errors: Record<string, string>): void {
  let first: HTMLElement | null = null;
  for (const [name, message] of Object.entries(errors)) {
    if (name === 'form') {
      showStatus(form, message, 'error');
      continue;
    }
    const field = form.elements.namedItem(name) as HTMLElement | null;
    const errorEl = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
    if (field) field.setAttribute('aria-invalid', 'true');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    }
    first ??= field;
  }
  first?.focus();
}

export function setBusy(button: HTMLButtonElement | null, busy: boolean, busyLabel = 'Sending…'): void {
  if (!button) return;
  if (busy) {
    button.dataset.label = button.textContent ?? '';
    button.textContent = busyLabel;
  } else if (button.dataset.label) {
    button.textContent = button.dataset.label;
  }
  button.disabled = busy;
  button.setAttribute('aria-busy', String(busy));
}

export async function submitForm(url: string, form: HTMLFormElement): Promise<SubmitResult> {
  try {
    const res = await fetch(url, { method: 'POST', body: new FormData(form) });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok && data.ok === true, status: res.status, data, errors: data.errors ?? {} };
  } catch {
    return {
      ok: false,
      status: 0,
      data: {},
      errors: { form: 'We could not reach the server. Check your connection and try again.' }
    };
  }
}
