// Renders the /cv/ page to a PDF with headless Chromium.
//  - `node scripts/build-cv-pdf.mjs` (run after `astro build`) serves dist/ and writes
//    dist/Mustafa-Doga-Dogan-CV.pdf
//  - `renderCvPdf(baseUrl)` is also used by the dev server (astro.config.mjs) to serve the PDF live.
import { createServer } from 'node:http';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

export const CV_FILENAME = 'Mustafa-Doga-Dogan-CV.pdf';

async function launch() {
  const { chromium } = await import('playwright');
  try {
    return await chromium.launch();
  } catch {
    // Local fallback: use the installed Google Chrome if Playwright's Chromium isn't downloaded.
    return await chromium.launch({ channel: 'chrome' });
  }
}

/** Render `${baseUrl}/cv/` to a PDF and return its bytes. */
export async function renderCvPdf(baseUrl) {
  const browser = await launch();
  try {
    const page = await browser.newPage();
    await page.goto(new URL('/cv/', baseUrl).href, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    return await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate:
        '<div style="width:100%;font-family:Helvetica,Arial,sans-serif;font-size:7.5pt;color:#7b8494;padding:0 16mm;display:flex;justify-content:space-between">' +
        `<span>Mustafa Doğa Doğan · CV · updated ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} · dogadogan.com/cv</span>` +
        '<span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
    });
  } finally {
    await browser.close();
  }
}

// ---------- CLI: render from the built site ----------
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
  const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };

  // Minimal static server for dist/ so absolute asset paths (/_astro/...) resolve.
  const server = createServer(async (req, res) => {
    try {
      const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
      let file = join(DIST, path);
      if ((await stat(file).catch(() => null))?.isDirectory()) file = join(file, 'index.html');
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  try {
    const pdf = await renderCvPdf(`http://127.0.0.1:${server.address().port}`);
    await writeFile(join(DIST, CV_FILENAME), pdf);
    console.log(`[cv] wrote dist/${CV_FILENAME} (${Math.round(pdf.length / 1024)} KB)`);
  } finally {
    server.close();
  }
}
