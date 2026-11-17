# Erez Education Venture and SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Erez's Singular School project and strengthen the site's technical and on-page SEO for Ron Livneh, Erez Livneh and their lecture topics.

**Architecture:** Keep the static-site structure and current GitHub Pages canonical host. Add one visible content section to Erez's profile, align head metadata across pages, model profile pages as `ProfilePage` plus `Person`, enrich lecture `Service` data with breadcrumbs, and update the root XML sitemap.

**Tech Stack:** Static HTML, CSS, JSON-LD, XML sitemap, Node.js built-in test runner

**Spec:** `docs/superpowers/specs/2026-11-17-erez-school-seo-design.md`

## Global Constraints

- Keep `https://ronronlivneh-prog.github.io/` as the canonical host until the custom domain is connected.
- Do not add hidden text, competitor-name stuffing or `meta keywords`.
- Public HTML must not contain en dashes or em dashes.
- Preserve the existing design, contact routes and speaker separation.
- All structured data must describe visible, truthful page content.

## Review Focus

- JSON-LD must parse on every public page that contains it.
- Each canonical URL must match the page's sitemap URL and Open Graph URL.
- Profile data must identify the correct speaker and not mix Ron's and Erez's credentials.
- Lecture breadcrumbs must link to the correct speaker profile.
- The Singular School external link must be descriptive and safely expose the destination.

---

### Task 1: Singular School profile section

**Files:**
- Modify: `erez-livneh/index.html`
- Modify: `assets/css/styles.css`
- Test: `tests/seo.test.mjs`

**Interfaces:**
- Consumes: Existing Erez profile layout.
- Produces: A visible educational-entrepreneurship section linking to the project site.

- [ ] **Step 1: Add a failing test for the section, verified claims and URL.**
- [ ] **Step 2: Run `node --test tests/seo.test.mjs` and confirm the test fails because the section is absent.**
- [ ] **Step 3: Add the section and minimal responsive styling.**
- [ ] **Step 4: Re-run the focused test and confirm it passes.**

### Task 2: Entity metadata and structured data

**Files:**
- Modify: `index.html`
- Modify: `ron-livneh/index.html`
- Modify: `erez-livneh/index.html`
- Modify: `ron-livneh/*/index.html`
- Modify: `erez-livneh/*/index.html`
- Test: `tests/seo.test.mjs`

**Interfaces:**
- Consumes: Current canonical URLs and visible page copy.
- Produces: Consistent titles, descriptions, Open Graph metadata, profile entities and lecture breadcrumbs.

- [ ] **Step 1: Add failing tests for unique canonical metadata, profile entities and lecture breadcrumbs.**
- [ ] **Step 2: Run the focused test and confirm it fails on missing profile and breadcrumb data.**
- [ ] **Step 3: Implement the metadata and JSON-LD using the current GitHub Pages host.**
- [ ] **Step 4: Re-run the focused test and validate every JSON-LD block parses.**

### Task 3: Sitemap and release validation

**Files:**
- Modify: `sitemap.xml`
- Modify: `tests/seo.test.mjs`
- Preserve: `robots.txt`

**Interfaces:**
- Consumes: The final canonical URL set from Task 2.
- Produces: A root sitemap with every canonical page and `lastmod` values.

- [ ] **Step 1: Add a failing sitemap-to-canonical consistency test.**
- [ ] **Step 2: Run the focused test and confirm it fails on missing `lastmod` data.**
- [ ] **Step 3: Update `sitemap.xml` with the canonical page set and `2026-11-17` modification dates.**
- [ ] **Step 4: Run all Node and repository tests, syntax checks and `git diff --check`.**
- [ ] **Step 5: Review, commit, push to the feature branch and `main`, then verify GitHub Pages.**
