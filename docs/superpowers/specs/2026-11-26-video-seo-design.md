# Video and Keyword SEO Design

## Goal

Improve the discoverability and usability of the Livneh Talks site by making Ron Livneh's local videos faster and understandable to search engines, and by mapping the approved Hebrew search phrases naturally to the most relevant existing pages.

## Approach

- Keep the current static-site architecture and existing page URLs.
- Compress the two local MP4 files without changing their public paths.
- Add a stable poster image, a visible title and a useful description for each local video.
- Add valid `VideoObject` structured data to Ron's profile page using verified durations and dates only.
- Reinforce each approved search phrase on one primary page, using visible, readable Hebrew copy rather than hidden text or keyword lists.
- Update sitemap dates for changed indexable pages.

## Content mapping

- Ron profile: `רון ליבנה`, `רון ליבנה מרצה`, `הרצאות מדע וטכנולוגיה`.
- Ron organization page: `מרצה לבינה מלאכותית`, `הרצאה על בינה מלאכותית`, `הרצאות AI לארגונים`, `הרצאה לאירוע חברה`.
- Ron future-of-work page: `הרצאה על עתיד העבודה`.
- Erez profile: `ארז ליבנה`, `ארז ליבנה מרצה`, `הרצאות עתידנות`, `הרצאות מדע וטכנולוגיה`.
- Erez organization page: `מרצה לחדשנות`, `הרצאות חדשנות לארגונים`, `סדנת חשיבת עתיד`, `סדנת חדשנות ארגונית`, `ייעוץ חדשנות להנהלות`.

## Constraints

- Do not use hidden SEO text or keyword stuffing.
- Do not add claims, dates or media descriptions that cannot be verified.
- Do not use en dashes or em dashes in public copy.
- Preserve existing canonical URLs and video URLs.
- Keep the layout responsive and accessible.

## Verification

- Automated tests confirm posters, visible descriptions, structured video data and keyword placement.
- `ffprobe` confirms playable MP4 files and exact durations.
- Poster images are visually inspected.
- Full Python and Node test suites pass before deployment.

