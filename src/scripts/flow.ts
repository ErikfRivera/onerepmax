/**
 * The calculator flow. Step 1 (lift picker) is static HTML in index.astro;
 * this module takes over from the first tap and renders steps 2–5, the
 * calculating beat and the results into #flow.
 */
import { LIFTS, RIR, AGE_BANDS, SEXES, type LiftId } from '../data/flow';
import {
  estimate, trainingTable, roundTo, convertWeight, convertBodyweight, weightWarning, fmt, type Unit,
} from '../lib/onerm';

type Screen = 'input' | 'loading' | 'result';
interface State {
  step: number; dir: 1 | -1; screen: Screen;
  lift: LiftId | null; reps: number | null; rir: number | null;
  weight: string; unit: Unit;
  sex: (typeof SEXES)[number] | null; band: string | null; bw: string;
  compare: boolean;
}

const S: State = {
  step: 1, dir: 1, screen: 'input', lift: null, reps: null, rir: null,
  weight: '', unit: 'lb', sex: null, band: null, bw: '', compare: true,
};

let landing: HTMLElement, flow: HTMLElement, footer: HTMLElement;
let timer: number | undefined;
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const ICON = {
  back: '<svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3L5 8l5 5"/></svg>',
  minus: '<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M3 8h10"/></svg>',
  plus: '<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M3 8h10M8 3v10"/></svg>',
  arrow: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9h12M10 4l5 5-5 5"/></svg>',
  pen: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="opacity:.6"><path d="M11 2.5l2.5 2.5L6 12.5H3.5V10z"/></svg>',
};

const num = (v: string) => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
const lift = () => LIFTS.find((l) => l.id === S.lift) ?? LIFTS[0];
const compareReady = () => !!(S.sex && S.band && num(S.bw) > 0);
const calc = () => estimate(num(S.weight), S.reps ?? 1, S.rir ?? 0);

/* ---------- navigation ---------- */

function go(step: number) {
  window.clearTimeout(timer);
  S.dir = step >= S.step ? 1 : -1;
  S.step = step;
  S.screen = 'input';
  render();
}

function pickThenAdvance(patch: Partial<State>) {
  Object.assign(S, patch);
  render(true);
  window.clearTimeout(timer);
  timer = window.setTimeout(() => go(Math.min(5, S.step + 1)), 180);
}

function calculate() {
  S.screen = 'loading';
  render();
  window.clearTimeout(timer);
  timer = window.setTimeout(() => { S.screen = 'result'; S.dir = 1; render(); }, reduceMotion() ? 200 : 900);
}

/* ---------- templates ---------- */

function chip(text: string, step: number, aria: string) {
  return `<button class="chip" data-go="${step}" aria-label="${aria}: ${text}">${text}${ICON.pen}</button>`;
}

function chrome() {
  let segs = '';
  for (let i = 1; i <= 5; i++) segs += `<i class="${i <= S.step ? 'on' : ''}"></i>`;
  let chips = '';
  if (S.step > 1 && S.lift) chips += chip(S.lift, 1, 'Change lift');
  if (S.step > 2 && S.reps) chips += chip(`${S.reps} ${S.reps === 1 ? 'rep' : 'reps'}`, 2, 'Change reps');
  if (S.step > 3 && S.rir !== null) chips += chip(RIR[S.rir].short, 3, 'Change effort');
  if (S.step > 4 && num(S.weight)) chips += chip(`${S.weight} ${S.unit}`, 4, 'Change weight');
  return `<div class="top"><button class="icon-btn" data-act="back" aria-label="Back">${ICON.back}</button>
    <div class="progress" role="progressbar" aria-label="Progress" aria-valuemin="1" aria-valuemax="5" aria-valuenow="${S.step}">${segs}</div>
    <div class="count">${S.step}/5</div></div>
    <div class="chips">${chips}</div>`;
}

const screenOpen = () => `<div class="screen ${S.dir > 0 ? 'enter' : 'enter-back'}">`;

