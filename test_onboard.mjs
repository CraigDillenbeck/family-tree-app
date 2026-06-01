import { chromium } from '@playwright/test';

const BASE = 'http://localhost:5173';
const EMAIL = 'prosapiamtestemail@gmail.com';
const PASSWORD = 'P@$$word';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(e.message));

async function shot(name) {
  await page.screenshot({ path: `/tmp/onboard_${name}.png` });
  console.log(`[screenshot] ${name}`);
}

// Sign in
console.log('--- [1] sign in');
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', EMAIL);
await page.fill('input[type="password"]', PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL(/\/dashboard/, { timeout: 10000 });
console.log('Signed in, on dashboard');

// Navigate to onboarding (test user has no trees → load should show onboarding)
console.log('--- [2] navigate to /onboarding');
await page.goto(`${BASE}/onboarding`, { waitUntil: 'networkidle' });
console.log('URL:', page.url());
await shot('01_welcome');

const h1 = await page.textContent('h1');
console.log('h1:', h1);

// Step 2: Begin with yourself
console.log('--- [3] click "Begin with yourself"');
await page.click('button:has-text("Begin with yourself")');
await page.waitForTimeout(500);
await shot('02_begin');
const step2h1 = await page.textContent('h1');
console.log('Step 2 h1:', step2h1);

// Validation: submit empty
console.log('--- [4] empty-name validation');
await page.click('button[type="submit"]');
await page.waitForTimeout(300);
const valMsg = await page.textContent('.msg').catch(() => null);
console.log('Validation message:', valMsg);
await shot('03_validation');

// Fill form
console.log('--- [5] fill form');
await page.fill('input[name="firstName"]', 'Test');
await page.fill('input[name="lastName"]', 'User');
await page.fill('input[name="birthYear"]', '1990');
await page.fill('input[name="birthplace"]', 'San Francisco, CA');
await page.waitForTimeout(300);
await shot('04_form_filled');

// Submit
console.log('--- [6] submit form');
await page.click('button[type="submit"]');
await page.waitForFunction(
  () => document.querySelector('h1')?.textContent?.includes('begun'),
  { timeout: 12000 }
).catch(async () => {
  console.log('Timeout waiting for success — current URL:', page.url());
  const body = await page.textContent('body').catch(() => '');
  console.log('Page snippet:', body.slice(0, 300));
  await shot('submit_failure');
});
await shot('05_success');
console.log('Success h1:', await page.textContent('h1').catch(() => 'n/a'));

// Navigate to tree
console.log('--- [7] take me to my tree');
const treeBtn = await page.locator('button:has-text("Take me to my tree")');
await treeBtn.click();
await page.waitForURL(/\/trees\//, { timeout: 10000 });
console.log('Tree URL:', page.url());
await shot('06_tree');

// Mobile: sign in and go to onboarding — should now skip (has trees)
console.log('--- [8] mobile — returning user skips onboarding');
const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mobile = await mobileCtx.newPage();
await mobile.goto(`${BASE}/onboarding`, { waitUntil: 'networkidle' });
console.log('Mobile /onboarding URL (expect /login or /dashboard):', mobile.url());
await mobile.screenshot({ path: '/tmp/onboard_07_mobile.png' });
console.log('[screenshot] 07_mobile');

console.log('\n=== Console errors:', errors.length ? errors : 'none');
await browser.close();
process.exit(0);
