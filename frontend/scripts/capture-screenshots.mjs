#!/usr/bin/env node
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT = path.resolve(process.cwd(), 'frontend', 'screenshots');
fs.mkdirSync(OUT, { recursive: true });

const TOKEN = process.env.EWA_DEMO_TOKEN ?? '';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  if (TOKEN) {
    await page.addInitScript((t) => localStorage.setItem('ewa_senegal_token', t), TOKEN);
  }

  const routes = [
    { url: 'http://localhost:5173/dashboard', name: 'dashboard-desktop' },
    { url: 'http://localhost:5173/dashboard/advance', name: 'advance-desktop' },
    { url: 'http://localhost:5173/dashboard/history', name: 'history-desktop' },
  ];

  for (const r of routes) {
    await page.goto(r.url, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(OUT, `${r.name}.png`), fullPage: true });
    console.log('Saved', r.name);
  }

  // mobile
  await page.setViewportSize({ width: 375, height: 812 });
  const routesM = [
    { url: 'http://localhost:5173/dashboard', name: 'dashboard-mobile' },
    { url: 'http://localhost:5173/dashboard/advance', name: 'advance-mobile' },
    { url: 'http://localhost:5173/dashboard/history', name: 'history-mobile' },
  ];
  for (const r of routesM) {
    await page.goto(r.url, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(OUT, `${r.name}.png`), fullPage: true });
    console.log('Saved', r.name);
  }

  await browser.close();
  console.log('All done. Screenshots in frontend/screenshots/');
})();
