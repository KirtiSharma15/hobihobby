const TOAST_CLASS =
  'fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-lg';

export function showToast(message: string, durationMs = 3000): void {
  const toast = document.createElement('div');
  toast.className = TOAST_CLASS;
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  document.body.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, durationMs);
}
