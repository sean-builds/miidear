# Miidear website

Miidear is a bespoke wedding invitation atelier in Bangkok. The site introduces the studio, explores design directions, explains the process, and helps couples prepare consultation details.

## Run locally
Serve this folder with any static web server, for example `python -m http.server 8000`, then open http://localhost:8000. All files remain in one folder; no build or dependencies are required.

## What changed
- A layered stationery illustration and more focused homepage, retaining ivory, mint, gold, and the original fonts.
- Readable serif headings, clearer navigation and buttons, responsive spacing, visible focus, reduced-motion support, and safe-area spacing.
- Original typographic gallery studies replace empty panels. They are explicitly labelled illustrations, not real commissions. Sample customer reviews were removed.
- Mobile menu supports Escape, focus containment, background isolation, accurate expanded state, and desktop resize recovery.
- Gallery supports keyboard focus containment/restoration, Escape, arrow keys, touch swipes, and visible previous/next controls. Portfolio rails also have scroll buttons.
- FAQ panels have associated buttons, hidden closed content, and one open answer at a time.
- Consultation drafts validate Tuesday–Saturday dates, tomorrow through 120 days ahead, using Bangkok time. Errors link to fields; storage failures retain entries. Drafts can be downloaded as text.
- Empty contact channels are hidden with an honest fallback. The Bangkok map is labelled a city overview, not a studio address.
- Offline cache updated; only Miidear-prefixed old caches are removed. Local preview does not register a service worker.

## Before publishing
1. Add verified phone, email and social details to `MIIDEAR_CONTACT` in main.js. Replace the city map with the confirmed studio location.
2. Add authentic portfolio images to the collection data (`images: [{img: 'photo.jpg', alt: 'Description'}]`) and replace the decorative studio panels. Card covers currently use typographic studies.
3. Connect a real form delivery service or backend before offering submitted bookings. The current form deliberately saves drafts locally and never claims that a request was sent or an appointment reserved. There is no shared availability calendar.
4. Verify business claims, timelines, delivery coverage, and all copy with the atelier.
5. The admin page is a local demo. Its visible password is not authentication and must not be used to protect production customer records.

## Files
Shared styling: style.css + refinements.css. Shared interactions and contact configuration: main.js. Original study illustrations: studies.js. Page-specific behaviour: booking.js, lightbox.js, admin.js. Offline support: sw.js; bump its cache version when updating cached files.
