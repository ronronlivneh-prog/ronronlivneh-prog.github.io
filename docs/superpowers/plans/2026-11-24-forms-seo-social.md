# Forms, SEO and Social Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Activate speaker-specific lead forms, strengthen organization-event search relevance, connect official profiles and extend Ron's media gallery without slowing the static site.

**Architecture:** Keep the existing static GitHub Pages structure. Formspree supplies two external form endpoints, while HTML metadata, JSON-LD and visible copy remain local and testable. Social and YouTube cards use local assets and ordinary outbound links.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Node test runner, GitHub Pages, Formspree Free, Google Search Console.

**Spec:** `docs/superpowers/specs/2026-11-24-forms-seo-social-design.md`

## Global Constraints

- Keep all website source and media files local in the repository.
- Avoid en dashes and em dashes in public copy.
- Do not add hidden SEO text, `meta keywords` or keyword stuffing.
- Ron submissions go only to `ronronlivneh@gmail.com`; Erez submissions go only to `erezliv@gmail.com`.
- Preserve WhatsApp as a working alternative to every form.
- Do not load additional YouTube players on Ron's profile page.
- Keep the site in Hebrew and optimized for Israeli organizations.

## Review Focus

- A form on any Ron page must never use Erez's endpoint, and vice versa.
- Failed or rate-limited Formspree submissions must leave the form populated and show the WhatsApp fallback.
- Social links must resolve to the supplied official profiles and open safely without breaking the current page.
- New media cards must not load third-party iframes, autoplay media or remote images.
- The new SEO copy must be visible, useful and indexable without duplicating a lecture page's primary query.

---

### Task 1: Create and connect the Formspree endpoints

**Files:**
- Modify: `ron-livneh/index.html`
- Modify: `ron-livneh/*/index.html`
- Modify: `erez-livneh/index.html`
- Modify: `erez-livneh/*/index.html`
- Modify: `assets/js/forms.js`
- Test: `tests/homepage_refresh.test.mjs`

**Interfaces:**
- Consumes: Two verified Formspree endpoint URLs, one linked to each approved recipient email.
- Produces: Every `[data-contact-form]` has `data-endpoint-status="ready"`, an HTTPS Formspree action and an enabled fieldset.

- [ ] **Step 1: Create two forms in one Formspree Free account and verify the two recipient emails.**

Record the Ron and Erez endpoint URLs. The user completes login and email verification.

- [ ] **Step 2: Write failing tests for speaker endpoint isolation and enabled controls.**

Assert that every Ron form uses the same Ron endpoint, every Erez form uses the same Erez endpoint, no form action is empty, all endpoint statuses are `ready`, and no contact fieldset is disabled.

- [ ] **Step 3: Run the focused test and verify RED.**

Run: `node --test --test-name-pattern="contact forms" tests/homepage_refresh.test.mjs`

Expected: FAIL because the forms are still pending and disabled.

- [ ] **Step 4: Connect the endpoints and enable every form.**

Remove the local-only notice, remove `disabled`, set the correct `action`, and set `data-endpoint-status="ready"`. Preserve all fields and WhatsApp links.

- [ ] **Step 5: Add a failing JavaScript contract test for success and failure messages.**

Assert that `forms.js` posts `FormData`, disables the submit button while sending, resets only on success, and displays the existing WhatsApp fallback on failure.

- [ ] **Step 6: Adjust `forms.js` only if the contract test exposes a gap, then run the focused tests.**

Run: `node --test tests/homepage_refresh.test.mjs`

Expected: PASS.

- [ ] **Step 7: Commit.**

Commit message: `feat: activate speaker contact forms`

### Task 2: Add organization-event SEO copy and metadata

**Files:**
- Modify: `index.html`
- Modify: `assets/css/styles.css`
- Modify: `sitemap.xml`
- Test: `tests/seo.test.mjs`
- Test: `tests/homepage_refresh.test.mjs`

**Interfaces:**
- Consumes: Existing homepage speaker cards and canonical host `https://www.livnehtalks.co.il`.
- Produces: A visible homepage section with ID `organization-events` and clear links to both speaker pages.

- [ ] **Step 1: Write a failing test for the new visible SEO section.**

Assert the homepage contains the heading `הרצאות לארגונים ולאירועי חברה`, mentions `מנהלות משאבי אנוש`, `תרבות ורווחה`, `אירועי עובדים` and `כנסים מקצועיים`, and links to both `/ron-livneh/` and `/erez-livneh/` within the section.

- [ ] **Step 2: Run the focused test and verify RED.**

Run: `node --test --test-name-pattern="organization events" tests/seo.test.mjs`

Expected: FAIL because the section does not exist.

- [ ] **Step 3: Add the section and compact responsive styling.**

Place it after the speaker gateway. Use natural copy around AI, innovation, futurism, science and technology without repeating a phrase unnaturally.

- [ ] **Step 4: Strengthen homepage title, description and structured data without changing canonical URLs.**

Keep the current brand-first title and add organization-event intent to the meta description and visible section. Add an `Organization` entity for Livneh Talks that references both speaker `Person` entities.

- [ ] **Step 5: Update `lastmod` and run SEO tests.**

