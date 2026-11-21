// Progressive enhancement only: every project, abstract and link is already in the HTML.
// This file adds (1) click-to-play YouTube and (2) filtering by topic / vision cluster,
// kept in sync with the vision diagram and the URL (?topic=…&vision=…|theme=…).

/**
 * Run `cb` once the page has stopped scrolling ('scrollend' where supported, else polling).
 * With `early`, fire as soon as the scroll is clearly slowing down near its target.
 */
function afterScroll(cb: () => void, maxMs = 3000, early?: () => boolean) {
  let done = false;
  const listeners = new AbortController();
  const fire = () => { if (done) return; done = true; listeners.abort(); cb(); };
  window.addEventListener('scrollend', fire, { signal: listeners.signal });
  let last = scrollY;
  const poll = () => {
    if (done) return;
    const step = Math.abs(scrollY - last);
    if (step < 1 || (early && step < 40 && early())) return fire();
    last = scrollY;
    setTimeout(poll, 80);
  };
  setTimeout(poll, 120);
  setTimeout(fire, maxMs);
}

// ---------- 1. Click-to-play YouTube ----------
document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest<HTMLAnchorElement>('a.yt');
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube-nocookie.com/embed/${a.dataset.yt}?autoplay=1&rel=0`;
  iframe.title = a.dataset.title ? `Video: ${a.dataset.title}` : 'YouTube video';
  iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
  iframe.allowFullscreen = true;
  a.replaceWith(iframe);
  iframe.focus();
});

// ---------- 1b. Header name reveal (home page) ----------
const heroName = document.querySelector('.hero-name');
const topbar = document.querySelector('.topbar');
if (heroName && topbar) {
  const headerH = () => topbar.getBoundingClientRect().height;
  new IntersectionObserver(
    ([e]) => topbar.classList.toggle('show-name', !e.isIntersecting && e.boundingClientRect.top < headerH()),
    { rootMargin: `-${Math.round(headerH())}px 0px 0px 0px`, threshold: 0 },
  ).observe(heroName);
}

// ---------- 1c. Pronunciation link: scroll, then highlight the note ----------
document.querySelector('.pronounce-link')?.addEventListener('click', (e) => {
  const block = document.getElementById('pronounce');
  if (!block) return;
  e.preventDefault();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Scroll to the About section (its heading lands under the header, like the nav link),
  // so the note is seen in context, then highlight the note.
  const section = document.getElementById('about') ?? block;
  const heading = section.querySelector('h2') ?? block;
  section.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  history.replaceState(null, '', '#pronounce');
  block.classList.remove('is-highlighted');
  const glow = () => {
    void block.offsetWidth; // restart the animation on repeated clicks
    block.classList.add('is-highlighted');
    block.addEventListener('animationend', () => block.classList.remove('is-highlighted'), { once: true });
  };
  if (reduce) return glow();
  // Start the glow when scrolling has finished: 'scrollend' where supported,
  // otherwise once the scroll position stops changing.
  let done = false;
  let corrected = false;
  const finish = () => {
    if (done) return;
    // The layout can shift while the smooth scroll runs (e.g. with a filter active),
    // so check where the note really ended up and finish the scroll if it's off.
    const r = heading.getBoundingClientRect();
    const header = document.querySelector('.topbar')?.getBoundingClientRect().bottom ?? 0;
    const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
    if (!corrected && !atBottom && Math.abs(r.top - (header + 24)) > 40) {
      corrected = true;
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      last = -1;
      setTimeout(poll, 150);
      return;
    }
    done = true;
    listeners.abort();
    glow();
  };
  let last = -1;
  const listeners = new AbortController();
  window.addEventListener('scrollend', () => finish(), { signal: listeners.signal });
  const poll = () => {
    if (done) return;
    if (Math.abs(scrollY - last) < 1) return finish();
    last = scrollY;
    setTimeout(poll, 120);
  };
  setTimeout(poll, 150);
  setTimeout(() => { corrected = true; finish(); }, 4000); // safety net
});

// ---------- 2. Filtering ----------
const root = document.querySelector('.work');
if (root) initFilters();

function initFilters() {
  type State = { topic: string; vision: string; theme: string };
  const state: State = { topic: '', vision: '', theme: '' };

  const entries = [...document.querySelectorAll<HTMLElement>('.entry')];
  const years = [...document.querySelectorAll<HTMLElement>('.year')];
  const chips = [...document.querySelectorAll<HTMLButtonElement>('.chip[data-filter-topic]')];
  const svgHits = [...document.querySelectorAll<HTMLElement>('.v-cluster, .v-theme, .v-theme-art')];
  const visionRoot = document.querySelector<HTMLElement>('[data-vision-root]');
  const pill = document.querySelector<HTMLElement>('.vision-pill')!;
  const pillLabel = document.querySelector<HTMLElement>('.vision-pill-label')!;
  const count = document.querySelector<HTMLOutputElement>('.count')!;
  const empty = document.querySelector<HTMLElement>('.empty')!;
  const filtersBar = document.querySelector<HTMLElement>('.filters')!;
  // Keep project anchors clear of the sticky filter bar, whose height depends on screen width.
  new ResizeObserver(([e]) => {
    document.documentElement.style.setProperty('--filters-h', `${Math.ceil(e.borderBoxSize[0].blockSize)}px`);
  }).observe(filtersBar);

  // Human-readable name of a cluster or theme, for the active-filter pill.
  const labelFor = (attr: 'vision' | 'theme', id: string) => {
    const el = document.querySelector(attr === 'vision' ? `.v-cluster[data-vision="${id}"]` : `.v-theme[data-theme="${id}"]`);
    const aria = el?.getAttribute('aria-label')?.replace(/^Show (projects|publications) on /, '');
    return aria || el?.textContent?.trim() || id;
  };
  const themeOfCluster = (id: string) => document.querySelector(`.v-cluster[data-vision="${id}"]`)?.getAttribute('data-theme') ?? '';
  const clustersOfTheme = (id: string) =>
    [...document.querySelectorAll(`.v-cluster[data-theme="${id}"]`)].map((g) => g.getAttribute('data-vision')!);

  function matches(el: HTMLElement, s: State) {
    const tags = (el.dataset.tags ?? '').split(' ');
    const vis = (el.dataset.vision ?? '').split(' ').filter(Boolean);
    if (s.topic && !tags.includes(s.topic)) return false;
    if (s.vision && !vis.includes(s.vision)) return false;
    if (s.theme && !vis.some((v) => clustersOfTheme(s.theme).includes(v))) return false;
    return true;
  }

  function apply(push = true) {
    let shown = 0;
    for (const el of entries) {
      const ok = matches(el, state);
      el.hidden = !ok;
      if (ok) shown++;
    }
    for (const y of years) y.hidden = !y.querySelector('.entry:not([hidden])');
    empty.hidden = shown > 0;
    const filtered = state.topic || state.vision || state.theme;
    count.textContent = filtered ? `${shown} of ${entries.length} publications` : `${entries.length} publications`;

    for (const c of chips) c.setAttribute('aria-pressed', String(c.dataset.filterTopic === state.topic));

    // Diagram: selected region is highlighted, the rest dims. With only a topic selected,
    // clusters that contain matching projects stay lit.
    const active = state.vision || state.theme;
    visionRoot?.classList.toggle('has-selection', Boolean(active || state.topic));
    for (const g of svgHits) {
      const isCluster = g.classList.contains('v-cluster');
      const id = isCluster ? g.dataset.vision! : g.dataset.theme!;
      const selected = isCluster
        ? state.vision === id || (state.theme !== '' && g.dataset.theme === state.theme)
        : state.theme === id || (state.vision !== '' && themeOfCluster(state.vision) === id);
      g.setAttribute('aria-pressed', String(isCluster ? state.vision === id : state.theme === id));
      let lit = selected;
      if (!active && state.topic && isCluster) lit = entries.some((el) => matches(el, { topic: state.topic, vision: id, theme: '' }));
      if (!active && state.topic && !isCluster) lit = clustersOfTheme(id).some((v) => entries.some((el) => matches(el, { topic: state.topic, vision: v, theme: '' })));
      g.classList.toggle('is-lit', lit);
    }
    // HTML panels: a panel stays lit if its heading or any of its clusters is lit.
    document.querySelectorAll('.vp-panel').forEach((p) => {
      p.classList.toggle('is-lit', Boolean(p.querySelector('.v-theme.is-lit, .v-cluster.is-lit')));
    });
    document.querySelectorAll('.v-panel').forEach((p) => {
      const th = (p as HTMLElement).dataset.panelTheme!;
      p.classList.toggle('is-lit', state.theme === th || (state.vision !== '' && themeOfCluster(state.vision) === th));
    });

    pill.hidden = !active;
    if (active) pillLabel.textContent = state.vision ? labelFor('vision', state.vision) : labelFor('theme', state.theme);
    pill.dataset.theme = state.vision ? themeOfCluster(state.vision) : state.theme;

    if (push) {
      const url = new URL(location.href);
      for (const k of ['topic', 'vision', 'theme'] as const) {
        if (state[k]) url.searchParams.set(k, state[k]);
        else url.searchParams.delete(k);
      }
      history.replaceState(null, '', url);
    }
  }

  // After a vision click (and any scroll it caused), trace the filter pill's border once
  // so it's obvious which filter was applied.
  function announcePill() {
    if (pill.hidden) return;
    pill.classList.remove('is-announced');
    // start as the scroll eases into place, once the pill is on screen below the header
    const pillInView = () => {
      const r = pill.getBoundingClientRect();
      const header = document.querySelector('.topbar')?.getBoundingClientRect().bottom ?? 0;
      return r.top >= header && r.bottom <= innerHeight;
    };
    afterScroll(() => {
      if (pill.hidden) return;
      void pill.offsetWidth; // restart the animation if it's still running
      pill.classList.add('is-announced');
      pill.addEventListener('animationend', (e) => {
        if ((e as AnimationEvent).animationName === 'pill-fade') pill.classList.remove('is-announced');
      });
    }, 3000, pillInView);
  }

  function revealList() {
    const top = filtersBar.getBoundingClientRect().top;
    if (top > window.innerHeight * 0.6 || top < -10) {
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.getElementById('publications')!.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  }

  // Selecting a vision theme/cluster starts a fresh view: it clears the topic chip.
  function selectVision(id: string) {
    state.vision = state.vision === id ? '' : id;
    state.theme = '';
    state.topic = '';
    apply();
  }
  function selectTheme(id: string) {
    state.theme = state.theme === id ? '' : id;
    state.vision = '';
    state.topic = '';
    apply();
  }

  // chips + tags inside entries
  document.addEventListener('click', (e) => {
    const t = e.target as Element;
    const topicBtn = t.closest<HTMLElement>('[data-filter-topic]');
    if (topicBtn) {
      const id = topicBtn.dataset.filterTopic!;
      state.topic = state.topic === id && !topicBtn.classList.contains('chip') ? '' : id;
      apply();
      if (!topicBtn.classList.contains('chip')) revealList();
      return;
    }
    const visBtn = t.closest<HTMLElement>('button[data-filter-vision]');
    if (visBtn) {
      selectVision(visBtn.dataset.filterVision!);
      revealList();
      announcePill();
      return;
    }
    if (t.closest('.vision-clear')) {
      state.vision = state.theme = '';
      apply();
      return;
    }
    if (t.closest('.reset')) {
      state.vision = state.theme = state.topic = '';
      apply();
      return;
    }
  });

  // diagram
  if (visionRoot) {
    visionRoot.addEventListener('click', (e) => {
      const t = e.target as Element;
      const link = t.closest<HTMLElement>('a.v-link[data-project]');
      if (link) {
        // Make sure the linked project is visible before jumping to it.
        const el = document.getElementById(`p-${link.dataset.project}`);
        if (el?.hidden) {
          state.topic = state.vision = state.theme = '';
          apply();
        }
        el?.classList.add('flash');
        setTimeout(() => el?.classList.remove('flash'), 1600);
        return; // let the anchor navigate
      }
      if (t.closest('a')) return;
      const cluster = t.closest<HTMLElement>('.v-cluster');
      if (cluster) {
        selectVision(cluster.dataset.vision!);
        revealList();
        announcePill();
        return;
      }
      const theme = t.closest<HTMLElement>('.v-theme, .v-theme-art');
      if (theme) {
        selectTheme(theme.dataset.theme!);
        revealList();
        announcePill();
      }
    });
    visionRoot.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const g = (e.target as Element).closest<HTMLElement>('.v-cluster, .v-theme');
      if (!g || (e.target as Element).closest('a') || g.tagName === 'BUTTON') return;
      e.preventDefault();
      if (g.classList.contains('v-cluster')) selectVision(g.dataset.vision!);
      else selectTheme(g.dataset.theme!);
      announcePill();
    });
  }

  // initial state from URL
  const params = new URLSearchParams(location.search);
  state.topic = params.get('topic') ?? '';
  state.vision = params.get('vision') ?? '';
  state.theme = state.vision ? '' : params.get('theme') ?? '';
  apply(false);
}
