# Ron About Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the approved Ron About narrative and finish the compact secondary treatment for the beauty lecture.

**Architecture:** Keep the static HTML structure unchanged and replace only the approved content inside the existing About section. Add one narrowly scoped CSS rule for the compact feature link, with regression tests covering the exact heading, key copy, absence of the old heading, and the darker link color.

**Tech Stack:** Static HTML, CSS, Node.js built-in test runner

**Spec:** `docs/superpowers/specs/2026-11-17-ron-about-refresh-design.md`

## Global Constraints

- Use the user's approved Hebrew copy exactly.
- Do not add keyword tags below the About section.
- Do not use en dashes or em dashes in public HTML.
- Preserve the existing portrait and section layout.

## Review Focus

- Exact Hebrew copy must survive HTML editing without punctuation or character substitutions.
- The old About heading must not remain in the page.
- No keyword tag row may be introduced.
- The compact lecture must remain visually secondary at desktop and mobile widths.
- The compact lecture link must use a darker, accessible teal.

---

### Task 1: Ron About narrative and compact-link contrast

**Files:**
- Modify: `tests/homepage_refresh.test.mjs`
- Modify: `ron-livneh/index.html`
- Modify: `assets/css/styles.css`

**Interfaces:**
- Consumes: Existing static About and compact-feature markup.
- Produces: Approved public copy and a scoped accessible link color.

- [ ] **Step 1: Write the failing regression test**

Assert the approved heading and representative text from all three paragraphs, reject the old heading, and require the scoped compact-link color.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/homepage_refresh.test.mjs`
Expected: FAIL because the approved About copy and compact-link color are absent.

- [ ] **Step 3: Implement the approved HTML and CSS**

Replace the old About heading and paragraphs with the exact approved content. Add `.special-feature--compact .text-link { color: #075f5b; }`.

- [ ] **Step 4: Run the full verification suite**

Run: `node --test tests/homepage_refresh.test.mjs`, repository tests, syntax checks, and `git diff --check`.
Expected: All tests pass and no whitespace errors are reported.

- [ ] **Step 5: Commit and publish**

Commit the focused change, push the feature branch and `main`, then verify the GitHub Pages deployment.