Run: `node --test tests/seo.test.mjs`

Expected: PASS.

- [ ] **Step 6: Commit.**

Commit message: `feat: target organization event searches`

### Task 3: Add official profile links and structured identity signals

**Files:**
- Modify: `ron-livneh/index.html`
- Modify: `erez-livneh/index.html`
- Modify: `assets/css/styles.css`
- Test: `tests/seo.test.mjs`

**Interfaces:**
- Consumes: The six approved official profile/project URLs in the spec.
- Produces: Visible `.profile-links` regions and matching `sameAs` arrays for each speaker.

- [ ] **Step 1: Write failing tests for visible and structured profile links.**

Assert Ron's visible region and `sameAs` contain Facebook, LinkedIn and YouTube. Assert Erez's visible region and `sameAs` contain Facebook, LinkedIn and the Singular School, while `hasPart` still models the school project.

- [ ] **Step 2: Run the focused test and verify RED.**

Run: `node --test --test-name-pattern="official profiles" tests/seo.test.mjs`

Expected: FAIL because the profile regions and complete `sameAs` arrays are missing.

- [ ] **Step 3: Add the visible profile regions and safe outbound links.**

Use descriptive Hebrew text labels, `target="_blank"` and `rel="noopener"`. Place the region near each biography rather than in the primary conversion path.

- [ ] **Step 4: Update both Person entities.**

Copy the exact visible profile URLs into each `sameAs` array. Preserve all existing Person properties.

- [ ] **Step 5: Run SEO tests and commit.**

Run: `node --test tests/seo.test.mjs`

Expected: PASS.

Commit message: `feat: connect official speaker profiles`

### Task 4: Extend Ron's media gallery with lightweight interview cards

**Files:**
- Create: `assets/images/ron/interview-health-code.jpg`
- Create: `assets/images/ron/interview-leading-change.jpg`
- Modify: `ron-livneh/index.html`
- Modify: `assets/css/styles.css`
- Test: `tests/homepage_refresh.test.mjs`

**Interfaces:**
- Consumes: The two approved YouTube URLs and their public thumbnails.
- Produces: Two local-image outbound media cards under a `ראיונות מלאים` heading.

- [ ] **Step 1: Write a failing test for the interview cards.**

Assert both YouTube video IDs, exact titles, durations `11:19` and `18:18`, local image paths, descriptive alt text and absence of new YouTube iframes.

- [ ] **Step 2: Run the focused test and verify RED.**

Run: `node --test --test-name-pattern="full interviews" tests/homepage_refresh.test.mjs`

Expected: FAIL because the interview cards do not exist.

- [ ] **Step 3: Download the two YouTube thumbnails into the local assets directory.**

Verify both files are valid JPEG images and record their intrinsic dimensions.

- [ ] **Step 4: Add the two outbound cards and responsive styling.**

Keep the existing Channel 14 and Galileo videos first. Add the new cards below them with title, duration, source context and `לצפייה ביוטיוב` links using `target="_blank"` and `rel="noopener"`.

- [ ] **Step 5: Run the focused test and commit.**

Run: `node --test tests/homepage_refresh.test.mjs`

Expected: PASS.

Commit message: `feat: add Ron interview links`

### Task 5: Release verification and Google Search Console handoff

**Files:**
- Modify: `README.md`
- Test: `tests/seo.test.mjs`
- Test: `tests/homepage_refresh.test.mjs`

**Interfaces:**
- Consumes: Deployed domain, all previous tasks and the public sitemap.
- Produces: Verified release plus documented Search Console steps and status.

- [ ] **Step 1: Run the full local test suite and repository checks.**

Run: `node --test tests/*.test.mjs`

Run: `git diff --check`

Expected: 0 failures and no whitespace errors.

- [ ] **Step 2: Verify the public deployment.**

Check the homepage, both speaker pages, one Ron lecture, one Erez lecture, `robots.txt` and `sitemap.xml` over HTTPS. Confirm the apex domain redirects to `www` and canonical URLs remain on `www`.

- [ ] **Step 3: Perform one live Ron form submission and one live Erez form submission using clearly labeled test data.**

Confirm each arrives only at its intended mailbox. This transmits test contact data and requires action-time user confirmation before submission.

- [ ] **Step 4: Add the domain property to Google Search Console and obtain the TXT verification value.**

Add the TXT record in LiveDNS, verify ownership, submit `https://www.livnehtalks.co.il/sitemap.xml`, and request indexing for the homepage and speaker pages. Each public submission requires action-time confirmation.

- [ ] **Step 5: Update the README status and commit.**

Commit message: `docs: record launch and search setup`

## Self-review

- Spec coverage: forms, organization-event SEO, all approved profiles, Singular School, both long interviews and Search Console are assigned to tasks.
- Step scan: every production change is preceded by a failing focused test and followed by verification.
- Type consistency: both speaker groups use the same existing form and structured-data interfaces, with separate endpoint values.
- Review focus: endpoint isolation, failure retention, safe links, local assets and visible natural SEO copy each have an owning test.
- Proportion: tasks define observable outcomes and exact values without prescribing full implementations.
