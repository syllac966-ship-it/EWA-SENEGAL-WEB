#!/usr/bin/env node
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve(process.cwd(), 'screenshots');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const TOKEN = process.env.EWA_DEMO_TOKEN || '';
if (!TOKEN) {
  console.error('Please set EWA_DEMO_TOKEN environment variable with a valid token.');
  process.exit(1);
}

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:5173');
  await page.evaluate((t) => localStorage.setItem('ewa_senegal_token', t), TOKEN);

  const pages = [
    { url: '/dashboard', name: 'dashboard' },
    { url: '/dashboard/advance', name: 'advance' },
    { url: '/dashboard/history', name: 'history' },
  ];

  // Desktop
  for (const p of pages) {
    await page.goto('http://localhost:5173' + p.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const file = path.join(OUT_DIR, `${p.name}-desktop.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log('Saved', file);
  }

  // Mobile (iPhone 8 / 375x667)
  await page.setViewportSize({ width: 375, height: 812 });
  for (const p of pages) {
    await page.goto('http://localhost:5173' + p.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const file = path.join(OUT_DIR, `${p.name}-mobile.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log('Saved', file);
  }

  await browser.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
import fs from "node:fs";
import path from "node:path";
import fetch from "node-fetch";
import { chromium } from "playwright";

const OUT = path.resolve(process.cwd(), "screenshots");
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

async function getToken() {
  const res = await fetch("http://localhost:4000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "aissatou.diop@ewa-senegal.sn", password: "Salarie@2024!" }),
  });
  if (!res.ok) throw new Error(`login failed ${res.status}`);
  const body = await res.json();
  return body.token;
}

async function capture() {
  const token = await getToken();
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // set token
  await page.goto("http://localhost:5173/login");
  await page.evaluate((t) => localStorage.setItem("ewa_senegal_token", t), token);

  const pages = ["/dashboard", "/dashboard/advance", "/dashboard/history"];

  // Desktop
  await page.setViewportSize({ width: 1280, height: 900 });
  for (const p of pages) {
    await page.goto(`http://localhost:5173${p}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const file = path.join(OUT, `desktop${p.replace(/\//g, "_")}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log("Wrote", file);
  }

  // Mobile 375px
  await page.setViewportSize({ width: 375, height: 812 });
  for (const p of pages) {
    await page.goto(`http://localhost:5173${p}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const file = path.join(OUT, `mobile${p.replace(/\//g, "_")}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log("Wrote", file);
  }

  await browser.close();
}

capture().catch((e) => {
  console.error(e);
  process.exit(1);
});
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
