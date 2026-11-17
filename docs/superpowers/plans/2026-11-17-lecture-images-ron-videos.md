# Lecture Images and Ron Media Gallery Implementation Plan

**Spec:** `docs/superpowers/specs/2026-11-17-lecture-images-ron-videos-design.md`

## Task 1: Asset contract

- Add failing tests that require seven local lecture images, image references on both profile and detail pages, and two local videos in Ron's media gallery.
- Run the tests and verify they fail because the assets and markup do not exist.

## Task 2: Real lecture photography

- Select seven real photographs that are free to use under the Unsplash License.
- Save optimized local copies in `assets/images/lectures/` and record source credits.
- Add image markup to the seven profile cards and seven lecture detail pages.
- Add responsive card and detail-page image styling.

## Task 3: Ron media gallery

- Retrieve the two source videos already published on Ron's Canva site.
- Optimize them for web delivery and save them under `assets/videos/ron/`.
- Add an accessible, responsive video gallery to `ron-livneh/index.html`.

## Task 4: Verification and release

- Add explicit speaker-profile and homepage return links to every lecture detail header.
- Run the complete Node and Python test suites, syntax checks, HTML checks, and visual QA.
- Commit, push the feature branch and main, wait for GitHub Pages deployment, and verify the live result.

