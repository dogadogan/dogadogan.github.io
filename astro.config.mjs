import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { renderCvPdf, CV_FILENAME } from './scripts/build-cv-pdf.mjs';

// In `npm run dev`, render the CV PDF on request (the build writes it to dist/ instead).
const cvPdfInDev = {
  name: 'cv-pdf-dev',
  hooks: {
    'astro:server:setup': ({ server }) => {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith(`/${CV_FILENAME}`)) return next();
        try {
          const { port } = server.httpServer.address();
          const pdf = await renderCvPdf(`http://localhost:${port}`);
          res.writeHead(200, { 'Content-Type': 'application/pdf', 'Cache-Control': 'no-store' });
          res.end(pdf);
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end(`Could not render the CV PDF: ${e.message}`);
        }
      });
    },
  },
};

// When the custom domain is live, `site` must match it (used for canonical URLs,
// sitemap and JSON-LD). Until then, the same build also works on dogadogan.github.io.
export default defineConfig({
  site: 'https://www.dogadogan.com',
  trailingSlash: 'ignore',
  integrations: [sitemap(), cvPdfInDev],
  build: { inlineStylesheets: 'always' },
});
