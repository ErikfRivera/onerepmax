/**
 * Testimonial carousel: auto-advances every 4.5s, loops, and pauses while the
 * user touches/hovers/focuses it, when it's off screen, when the tab is hidden,
 * or via the pause button (WCAG 2.2.2). Starts paused under reduced motion.
 */
const PAUSE = '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="3.5" y="2.5" width="3" height="11" rx="1"/><rect x="9.5" y="2.5" width="3" height="11" rx="1"/></svg>';
const PLAY = '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4.5 2.8v10.4a.8.8 0 0 0 1.2.7l8.3-5.2a.8.8 0 0 0 0-1.4L5.7 2.1a.8.8 0 0 0-1.2.7z"/></svg>';
const INTERVAL_MS = 4500;
const RESUME_AFTER_TOUCH_MS = 4000;

export function initCarousel() {
  const q = document.getElementById('quotes');
  const btn = document.getElementById('qplay');
  if (!q || !btn) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let paused = reduce;
  let hold = false;
  let visible = true;

  const cards = () => Array.from(q.children) as HTMLElement[];
  const offset = (el: HTMLElement) => el.offsetLeft - q.offsetLeft - 20;
  // On wide screens two cards show at once, so the last card can't snap to the start.
  const atEnd = () => q.scrollLeft >= q.scrollWidth - q.clientWidth - 2;
  const current = () => {
    if (atEnd()) return cards().length - 1;
    let best = 0, bd = Infinity;
    cards().forEach((c, i) => { const d = Math.abs(offset(c) - q.scrollLeft); if (d < bd) { bd = d; best = i; } });
    return best;
  };
  const syncDots = () => {
    const i = current();
    document.querySelectorAll('#dots i').forEach((d, j) => { d.className = j === i ? 'on' : ''; });
  };
  const syncBtn = () => {
    btn.innerHTML = paused ? PLAY : PAUSE;
    btn.setAttribute('aria-label', paused ? 'Play testimonials' : 'Pause testimonials');
  };
  const tick = () => {
    if (paused || hold || !visible || document.hidden || q.offsetParent === null) return;
    const next = cards()[atEnd() ? 0 : current() + 1];
    q.scrollTo({ left: offset(next), behavior: reduce ? 'auto' : 'smooth' });
  };

  q.addEventListener('scroll', syncDots, { passive: true });
  for (const ev of ['pointerdown', 'mouseenter', 'focusin']) q.addEventListener(ev, () => { hold = true; }, { passive: true });
  for (const ev of ['mouseleave', 'focusout']) q.addEventListener(ev, () => { hold = false; });
  q.addEventListener('pointerup', (e) => {
    if ((e as PointerEvent).pointerType !== 'mouse') window.setTimeout(() => { hold = false; }, RESUME_AFTER_TOUCH_MS);
  });
  btn.addEventListener('click', () => { paused = !paused; syncBtn(); });
  new IntersectionObserver((en) => { visible = en[0].isIntersecting; }, { threshold: 0.4 }).observe(q);

  syncBtn();
  syncDots();
  window.setInterval(tick, INTERVAL_MS);
}