function step2() {
  let t = '';
  for (let n = 1; n <= 10; n++) {
    t += `<button class="tile rep" data-reps="${n}" aria-pressed="${S.reps === n}" aria-label="${n} ${n === 1 ? 'rep' : 'reps'}">${n}</button>`;
  }
  return `${screenOpen()}${chrome()}
    <div><h2 class="q">How many reps did you get?</h2><p class="q-sub">Pick a recent set of 1 to 10.<br>Sets of 2 to 6 give you the most accurate max.</p></div>
    <div class="rep-grid">${t}</div></div>`;
}

function step3() {
  const t = RIR.map((r) => `<button class="tile rir" data-rir="${r.v}" aria-pressed="${S.rir === r.v}">
      <span><strong>${r.title}</strong><small>${r.sub}</small></span><span class="radio" aria-hidden="true"></span></button>`).join('');
  return `${screenOpen()}${chrome()}
    <div><h2 class="q">How close to failure was it?</h2><p class="q-sub">Be honest. Reps left in the tank change your max.</p></div>
    <div class="rir-list">${t}</div></div>`;
}

function step4() {
  const w = num(S.weight);
  return `${screenOpen()}${chrome()}
    <div><h2 class="q">How much was on the bar?</h2><p class="q-sub">Include the bar itself: 45 lb or 20 kg.</p></div>
    <div class="panel">
      <div class="stepper"><button class="step-btn" data-act="wdown" aria-label="Decrease weight">${ICON.minus}</button>
        <label class="big-num"><input id="weight" inputmode="decimal" autocomplete="off" aria-label="Weight on the bar in ${S.unit}" value="${S.weight}"><span>${S.unit}</span></label>
        <button class="step-btn" data-act="wup" aria-label="Increase weight">${ICON.plus}</button></div>
      <div class="seg two" role="group" aria-label="Units">
        <button data-unit="lb" aria-pressed="${S.unit === 'lb'}">lb</button><button data-unit="kg" aria-pressed="${S.unit === 'kg'}">kg</button>
      </div>
    </div>
    <p class="hint" id="whint">${weightWarning(w, S.unit)}</p>
    <div class="actions"><button class="primary" data-act="next" id="next"${w > 0 ? '' : ' disabled'}>Continue${ICON.arrow}</button></div></div>`;
}

function step5() {
  const sexes = SEXES.map((x) => `<button data-sex="${x}" aria-pressed="${S.sex === x}" style="font-size:13px">${x}</button>`).join('');
  const bands = AGE_BANDS.map(([b]) => `<button class="tile band" data-band="${b}" aria-pressed="${S.band === b}">${b}</button>`).join('');
  const bname = AGE_BANDS.find(([b]) => b === S.band)?.[1] ?? '';
  return `${screenOpen()}${chrome()}
    <div><h2 class="q">Last one: who should we compare you with?</h2><p class="q-sub">We rank you against lifters like you.</p></div>
    <div class="field"><span class="label" id="sexlbl">Sex</span><div class="seg three" role="group" aria-labelledby="sexlbl">${sexes}</div></div>
    <div class="field"><div class="label-row"><span class="label" id="agelbl">Age group</span><em>${bname}</em></div>
      <div class="band-grid" role="group" aria-labelledby="agelbl">${bands}</div></div>
    <div class="field"><label class="label" for="bw">Bodyweight</label><div class="bw">
      <button class="step-btn sm" data-act="bwdown" aria-label="Decrease bodyweight">${ICON.minus}</button>
      <div class="bw-box"><input id="bw" inputmode="decimal" autocomplete="off" placeholder="${S.unit === 'lb' ? '180' : '82'}" value="${S.bw}"><span>${S.unit}</span></div>
      <button class="step-btn sm" data-act="bwup" aria-label="Increase bodyweight">${ICON.plus}</button></div></div>
    <div class="actions"><button class="primary" data-act="calc" id="calc"${compareReady() ? '' : ' disabled'}>Calculate my max${ICON.arrow}</button>
      <button class="link-btn" data-act="skip">Skip, just show my max</button></div></div>`;
}

function loading() {
  return `<div class="loading"><div class="meta">${lift().title}, ${S.weight} ${S.unit} × ${S.reps}</div><h2>Calculating</h2>
    <div class="bar"><div class="bar-fill"></div></div><div class="meta" style="font-weight:500">Running Epley and Brzycki</div></div>`;
}

