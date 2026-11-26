# SEO Landing Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two high-intent, visible SEO landing pages for organizational buyers and connect them to the existing site.

**Architecture:** Build two static pages using the site's established HTML and CSS patterns. Link them from the homepage and the relevant speaker profile, describe them with unique metadata and structured data, and expose them through the sitemap.

**Tech Stack:** Static HTML, CSS, JSON-LD, Node test runner, Python unittest

**Spec:** `docs/superpowers/specs/2026-11-26-seo-landing-pages-design.md`

## Global Constraints

- All copy is visible and useful to people, never hidden for search engines.
- Avoid en dashes and em dashes across all public HTML.
- Reuse real local photography and existing contact flows.
- Preserve the separate positioning of Ron and Erez.

## Review Focus

- Search intent must be clear without keyword repetition.
- Each page must point to the correct speaker and lectures.
- Canonical, Open Graph and structured-data URLs must match the public URL.
- Mobile layouts must remain readable and usable.
- Sitemap coverage must match every canonical page.

---

### Task 1: Contract tests for landing pages

**Files:**
- Modify: `tests/seo.test.mjs`

**Interfaces:**
- Produces: assertions defining the two pages, internal links, metadata and sitemap entries.

- [ ] Write failing tests for both page paths, search-intent copy, contextual links and sitemap coverage.
- [ ] Run `node --test tests/seo.test.mjs` and verify failure because the pages do not exist.
- [ ] Commit with the implementation in Task 3 after the tests pass.

### Task 2: Landing page implementation

**Files:**
- Create: `ron-livneh/ai-lectures-for-organizations/index.html`
- Create: `erez-livneh/innovation-futures-for-organizations/index.html`
- Modify: `assets/css/styles.css`

**Interfaces:**
- Consumes: page contracts from Task 1.
- Produces: two responsive static landing pages.

- [ ] Implement Ron's page with unique metadata, JSON-LD, audience, outcomes, lecture links and CTA.
- [ ] Implement Erez's page with unique metadata, JSON-LD, audience, formats, lecture links and CTA.
- [ ] Add only the shared CSS required for the new layouts.
- [ ] Run `node --test tests/seo.test.mjs` and verify the new page tests pass.

### Task 3: Discovery and release integration

**Files:**
- Modify: `index.html`
- Modify: `ron-livneh/index.html`
- Modify: `erez-livneh/index.html`
- Modify: `sitemap.xml`

**Interfaces:**
- Consumes: both landing page URLs from Task 2.
- Produces: natural internal discovery paths and sitemap coverage.

- [ ] Add contextual links from the homepage and each relevant speaker page.
- [ ] Add both canonical URLs to the sitemap with `2026-11-26`.
- [ ] Run the full Node and Python test suites.
- [ ] Preview the pages at desktop and mobile widths.
- [ ] Commit and publish to GitHub Pages.

