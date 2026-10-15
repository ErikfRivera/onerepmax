/** Show a short status message in the shared #toast element. */
export function toast(msg: string) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  window.setTimeout(() => t.classList.remove('show'), 1800);
}