function results() {
  const l = lift();
  const c = calc();
  const rows = trainingTable(c.max, S.unit)
    .map((r) => `<tr><td>${r.pct}%</td><td>${r.weight} ${S.unit}</td><td>${r.reps}</td></tr>`).join('');
  const rirNote = S.rir ? `, adjusted for ${S.rir === 3 ? '3+' : S.rir} in reserve` : '';
  const who = S.sex === 'Male' ? 'men' : S.sex === 'Female' ? 'women' : 'lifters';
  // TODO(data): replace the [62%] placeholder with a real percentile lookup (see docs/PRD.md).
  const rank = S.compare && compareReady()
    ? `<div class="panel"><div class="rank">Stronger than <mark>[62%]</mark> of ${who} aged ${S.band} at ${S.bw} ${S.unit}</div>
        <div class="scale"><div class="scale-bars"><i style="background:#E6E2DA"></i><i style="background:#D6D0C4"></i><i style="background:#B8B0A1"></i><i style="background:#7E776A"></i><i style="background:#3D3A33"></i></div><div class="marker" style="left:62%"></div></div>
        <div class="scale-labels"><span>Beginner</span><span>Novice</span><span>Intermed.</span><span>Advanced</span><span>Elite</span></div>
        <p class="src">Based on [n] raw lifts from [SOURCE], [date range].</p></div>`
    : `<div class="panel"><div class="rank" style="font-size:18px">Where does ${c.max} ${S.unit} rank?</div>
        <p class="src" style="font-size:14px;color:var(--body)">Add sex, age group and bodyweight to compare against lifters like you.</p>
        <button class="accent-btn" data-act="rank">See my ranking</button></div>`;
  return `<div class="results">
    <div class="res-top"><button data-act="edit">${ICON.back}${l.title}, ${S.weight} ${S.unit} × ${S.reps}</button>
      <button data-act="edit" style="text-decoration:underline;text-underline-offset:3px">Edit</button></div>
    <div class="res">
      <section><div class="kicker">Your estimated ${l.label} max</div>
        <div class="max"><b>${c.max}</b><span>${S.unit}</span></div>
        <div class="formula">Epley ${c.epley}, Brzycki ${c.brzycki}. Average shown${rirNote}.</div>${rank}</section>
      <section><div class="sec-head"><h3>Training weights</h3><span>rounded to ${roundTo(S.unit)} ${S.unit}</span></div>
        <div class="table-wrap"><table><thead><tr><th>% of max</th><th>Weight</th><th>Reps</th></tr></thead><tbody>${rows}</tbody></table></div></section>
      <section><h3>Share your max</h3>
        <div class="share-card"><div class="t">${l.title} one-rep max</div><div class="n"><b>${c.max}</b><span>${S.unit}</span></div>
          <div class="f"><span>${S.weight} × ${S.reps}</span><strong>[yourdomain].com/1rm</strong></div></div>
        <button class="primary" data-act="share">Share my max</button></section>
      <button class="secondary" data-act="again">Calculate another lift</button>
    </div></div>`;
}

/* ---------- render ---------- */

function render(noAnim = false) {
  const onLanding = S.screen === 'input' && S.step === 1;
  landing.hidden = !onLanding;
  flow.hidden = onLanding;
  footer.hidden = !(onLanding || S.screen === 'result');

  if (onLanding) {
    flow.innerHTML = '';
    landing.querySelectorAll<HTMLButtonElement>('[data-lift]').forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.lift === S.lift)));
  } else {
    const views: Record<number, () => string> = { 2: step2, 3: step3, 4: step4, 5: step5 };
    flow.innerHTML = S.screen === 'loading' ? loading() : S.screen === 'result' ? results() : views[S.step]();
    if (noAnim) flow.querySelector('.screen')?.classList.remove('enter', 'enter-back');
  }
  if (!noAnim) window.scrollTo(0, 0);
}

/* ---------- events ---------- */

function setUnit(to: Unit) {
  if (to === S.unit) return;
  const w = num(S.weight), b = num(S.bw);
  if (w) S.weight = fmt(convertWeight(w, to));
  if (b) S.bw = fmt(convertBodyweight(b, to));
  S.unit = to;
  render(true);
}

