# Homepage Hero Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the homepage intro and speaker-card styling, then remove long-dash punctuation from the public site.

**Architecture:** Keep the static HTML and shared CSS architecture. Add homepage-specific presentation rules and a shared accent token, while preserving speaker-specific rules on inner pages. Treat punctuation cleanup as a site-wide HTML content migration.

**Tech Stack:** Static HTML5, CSS, Python unittest acceptance suite

**Spec:** `docs/superpowers/specs/2026-11-17-homepage-hero-refresh-design.md`

## Global Constraints

- Homepage headline must be `העתיד מתחיל כאן`.
- Homepage supporting copy must match the approved text in the spec.
- Both homepage speaker cards must use the same deep blue-gray accent.
- Individual speaker-page color systems must remain unchanged.
- Public HTML must contain no U+2013 en dash or U+2014 em dash.
- Public HTML must not reference the old pink-shirt portrait.
- New Ron portraits must be optimized for web delivery before use.
- Do not publish to GitHub as part of this plan.

## Review Focus

- Desktop homepage intro is centered and visually dominant without pushing cards excessively below the fold.
- Mobile intro remains readable and does not overflow.
- Shared homepage accents do not override inner-page speaker colors.
- All public HTML is free of forbidden long-dash characters.
- Existing links, forms, metadata, and routes remain valid.
- New portrait crops keep Ron's face visible on desktop and mobile.

---

### Task 1: Homepage marketing intro and shared card accent

**Files:**
- Modify: `tests/test_site.py`
- Modify: `index.html`
- Modify: `assets/css/styles.css`

**Interfaces:**
- Consumes: Existing `.gateway-intro`, `.speaker-card`, `.speaker-ron`, and `.speaker-erez` markup.
- Produces: Centered responsive homepage intro and one shared homepage accent for both cards.

- [ ] **Step 1: Write failing homepage acceptance tests**

Assert the approved homepage copy, the new homepage shared-accent class, and the centered intro class contract.

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `python -m unittest tests.test_site.SiteContentTests.test_homepage_refresh -v`
Expected: FAIL because the old headline, copy, and styling contract are present.

- [ ] **Step 3: Implement the homepage HTML and CSS changes**

Update `index.html` with the approved copy and shared homepage accent class. Update `styles.css` with a deep blue-gray token, centered responsive intro typography, and shared homepage card accents.

- [ ] **Step 4: Run the full suite**

Run: `python -m unittest discover -s tests -v`
Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `feat: refresh homepage introduction`

### Task 2: Site-wide long-dash cleanup

**Files:**
- Modify: `tests/test_site.py`
- Modify: all public `*.html` files containing U+2013 or U+2014

**Interfaces:**
- Consumes: Existing public HTML tree.
- Produces: Public content and metadata using regular punctuation with no en dash or em dash.

- [ ] **Step 1: Write a failing punctuation acceptance test**

Scan every public HTML file and assert that neither U+2013 nor U+2014 is present.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `python -m unittest tests.test_site.SiteContentTests.test_public_html_avoids_long_dashes -v`
Expected: FAIL and list files containing forbidden characters.

- [ ] **Step 3: Replace long dashes with context-appropriate punctuation**

Use a regular hyphen in titles and compact labels, and commas, colons, or sentence breaks in prose where clearer.

- [ ] **Step 4: Run the full suite**

Run: `python -m unittest discover -s tests -v`
Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `style: remove long dashes from site copy`

### Task 3: Replace Ron's pink portrait with the approved photo set

**Files:**
- Modify: `tests/test_site.py`
- Modify: `tests/homepage_refresh.test.mjs`
- Create: optimized portrait assets under `assets/images/ron/`
- Modify: `index.html`
- Modify: `ron-livneh/index.html`
- Modify: Ron lecture-page social image metadata

**Interfaces:**
- Consumes: The user-supplied JPG portraits.
- Produces: Web-optimized portrait assets and updated visible/social references with no use of the pink portrait.

- [ ] **Step 1: Extend image-reference acceptance tests and verify failure**

- [ ] **Step 2: Optimize the selected portraits and update HTML references**

- [ ] **Step 3: Run the full available test suite and verify pass**

- [ ] **Step 4: Commit**

Commit message: `feat: refresh Ron portrait photography`

### Task 4: Company logo proof strips and Ron testimonial

**Files:**
- Modify: `tests/test_site.py`
- Modify: `tests/homepage_refresh.test.mjs`
- Create: local Erez company logo assets under `assets/images/erez/logos/`
- Modify: `ron-livneh/index.html`
- Modify: `erez-livneh/index.html`
- Modify: `assets/css/styles.css`

**Interfaces:**
- Consumes: Existing Ron logo assets, Erez client list, and the supplied testimonial.
- Produces: Accessible local logo-image strips on both profile pages and the approved testimonial.

- [ ] **Step 1: Add failing acceptance tests for both logo strips and the testimonial**

- [ ] **Step 2: Replace text-only Erez clients with locally stored logo images and expand Ron's logo strip**

- [ ] **Step 3: Replace and style Ron's testimonial**

- [ ] **Step 4: Run all available tests and visually verify desktop and mobile layouts**
