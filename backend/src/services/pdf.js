// backend/src/services/pdf.js
const fs = require('fs');
const puppeteer = require('puppeteer');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function resolveExecutablePath() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;

  const candidatesLinux = [
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/snap/bin/chromium',
  ];
  const candidatesWin = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];
  const list = process.platform === 'win32' ? candidatesWin : candidatesLinux;
  for (const p of list) {
    try { if (fs.existsSync(p)) return p; } catch (_) {}
  }
  return null; // usa Chromium que trae Puppeteer
}

function resolveHeadless() {
  if (typeof process.env.PUPPETEER_HEADLESS !== 'undefined') {
    const v = String(process.env.PUPPETEER_HEADLESS).trim().toLowerCase();
    if (v === 'false') return false;
    if (v === 'new')   return 'new';
    return true;
  }
  return 'new';
}

function launchArgsByPlatform() {
  const base = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--font-render-hinting=medium',
  ];
  if (process.platform !== 'win32') {
    base.push('--no-zygote');
    base.push('--single-process');
  }
  return base;
}

async function createBrowser() {
  const executablePath = resolveExecutablePath();
  const headless = resolveHeadless();
  const args = launchArgsByPlatform();
  return puppeteer.launch({
    headless,
    args,
    executablePath: executablePath || undefined,
  });
}

/**
 * Genera un PDF (ticket 80mm) desde HTML y devuelve Buffer.
 * Reintenta si el navegador se cierra durante printToPDF.
 */
async function htmlToPdfBuffer(html, pdfOptions = {}) {
  let browser;

  async function attempt(minimal = false) {
    browser = await createBrowser();
    try {
      const page = await browser.newPage();

      // (Opcional) viewport pequeño evita glitches en algunos hosts
      try { await page.setViewport({ width: 600, height: 800, deviceScaleFactor: 1 }); } catch {}

      await page.setContent(String(html || ''), {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      // pequeño respiro para estabilizar layout
      await sleep(minimal ? 80 : 150);

      try { await page.emulateMediaType('screen'); } catch {}

      const pdf = await page.pdf({
        printBackground: true,
        ...(minimal ? {} : { width: '80mm', margin: { top: '6mm', right: '6mm', bottom: '6mm', left: '6mm' } }),
        ...pdfOptions,
      });

      const buf = Buffer.isBuffer(pdf) ? pdf : Buffer.from(pdf);
      if (!buf.length) throw new Error('PDF vacío');
      console.log(`[pdf] OK${minimal ? ' (reintento)' : ''}, bytes:`, buf.length);
      return buf;
    } finally {
      try { await browser.close(); } catch {}
    }
  }

  try {
    return await attempt(false);
  } catch (err) {
    const msg = String(err?.message || err);
    console.error('[pdf] ERROR generando PDF (intento 1):', msg);

    // Reintento si es cierre/crash del target
    const isTargetClosed = /Target closed|Browser disconnected|Session closed|crash/i.test(msg);
    if (!isTargetClosed) throw err;

    try {
      console.warn('[pdf] Reintentando tras Target closed…');
      return await attempt(true); // reintento “minimal”
    } catch (err2) {
      console.error('[pdf] Reintento falló:', err2?.message || err2);
      throw err2;
    }
  }
}

module.exports = { htmlToPdfBuffer };