async function share() {
  const c = calc();
  const text = `My estimated ${lift().label} max: ${c.max} ${S.unit} (${S.weight} × ${S.reps}). Find yours:`;
  try {
    if (navigator.share) { await navigator.share({ title: 'One-Rep Max Calculator', text, url: location.href }); return; }
    await navigator.clipboard.writeText(`${text} ${location.href}`);
    toast('Copied to clipboard');
  } catch { /* user cancelled the share sheet */ }
}

function toast(msg: string) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  window.setTimeout(() => t.classList.remove('show'), 1800);
}

function onClick(e: Event) {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
  if (!b) return;
  const d = b.dataset;
  if (d.lift) {
    const l = LIFTS.find((x) => x.id === d.lift)!;
    const patch: Partial<State> = { lift: l.id };
    if (!S.weight) patch.weight = S.unit === 'lb' ? String(l.defaultLb) : fmt(convertWeight(l.defaultLb, 'kg'));
    pickThenAdvance(patch);
    return;
  }
  if (d.reps) return pickThenAdvance({ reps: +d.reps });
  if (d.rir) return pickThenAdvance({ rir: +d.rir });
  if (d.go) return go(+d.go);
  if (d.unit) return setUnit(d.unit as Unit);
  if (d.sex) { S.sex = d.sex as State['sex']; return render(true); }
  if (d.band) { S.band = d.band; return render(true); }

  const w = num(S.weight), bw = num(S.bw), step = roundTo(S.unit), bwStep = S.unit === 'lb' ? 1 : 0.5;
  switch (d.act) {
    case 'back': go(Math.max(1, S.step - 1)); break;
    case 'wup': S.weight = fmt(w + step); render(true); break;
    case 'wdown': S.weight = fmt(Math.max(0, w - step)); render(true); break;
    case 'bwup': S.bw = fmt((bw || (S.unit === 'lb' ? 179 : 81.5)) + bwStep); render(true); break;
    case 'bwdown': S.bw = fmt(Math.max(0, (bw || (S.unit === 'lb' ? 181 : 82.5)) - bwStep)); render(true); break;
    case 'next': if (w > 0) go(5); break;
    case 'calc': if (compareReady()) { S.compare = true; calculate(); } break;
    case 'skip': S.compare = false; calculate(); break;
    case 'edit': case 'rank': S.compare = true; S.dir = -1; go(5); break;
    case 'again': S.reps = null; S.rir = null; S.dir = -1; go(1); break;
    case 'share': void share(); break;
  }
}

function onInput(e: Event) {
  const t = e.target as HTMLInputElement;
  if (t.id === 'weight') {
    S.weight = t.value.replace(/[^0-9.]/g, '').slice(0, 6);
    if (t.value !== S.weight) t.value = S.weight;
    const next = document.getElementById('next') as HTMLButtonElement | null;
    if (next) next.disabled = !(num(S.weight) > 0);
    const hint = document.getElementById('whint');
    if (hint) hint.textContent = weightWarning(num(S.weight), S.unit);
  }
  if (t.id === 'bw') {
    S.bw = t.value.replace(/[^0-9.]/g, '').slice(0, 5);
    if (t.value !== S.bw) t.value = S.bw;
    const c = document.getElementById('calc') as HTMLButtonElement | null;
    if (c) c.disabled = !compareReady();
  }
}

function onKeydown(e: KeyboardEvent) {
  const t = e.target as HTMLInputElement;
  if (e.key !== 'Enter') return;
  if (t.id === 'weight' && num(S.weight) > 0) { t.blur(); go(5); }
  if (t.id === 'bw' && compareReady()) { t.blur(); S.compare = true; calculate(); }
}

export function initFlow() {
  landing = document.getElementById('landing')!;
  flow = document.getElementById('flow')!;
  footer = document.getElementById('site-footer')!;
  for (const el of [landing, flow]) {
    el.addEventListener('click', onClick);
    el.addEventListener('input', onInput);
    el.addEventListener('keydown', onKeydown);
  }
}
