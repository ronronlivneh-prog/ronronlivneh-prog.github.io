# Lecture Images and Ron Media Gallery Design

## Goal

Add a clear, real landscape photograph to every lecture by Ron and Erez, and add the two existing media videos from Ron's Canva site to Ron's official profile. Lecture detail pages must also preserve the visitor's context by offering both a link back to the relevant speaker profile and a separate link to the homepage.

## Approaches

1. Use a curated set of real photographs that are free under the Unsplash License. Selected after the generated concept images felt artificial and strange.
2. Link all media remotely. Rejected for lecture images and avoided for videos because the site assets should remain locally controlled.
3. Create an original coordinated image series. Rejected after visual review because the results felt artificial and strange.

## Design

- Seven real landscape photographs, one per lecture, cropped consistently and selected for a direct, recognizable connection to the subject.
- Each image appears at the top of its lecture card and near the top of its lecture detail page.
- Ron's media gallery appears after the About section and before client proof.
- The gallery contains the two videos already published on Ron's Canva site: Channel 14 and Galileo on Kan Educational.
- Videos use local optimized MP4 files, native controls, metadata preload, accessible labels, and poster images.
- The compact beauty lecture remains visually secondary.

## Constraints

- Do not use en dashes or em dashes in public HTML.
- Preserve the existing RTL layout and responsive design.
- Keep all final assets inside the repository and record photo credits in `assets/images/lectures/CREDITS.md`.
- Do not autoplay the media gallery videos.
- Speaker profile pages show only the homepage return link; lecture detail pages show both the speaker return link and the homepage return link.

