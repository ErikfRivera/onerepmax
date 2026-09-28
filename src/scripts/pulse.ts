/**
 * Live activity layer: the "lifters here now" line in the lift picker, the
 * "Happening now" feed, and the notification pop-ups.
 *
 * TEST DATA ONLY (see src/data/pulse.ts). Everything is generated in the browser,
 * localized to the visitor's market from their time zone and language.
 *
 * The pop-ups only show on the landing page, never over the flow. On phones they
 * wait until the lift picker has scrolled out of view so they never cover Continue.
 * They pause while hovered or focused, and the close button hides them for the
 * session. The feed has its own pause button (WCAG 2.2.2).
 */
import { LIFTS } from '../data/flow';
import { PULSE_DEMO } from '../data/pulse';
import { createPulse, detectMarket, timeAgo, type PulseActivity, type PulseToast } from '../lib/pulse';

const FEED_SIZE = 6;
const TOAST_SHOW_MS = 6000;
const DISMISS_KEY = 'pulse-toast-off';
const CLOSE = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M3 3l8 8M11 3l-8 8"/></svg>';

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]!);
const fmt = (n: number) => n.toLocaleString('en-US');

function readDismissed() {
  try { return sessionStorage.getItem(DISMISS_KEY) === '1'; } catch { return false; }
}
function saveDismissed() {
  try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch { /* private mode: hide for this page view only */ }
}

export function initPulse() {
  if (!PULSE_DEMO) return;
  const landing = document.getElementById('landing');
  const section = document.getElementById('happening');
  const feed = document.querySelector<HTMLElement>('[data-pulse-feed]');
  if (!landing || !section || !feed) return;

  let timeZone: string | undefined;
  try { timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { /* fall back to language */ }
  const pulse = createPulse(detectMarket(timeZone, navigator.languages?.length ? navigator.languages : [navigator.language]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = matchMedia('(max-width: 759px)');
  const onLanding = () => !landing.hidden && !document.hidden;

  /* ---------- counts ---------- */
  const syncCounts = () => {
    document.querySelectorAll('[data-stat="now"]').forEach((el) => { el.textContent = fmt(pulse.hereNow); });
    document.querySelectorAll('[data-stat="today"]').forEach((el) => { el.textContent = fmt(pulse.today); });
  };
  document.querySelector<HTMLElement>('[data-pulse-live]')!.hidden = false;
  document.querySelector<HTMLElement>('[data-note-long]')!.hidden = true;
  document.querySelector<HTMLElement>('[data-note-short]')!.hidden = false;

  /* ---------- feed ---------- */
  const liftName = (id: string) => LIFTS.find((l) => l.id === id)!.title;
  const row = (a: PulseActivity, fresh = false) =>
    `<li${fresh && !reduce ? ' class="new"' : ''}><span class="ic" aria-hidden="true">${a.lift[0]}</span>` +
    `<span><span class="what">${liftName(a.lift)} <em>· ${a.reps} rep${a.reps === 1 ? '' : 's'}</em></span>` +
    `<span class="where">A lifter in ${esc(a.city)}</span></span>` +
    `<time datetime="${new Date(a.at).toISOString()}" data-at="${a.at}">${timeAgo(Date.now() - a.at)}</time></li>`;
  const syncTimes = () => feed.querySelectorAll<HTMLTimeElement>('time[data-at]').forEach((t) => {
    t.textContent = timeAgo(Date.now() - Number(t.dataset.at));
  });

  // Seed with a recent history, newest first.
  const seed: PulseActivity[] = [];
  let at = Date.now() - rand(5_000, 40_000);
  for (let i = 0; i < FEED_SIZE; i++) { seed.push(pulse.activity(at)); at -= rand(35_000, 110_000); }
  feed.innerHTML = seed.map((a) => row(a)).join('');

  let feedPaused = false;
  const toggle = section.querySelector<HTMLButtonElement>('[data-pulse-toggle]')!;
  const toggleLabel = section.querySelector<HTMLElement>('[data-pulse-toggle-label]')!;
  toggle.addEventListener('click', () => {
    feedPaused = !feedPaused;
    toggle.setAttribute('aria-pressed', String(feedPaused));
    toggle.setAttribute('aria-label', feedPaused ? 'Resume live updates' : 'Pause live updates');
    toggleLabel.textContent = feedPaused ? 'Paused' : 'Live';
    section.classList.toggle('paused', feedPaused);
  });

  const addActivity = () => {
    if (!feedPaused && onLanding()) {
      feed.insertAdjacentHTML('afterbegin', row(pulse.activity(Date.now()), true));
      while (feed.children.length > FEED_SIZE) feed.lastElementChild!.remove();
      syncCounts();
    }
    window.setTimeout(addActivity, rand(6_000, 13_000));
  };

  section.hidden = false;
  syncCounts();
  window.setTimeout(addActivity, rand(4_000, 9_000));
  window.setInterval(syncTimes, 20_000);
  window.setInterval(() => { pulse.drift(); syncCounts(); }, 15_000);

  /* ---------- notifications ---------- */
  if (readDismissed()) return;

  const toast = document.createElement('aside');
  toast.className = 'pulse-toast';
  toast.setAttribute('aria-label', 'Recent activity');
  toast.hidden = true;
  document.body.appendChild(toast);

  let pickerInView = true;
  const picker = document.querySelector('.lift-picker');
  if (picker) new IntersectionObserver((en) => {
    pickerInView = en[0].isIntersecting;
    if (pickerInView && phone.matches) hide();
  }).observe(picker);

  let hold = false;
  let dismissed = false;
  toast.addEventListener('mouseenter', () => { hold = true; });
  toast.addEventListener('mouseleave', () => { hold = false; });
  toast.addEventListener('focusin', () => { hold = true; });
  toast.addEventListener('focusout', () => { hold = false; });

  const render = (t: PulseToast) => {
    toast.innerHTML =
      `<span class="pt-badge" aria-hidden="true"><b${t.badge[0].length > 3 ? ' class="long"' : ''}>${esc(t.badge[0])}</b><small>${esc(t.badge[1])}</small></span>` +
      `<div class="pt-body"><p><strong>${esc(t.lead)}</strong> ${esc(t.rest)}</p>` +
      `<div class="pt-meta"><span class="live-dot" aria-hidden="true"></span>${esc(t.meta)}</div></div>` +
      `<button type="button" class="pt-x" aria-label="Hide live activity">${CLOSE}</button>`;
    toast.querySelector('.pt-x')!.addEventListener('click', () => {
      dismissed = true;
      saveDismissed();
      hide();
    });
  };

  const canShow = () => !dismissed && onLanding() && !(phone.matches && pickerInView);
  const show = () => {
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add('show'));
  };
  const hide = () => {
    toast.classList.remove('show');
    window.setTimeout(() => { if (!toast.classList.contains('show')) toast.hidden = true; }, reduce ? 0 : 300);
  };

  const cycle = () => {
    if (dismissed) return;
    if (!canShow()) { window.setTimeout(cycle, 1500); return; }
    render(pulse.nextToast());
    show();
    const close = () => {
      if (dismissed) return;
      // Keep it up while the visitor is reading or tabbing through it.
      if (hold) { window.setTimeout(close, 1000); return; }
      hide();
      window.setTimeout(cycle, rand(7_000, 13_000));
    };
    window.setTimeout(close, TOAST_SHOW_MS);
  };
  // Also take it down right away if the visitor starts the flow.
  new MutationObserver(() => { if (landing.hidden) hide(); }).observe(landing, { attributes: true, attributeFilter: ['hidden'] });

  window.setTimeout(cycle, rand(4_000, 8_000));
}
