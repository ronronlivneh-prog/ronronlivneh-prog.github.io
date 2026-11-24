# WhatsApp Contact Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every direct WhatsApp contact link easier to recognize with the approved white, green-accented button treatment.

**Architecture:** Add one local WhatsApp SVG and one reusable `.whatsapp-button` component style. Mark the existing WhatsApp links on every Ron and Erez profile and lecture page without changing their URLs or wording.

**Tech Stack:** Static HTML, CSS, SVG, Node.js test runner

**Spec:** `docs/superpowers/specs/2026-11-24-whatsapp-button-design.md`

## Global Constraints

- Keep the button background white with a green icon and subtle green border.
- Preserve all existing WhatsApp destinations, prefilled messages and labels.
- Do not change form submit buttons or unrelated buttons.
- Use a local asset with no third-party dependency.

## Review Focus

- Every `wa.me` contact link receives the component class and icon.
- Non-WhatsApp links and form submit buttons do not receive the component class.
- The local icon exists, is referenced through CSS and remains decorative to assistive technology.
- The white button retains strong text contrast and a visible keyboard focus state.
- Mobile pages retain a usable button size without overflow.

---

### Task 1: Apply the WhatsApp contact component to all speaker pages

**Files:**
- Create: `assets/images/icons/whatsapp.svg`
- Modify: `assets/css/styles.css`
- Modify: `ron-livneh/index.html`
- Modify: `ron-livneh/*/index.html`
- Modify: `erez-livneh/index.html`
- Modify: `erez-livneh/*/index.html`
- Test: `tests/homepage_refresh.test.mjs`

**Interfaces:**
- Consumes: Existing `a.button[href^="https://wa.me/"]` links inside `.contact-panel__intro`.
- Produces: A reusable `.whatsapp-button` class styled with `/assets/images/icons/whatsapp.svg`.

- [ ] **Step 1: Write the failing component coverage test**

Add a test named `all direct WhatsApp actions use the approved white and green component` that asserts all nine `wa.me` links include `button whatsapp-button`, the local SVG exists, CSS references it, CSS pins a white background and green border/icon treatment, and no form submit button uses `whatsapp-button`.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test --test-name-pattern="WhatsApp actions" tests/homepage_refresh.test.mjs`

Expected: FAIL because the icon and component class do not exist.

- [ ] **Step 3: Add the local icon and component styling**

Create the white-space-safe local SVG asset. Add `.whatsapp-button` rules after the current speaker contact-button overrides so the approved white background, `#075e54` accents, larger padding, rounded border and soft shadow win without affecting any other `.button`.

- [ ] **Step 4: Mark all nine WhatsApp links**

Change only each direct contact anchor from `class="button"` to `class="button whatsapp-button"`. Preserve every `href` and text label exactly.

- [ ] **Step 5: Run verification and commit**

Run: `node --test tests/*.test.mjs`

Expected: all tests PASS.

Run: `git diff --check`

Commit: `feat: highlight WhatsApp contact actions`
