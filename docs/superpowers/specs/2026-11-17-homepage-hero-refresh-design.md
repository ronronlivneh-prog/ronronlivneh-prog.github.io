# Homepage Hero Refresh Design

## Intent

Make the homepage opening feel like a confident shared brand for Ron and Erez, with a clear marketing promise and a calmer visual connection between their contrasting portraits.

## Goals

- Center and substantially enlarge the homepage intro.
- Use the approved headline and supporting copy exactly as supplied.
- Apply one deep blue-gray accent to both homepage speaker cards.
- Keep each speaker's existing individual-page color system unchanged.
- Remove en dashes and em dashes from all public website HTML, replacing them with natural punctuation or a regular hyphen.
- Remove the pink-shirt portrait from all visible and social-preview uses.
- Use the new blue-shirt portrait on the homepage, the new black-suit portrait as Ron's profile hero, and the new informal tea portrait in Ron's story section.
- Show real company logo images near the bottom of both speaker profile pages.
- Replace Ron's testimonial with Yael's Allied Universal recommendation, preserving the supplied wording.

## Non-goals

- No redesign of the individual speaker pages.
- No change to services, navigation, forms, or URLs.
- No GitHub publication until Ron approves the local result.

## Approaches

Three shared accent directions were considered: deep blue-gray, smoky green-gray, and light stone brown. Deep blue-gray was selected because it is professional and technological, harmonizes with both coral and light blue clothing, and remains distinct against the cream background.

## Approved Copy

Headline: `העתיד מתחיל כאן`

Supporting copy: `רעיונות גדולים, טכנולוגיות חדשות ושינויים שמעצבים את המחר - בהרצאות, סדנאות וייעוץ שמביאים אותו אל הבמה ואל תוך הארגון.`

## Implementation

Use a homepage-only shared accent variable and shared card selectors so speaker-specific page styling remains intact. Give the intro a centered full-width layout, a larger responsive headline, and a larger readable supporting line. Replace forbidden long-dash characters in public HTML and verify none remain.
