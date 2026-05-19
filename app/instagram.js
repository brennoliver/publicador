/**
 * Instagram Playwright automation module
 * Handles: login (manual via visible browser), publish (image, carousel, reels, stories)
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const IG_URL = 'https://www.instagram.com';

// ── Browser helpers ────────────────────────────────────────────────

async function launchBrowser(sessionFile, headless = false) {
  const storageState = fs.existsSync(sessionFile)
    ? JSON.parse(fs.readFileSync(sessionFile, 'utf8'))
    : undefined;

  const browser = await chromium.launch({
    headless,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
  });

  const context = await browser.newContext({
    storageState,
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'pt-BR',
  });

  return { browser, context };
}

async function saveSession(context, sessionFile) {
  const state = await context.storageState();
  fs.mkdirSync(path.dirname(sessionFile), { recursive: true });
  fs.writeFileSync(sessionFile, JSON.stringify(state, null, 2));
}

// ── Login ──────────────────────────────────────────────────────────

/**
 * Open visible browser for manual Instagram login.
 * Waits until user is logged in (detects home feed), then saves session.
 */
export async function login(client, sessionFile) {
  console.log(`[login] Opening browser for: ${client.name}`);
  const { browser, context } = await launchBrowser(sessionFile, false);
  const page = await context.newPage();

  await page.goto(`${IG_URL}/accounts/login/`, { waitUntil: 'domcontentloaded' });

  // Show guidance overlay on the page
  await page.evaluate((name) => {
    const div = document.createElement('div');
    div.style.cssText = `
      position: fixed; top: 16px; right: 16px; z-index: 99999;
      background: #1a1a1a; border: 2px solid #e8000e; border-radius: 12px;
      padding: 14px 18px; color: #fff; font-family: system-ui; font-size: 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5); max-width: 280px; line-height: 1.5;
    `;
    div.innerHTML = `
      <div style="font-weight:700;color:#e8000e;margin-bottom:6px">📤 BM Mídia</div>
      <div>Conectando: <strong>${name}</strong></div>
      <div style="margin-top:8px;color:#aaa;font-size:12px">Faça login normalmente. A sessão será salva automaticamente após o login.</div>
    `;
    document.body.appendChild(div);
  }, client.name);

  console.log(`[login] Waiting for user to log in…`);

  // Wait until Instagram home feed is visible (means login succeeded)
  try {
    await page.waitForURL(/instagram\.com\/(reels|explore|accounts\/onetap|\?next|$)/, {
      timeout: 300_000, // 5 minutes
    });

    // Small wait for session cookies to settle
    await page.waitForTimeout(3000);
    await saveSession(context, sessionFile);
    console.log(`[login] Session saved for ${client.name}`);
  } catch (err) {
    console.error(`[login] Timeout or error: ${err.message}`);
  } finally {
    await browser.close();
  }
}

// ── Session check ──────────────────────────────────────────────────

