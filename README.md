# dogadogan.com

Personal academic website of Mustafa Doğa Doğan. Built with [Astro](https://astro.build) as a fully static site (plain HTML, no client-side rendering), deployed to GitHub Pages.

## Edit content

Everything you normally change is a text file:

| What | Where |
| --- | --- |
| A paper / project | `src/content/projects/<slug>.md` (one file each; copy `_template.md`) |
| Name, bio, links, pronunciation | `src/data/profile.yaml` |
| Experience, education | `src/data/cv.yaml` |
| Service, talks, photo moments | `src/data/activities.yaml` |
| Filter topics, vision clusters, diagram links | `src/data/taxonomy.yaml` |
| Vision illustration | `design/vision.svg` (export from Illustrator; keep the layer ids) |
| Images | `public/images/...` |

**Add a paper:** copy `src/content/projects/_template.md` to `src/content/projects/my-paper.md`, fill in the fields, write the abstract below the `---`, delete `draft: true`, commit and push. The site rebuilds automatically in about a minute. If a field is wrong (e.g., an unknown tag), the build fails with a message that names the file and field.

Topics (`tags`) can be combined freely. `vision` connects a project to a cluster in the vision diagram, so selecting that cluster filters to it.

## Run locally

```bash
npm install
npm run dev        # http://localhost:4321, live reload
npm run build      # production build into dist/, including the CV PDF
```

## How it is built

- **Static HTML.** Every project, abstract and link is in the HTML at build time, so search engines and AI crawlers (ChatGPT, Perplexity, Claude, Google) can read the site without running JavaScript.
- **Small, optional JavaScript** (~2 KB gzipped) adds two things: filtering, and click-to-play YouTube. Without JS, the page still shows everything.
- **YouTube loads only on click.** Cards show a thumbnail; the player (`youtube-nocookie.com`) is created when someone presses play.
- **Machine-readable extras**, generated from the same data: JSON-LD (`Person`, `ScholarlyArticle`), Google Scholar `citation_*` meta tags on each project page, `/llms.txt`, `/llms-full.txt`, `/publications.json`, and `/sitemap-index.xml`.
- **Vision diagram:** by default (`visionStyle: html` in `taxonomy.yaml`) the side panels are HTML built from `taxonomy.yaml`, with the center loop and cluster icons taken from `design/vision.svg`. Set `visionStyle: svg` to show the original Illustrator diagram instead.
- **Diagram build step:** `scripts/build-vision.mjs` runs before every build. It extracts the embedded raster image, namespaces the SVG's classes, makes the clusters clickable, and links project names. On screens narrower than 900 px, an HTML version built from `taxonomy.yaml` replaces the SVG, which is too small to read on phones.
- **CV PDF:** `/cv/` is a print-styled page built from the same YAML and project files. After `astro build`, `scripts/build-cv-pdf.mjs` opens it in headless Chromium and saves `dist/Mustafa-Doga-Dogan-CV.pdf`, linked as **CV** on the home page. The PDF is regenerated on every deploy, so it never drifts from the website. (In `npm run dev`, the CV link opens the HTML version instead.)
- **Self-hosted paper PDFs** live in `public/papers/`.

## Deploy (GitHub Pages)

1. Create the repository **`dogadogan/dogadogan.github.io`** and push this folder to `main`.
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` builds and publishes on every push. The site appears at https://dogadogan.github.io.

## Point dogadogan.com to GitHub Pages

Do this only after the github.io version looks right.

1. **GitHub:** Settings → Pages → Custom domain → `www.dogadogan.com` → Save. Also verify the domain under your GitHub account (Settings → Pages → Verified domains) to prevent takeover.
2. **Domain registrar's DNS panel:**
   - `www` → **CNAME** → `dogadogan.github.io`
   - `@` (apex) → four **A** records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Optional **AAAA** for apex: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - **Do not touch MX/TXT records** if you use email on this domain.
3. Wait for DNS (minutes to a few hours), then tick **Enforce HTTPS** in the Pages settings.
4. Other GitHub Pages project repos (e.g. `dogadogan/cmpe58k`) will automatically appear under `www.dogadogan.com/cmpe58k`.
5. Keep the previous hosting for a week or two as a fallback, then cancel it.

URLs that no longer exist show a 404 page that points to the home page.
