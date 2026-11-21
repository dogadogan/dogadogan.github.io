# Instructions for coding agents

This is a static Astro site. Content lives in plain files; do not hard-code content in components.

## Common tasks

- **Add a publication/project:** create `src/content/projects/<kebab-slug>.md` from `src/content/projects/_template.md`.
  - `tags` must be ids from `src/data/taxonomy.yaml` → `topics` (ai-agents, xr, fabrication, metadata, sensing, design-tools, robotics).
  - `vision` (optional) must be cluster ids from `taxonomy.yaml` → `themes[].clusters[]`.
  - `year` + `order` control sorting (newest year first; lower `order` first within a year). When adding a new top item, use `order: 0` or renumber.
  - Prefer `youtube: <11-char id>` for videos; otherwise add an image to `public/images/projects/` (≤1200 px wide JPG) and set `image`.
  - The Markdown body is the abstract.
- **Update bio, links, CV, service, talks:** edit the YAML files in `src/data/`.
- **Add a new topic:** add it to `taxonomy.yaml` → `topics`; the filter chip appears automatically.
- **If a project name appears in the vision diagram,** map it in `taxonomy.yaml` → `svgLinks`, and update the phone version text (`themes[].clusters[].items`).

## Rules

- Keep all content server-rendered (no fetching content client-side); AI crawlers don't run JS.
- Don't add web fonts beyond Schibsted Grotesk; the owner rejected monospace and serif faces.
- No left-only accent borders on cards.
- Run `npm run build` before committing; it validates every project file and regenerates the CV PDF.
- The CV (`src/pages/cv.astro`) is generated from the same data; never edit a CV by hand.
