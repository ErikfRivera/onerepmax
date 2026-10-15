#!/usr/bin/env node
/**
 * Render scripts/og/og.html to public/og.png (1200×630) with headless Chrome.
 * No npm dependency: uses the Chrome/Chromium found via $CHROME, Playwright's
 * browser folder, or a browser on $PATH. Run: npm run og:image
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '../..');
const html = pathToFileURL(join(root, 'scripts/og/og.html')).href;
const out = join(root, 'public/og.png');

function findChrome() {
  if (process.env.CHROME && existsSync(process.env.CHROME)) return process.env.CHROME;
  const pw = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (pw && existsSync(pw)) {
    for (const dir of readdirSync(pw).filter((d) => d.startsWith('chromium-')).sort().reverse()) {
      const bin = join(pw, dir, 'chrome-linux', 'chrome');
      if (existsSync(bin)) return bin;
    }
  }
  for (const name of ['google-chrome', 'chromium', 'chromium-browser']) {
    try { return execFileSync('which', [name]).toString().trim(); } catch { /* next */ }
  }
  throw new Error('No Chrome found. Set CHROME=/path/to/chrome and rerun.');
}

const chrome = findChrome();
execFileSync(chrome, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
  '--window-size=1200,630', '--force-device-scale-factor=1',
  '--virtual-time-budget=4000', // let web fonts load; falls back to system fonts if offline
  `--screenshot=${out}`, html,
], { stdio: 'inherit' });
console.log(`Wrote ${out}`);
