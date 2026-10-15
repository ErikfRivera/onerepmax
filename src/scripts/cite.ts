import { toast } from './toast';

/** "Copy citation" / "Copy link HTML" buttons in Cite.astro. */
export function initCite() {
  document.querySelectorAll<HTMLButtonElement>('button[data-copy]').forEach((b) => {
    b.addEventListener('click', async () => {
      const el = document.getElementById(b.dataset.copy ?? '');
      if (!el) return;
      try {
        await navigator.clipboard.writeText(el.textContent ?? '');
        toast('Copied');
      } catch {
        toast('Couldn’t copy. Select the text instead.');
      }
    });
  });
}