export async function getSessionStatus(slug, sessionFile) {
  if (!fs.existsSync(sessionFile)) return false;

  let browser, context;
  try {
    ({ browser, context } = await launchBrowser(sessionFile, true));
    const page = await context.newPage();
    await page.goto(`${IG_URL}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Check if logged in by looking for the home feed nav
    const loggedIn = await page.evaluate(() => {
      return document.cookie.includes('sessionid') ||
        !!document.querySelector('[aria-label="Home"]') ||
        !!document.querySelector('svg[aria-label="Home"]') ||
        window.location.pathname === '/';
    });

    return loggedIn;
  } catch {
    return false;
  } finally {
    if (browser) await browser.close();
  }
}

// ── Publish ────────────────────────────────────────────────────────

/**
 * Publish a post to Instagram via Playwright browser automation.
 * Supports: image, carousel, reels, stories
 */
export async function publishPost({ client, sessionFile, format, filePaths, caption }) {
  console.log(`[publish] Starting for ${client.name} — format: ${format}`);

  // Headless em produção (Railway), visível localmente para debug
  const headless = process.env.NODE_ENV === 'production';
  const { browser, context } = await launchBrowser(sessionFile, headless);
  const page = await context.newPage();

  try {
    // Go to Instagram
    await page.goto(`${IG_URL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Check login status
    const loginPage = await page.evaluate(() =>
      window.location.pathname.includes('/accounts/login')
    );
    if (loginPage) {
      throw new Error('Sessão expirada. Reconecte o cliente primeiro.');
    }

    // ── Click the "New Post" button ─────────────────────────────
    // Try multiple selectors for the create/new post button
    const createBtn = page.locator([
      'svg[aria-label="New post"]',
      'svg[aria-label="Nova publicação"]',
      'svg[aria-label="Criar"]',
      'svg[aria-label="Create"]',
      '[aria-label="New post"]',
      '[aria-label="Nova publicação"]',
      '[aria-label="Create"]',
      '[aria-label="Criar"]',
    ].join(', ')).first();

    await createBtn.waitFor({ timeout: 15000 });
    await createBtn.click();

    // Wait for upload modal
    await page.waitForTimeout(1500);

    // ── Handle "select from computer" ──────────────────────────
    // The modal has a file input or a button to select files
    const fileInput = page.locator('input[type="file"]').first();

    // Sometimes the input is hidden; click the upload area first
    const uploadArea = page.locator([
      'button:has-text("Select from computer")',
      'button:has-text("Selecionar do computador")',
      '[role="button"]:has-text("Selecionar")',
      '[role="button"]:has-text("Select")',
    ].join(', ')).first();

    const hasUploadBtn = await uploadArea.count() > 0;
    if (hasUploadBtn) {
      await uploadArea.click();
      await page.waitForTimeout(500);
    }

    // Set files on the input
    await fileInput.setInputFiles(filePaths);
    console.log(`[publish] Files attached: ${filePaths.length}`);

    // ── Post type selection (if multiple files = carousel) ──────
    if (filePaths.length > 1 || format === 'carousel') {
      await page.waitForTimeout(2000);
      // Look for "Select multiple" or carousel option
      const multiBtn = page.locator([
        'svg[aria-label="Select multiple"]',
        'svg[aria-label="Selecionar múltiplos"]',
        '[aria-label="Select multiple"]',
        '[aria-label="Selecionar múltiplos"]',
      ].join(', ')).first();

      const hasMulti = await multiBtn.count() > 0;
      if (hasMulti && format === 'carousel' && filePaths.length === 1) {
        await multiBtn.click();
        await page.waitForTimeout(500);
      }
    }

    // ── Navigate through the post creation flow ─────────────────
    await page.waitForTimeout(2000);

    // Click "Next" / "Próximo" buttons to get through crop → filters → caption
    for (let step = 0; step < 3; step++) {
      const nextBtn = page.locator([
        'button:has-text("Next")',
        'button:has-text("Próximo")',
        'div[role="button"]:has-text("Next")',
        'div[role="button"]:has-text("Próximo")',
      ].join(', ')).first();

      const hasNext = await nextBtn.count() > 0;
      if (!hasNext) break;

      await nextBtn.click();
      await page.waitForTimeout(2000);
      console.log(`[publish] Step ${step + 1}: clicked Next`);
    }

    // ── Fill caption ────────────────────────────────────────────
    if (caption) {
      const captionArea = page.locator([
        'textarea[aria-label="Write a caption…"]',
        'textarea[aria-label="Escreva uma legenda…"]',
        'div[role="textbox"][aria-label*="caption"]',
        'div[role="textbox"][aria-label*="legenda"]',
        'div[contenteditable="true"]',
      ].join(', ')).first();

      const hasCaptionArea = await captionArea.count() > 0;
      if (hasCaptionArea) {
        await captionArea.click();
        await captionArea.fill(caption);
        console.log(`[publish] Caption filled (${caption.length} chars)`);
        await page.waitForTimeout(500);
      }
    }

    // ── Click "Share" / "Compartilhar" ──────────────────────────
    const shareBtn = page.locator([
      'button:has-text("Share")',
      'button:has-text("Compartilhar")',
      'div[role="button"]:has-text("Share")',
      'div[role="button"]:has-text("Compartilhar")',
    ].join(', ')).first();

    await shareBtn.waitFor({ timeout: 15000 });
    await shareBtn.click();
    console.log(`[publish] Share clicked`);

    // ── Wait for confirmation ───────────────────────────────────
    // Instagram shows a success animation or redirects
    await page.waitForTimeout(4000);

    // Try to capture the post URL from the page
    let postUrl = null;
    try {
      // Wait for the success state — Instagram usually redirects or shows confirmation
      await page.waitForURL(/instagram\.com\/(p|reels)\//, { timeout: 15000 });
      postUrl = page.url();
    } catch {
      // Not redirected — that's ok, post may still have published
      postUrl = null;
    }

    // Save updated session
    await saveSession(context, sessionFile);

    console.log(`[publish] Done! URL: ${postUrl || 'not captured'}`);
    return { postUrl, published: true };

  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
}
