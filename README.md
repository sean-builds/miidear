# Miidear — Website (Mii9 · Website Manager + Supabase Auth)

A bespoke wedding invitation atelier in Bangkok. Multi-page static site — plain
HTML, CSS, and JavaScript, no build step. Runs immediately on GitHub Pages and
works offline as an installable PWA.

This is a **refinement** of the existing site: same pages, navigation, and
functionality, elevated into a soft-luxury brand experience.

## Mii9 changes
- **Real Supabase Auth.** The fake password gate is gone. `admin.html` is now an email+password sign-in backed by Supabase Auth; the dashboard checks for a valid session and redirects to login if absent. Sign Out ends the session.
- **Website Manager dashboard** (replaces the CMS-style screen). Seven plain-language sections — Hero Section, Portfolio Projects, Gratitude & Reviews, Contact & Social, Location, Consultation Requests, Website Settings. No "collections", no database/CMS language, no auth warnings.
- **Live content from Supabase.** `content.js` makes the public pages read editable content (hero text/buttons, contact + social links, location, reviews, projects) from Supabase, falling back to the built-in content when a value isn't set or the network is down. Editing in the dashboard → Save → the website updates with no code changes.
- **Editors that save end-to-end:** Hero (video upload/replace/delete + text), Contact & Social (all links), Location (name/address/description/maps), Reviews (add/edit/delete with 1–5 star picker), Consultation status (Pending/Confirmed/Completed/Cancelled), Settings (Google Meet link, booking button text).
- **Portfolio:** add/edit/delete projects with title, couple names, description, and banner image upload. (Unlimited gallery images with drag-reorder is the next stage; the banner shows on the site now.)
- **Consultation Requests:** the existing inquiries, with per-row status dropdown, status filter, search, detail drawer, and a "Send Confirmation Email" button stubbed for future EmailJS.

### ONE-TIME SETUP (required before the dashboard can save)
1. **Create the tables & storage**: Supabase → SQL Editor → paste all of `supabase-setup.sql` → Run. (Adds reviews, projects, project_images, hero_media, site_content, site_links, the `media` bucket, an inquiry `status` column, and security policies.)
2. **Create your admin login**: Supabase → Authentication → Users → Add user → enter the email + password your father will use. That is the dashboard login. (Optionally turn off "Confirm email" under Authentication → Providers → Email so the account is active immediately.)
3. **Deploy & sign in**: upload the contents of the `mii9` folder to your repo root, open the site, triple-click the footer logo (or go to `/admin.html`), and sign in with the account from step 2.

### Security note
The included Row Level Security lets the public submit bookings and read published site content, but only a **signed-in admin** can edit content or read full inquiry data. This is why Auth is required — without it, saving is correctly blocked so your site/data can't be altered by anyone holding the public key.

## Mii8 changes
- **Booking repaired.** The real Supabase anon key is now in `config.js`; submissions insert into `inquiries` with matching columns. (The earlier error was the placeholder key, not a code bug.)
- **Cinematic hero video.** `hero.mp4` (transcoded to web-safe H.264, ~12 MB, faststart) autoplays muted/looping/inline on desktop with an elegant dark overlay and light text; mobile uses `hero-poster.jpg` and never downloads the video. Replaceable via the dashboard Media panel.
- **Larger header logo** (62px desktop / 44px mobile; header 104px) — a dominant brand element with nav still usable.
- **Contact → Visit the Atelier**: dedicated section with “Bangkok, Thailand · By Appointment” and a **View Location →** button to your Google Maps short link (new tab). Location no longer embeds a large map.
- **Social hotfix**: TikTok and Facebook now use the correct live URLs (all socials open in a new tab, no `#` placeholders).
- **Premium carousels** (`carousel.js`): all `.rail` sections auto-scroll subtly when idle, pause on hover/touch, support click-drag with momentum and horizontal mouse-wheel, hide scrollbars, and prevent text selection / accidental clicks while dragging. Lightbox still opens only via “View Collection”, with infinite looping.
- **Admin dashboard expanded** to six sections: Inquiries, Content, Media (hero video/poster upload), Portfolio, Social Links (editable, pre-seeded with live URLs), Settings. CMS safety: delete confirmations, draft-until-Save, and an unsaved-changes warning before leaving.
- **Database setup**: run `supabase-setup.sql` once in the Supabase SQL editor to create the CMS tables (`site_content`, `site_links`, `collections`, `collection_images`, `hero_media`), the public `media` storage bucket, and Row Level Security (anon can submit bookings but NOT read them; site content is publicly readable; CMS writes require admin auth).

### Important setup notes
1. **Run `supabase-setup.sql`** in Supabase → SQL Editor before using the CMS panels.
2. **Secure inquiries**: the included RLS lets anon INSERT bookings but blocks public SELECT, so customer data isn't world-readable through the anon key. Verify this policy is active.
3. **Saving content/media/portfolio from the dashboard requires Supabase Auth** (a signed-in admin). Until you enable Auth, those panels load and preview but writes are blocked by RLS — manage content from the Supabase dashboard meanwhile. Inquiries, social-link viewing, and hero preview work now.
4. **Hero video file**: `hero.mp4` + `hero-poster.jpg` are included. Replace them by uploading through the Media panel (after Auth) or by swapping the files in the repo.

### New files
`carousel.js`, `supabase-setup.sql`, `hero.mp4`, `hero-poster.jpg`; updated `config.js` (real key), `index.html`, `contact.html`, `dashboard.html`, `dashboard.js`, `supabase-client.js`, `main.js`, `style.css`, `sw.js`.

## Mii7 changes
- **Booking now saves to Supabase.** On submit, the form generates a unique `inquiry_id` and writes `full_name, email, phone, wedding_date, consultation_type, preferred_time, notes, created_at` to the `inquiries` table. (Bride/groom/venue/guests are folded into `notes`.) No emails, no calendar logic.
- **Setup required:** open `config.js` and paste your Supabase **anon public key** into `SUPABASE_ANON_KEY`. Everything else is pre-filled (project URL + table). The anon key is safe in client code; protect the table with Row Level Security that allows `insert` for anon and restricts `select`.
- **Hidden admin access:** triple-click/tap the footer logo within 2 seconds to open `admin.html`.
- **Admin login (`admin.html`):** "Welcome, Admin", password field, "Access Dashboard". Correct password `m11d34r-`. Wrong password shows "Access denied." The password is Base64-obfuscated in `config.js` (not plaintext in HTML). This is light obfuscation for a static site — not strong security; move auth to a backend for production.
- **Admin dashboard (`dashboard.html`):** lists all inquiries newest-first from Supabase, with search and a detail drawer showing every field (inquiry ID, name, email, phone, wedding date, consultation type, preferred time, notes, submitted date). Same luxury styling; responsive.
- **Contact page:** real links wired — Line, Telegram, WhatsApp, Email, Instagram, Facebook; TikTok left as a replaceable placeholder. Contact Information and Socials remain separate sections.
- **Mobile:** fullscreen luxury menu overlay (no content bleed-through); bottom mobile navigation stays removed.

### New / changed files
`config.js` (Supabase + admin config), `supabase-client.js` (DB wrapper), `dashboard.html` + `dashboard.js` (admin dashboard), `admin.html` + `admin.js` (login), updated `booking.js`, `contact.html`, `main.js`, `style.css`, `sw.js`.

## Mii6 changes
- Mobile menu: rebuilt as a true fullscreen overlay — opaque #FAF8F4, fade animation, close (×) top-right, items centered. No page content shows through; only the nav links + CTA appear inside.
- Contact page: Contact Information and Socials are now **separate sections**. Contact Information shows Phone (+66) 098 987 7965, Line, Telegram, WhatsApp, Gmail; Socials shows Instagram, TikTok, Facebook. All non-phone rows are clickable "Link →" anchors with placeholder URLs (#). Desktop = Location (left) / Contact Info + Socials (right); mobile stacks Location → Contact Information → Socials.
- Buttons: all CTAs share the dark-brown filled style with a slightly-lighter-brown hover; the booking page's **Request Consultation** button is unchanged.
- Mobile bottom bar / floating buttons remain removed.

## Mii5 changes
- Mobile hero: the SCROLL indicator now sits clearly **below** both buttons (desktop unchanged).
- Mobile menu: full-screen luxury overlay with a close (X) button, large type, generous spacing (replaces the dropdown).
- Buttons: all CTAs use the one filled dark style (the booking page's **Request Consultation** button is intentionally left as-is).
- Removed the mobile bottom navigation bar entirely.
- Contact page: three sections (Location · Contact Information · Visit the Atelier). Contact Information lists Phone, LINE, Instagram, TikTok, Facebook, Email — Phone shows normally, the rest are clickable "Link →" anchors with placeholder URLs (#).


> Photos are intentionally left blank (elegant "Miidear" placeholders). Drop your
> own images in and reference them by filename when ready.

## What changed in this pass

- **Logo** — the Miidear wordmark (white background chroma-keyed out to
  transparency) now appears in the header and footer of every page:
  `miidear-logo.png`.
- **Typography**
  - Calligraphic **script** for section statements only (Portfolio / The Atelier
    / A Selection of Our Work / Our Philosophy / Words From Our Couples / The
    Experience / Let's Begin / FAQs, etc.).
  - **Cormorant Garamond** for body and descriptive text.
  - **Jost** (with Raleway fallback) for navigation, buttons, and labels.
- **Colour system** — ~80% warm neutrals (`#FAF8F4`, `#E0DFDA`, `#D2CBAF`,
  `#CAC6BB`, `#A18C74`, `#868174`) with mint used **only** as small accents
  (hover, hairlines, active nav underline, stars, links, the timeline dots, and
  small button edges). No large mint fills.
- **Spacing** — significantly enlarged section padding, gutters, and negative
  space for a more expensive, editorial feel.
- **Copy** — hero, atelier, section titles, and CTAs updated to the brief.

## The script font (Angeline)

The brief specifies **Angeline by Muntab Art**, a commercial font not available
on a free CDN. The site currently renders the script in **Pinyon Script** (a
refined Google-hosted calligraphic face) so it looks right out of the box.

To switch to Angeline:
1. Buy/obtain the font and place `Angeline.woff2` / `Angeline.woff` in a `fonts/`
   folder.
2. In `style.css`, uncomment the `@font-face` block near the top and change:
   ```css
   --font-script: 'Angeline', 'Pinyon Script', cursive;
   ```
That single variable updates every script heading site-wide.

## Files (all in repository root)

```
index.html portfolio.html experience.html contact.html faq.html booking.html admin.html
style.css
main.js lightbox.js booking.js admin.js
manifest.json sw.js
miidear-logo.png
favicon.svg favicon.ico favicon-32.png apple-touch-icon.png
icon-192.png icon-512.png icon-maskable-512.png
.nojekyll README.md
```

## Deploy to GitHub Pages
1. Upload all files to the repository **root**.
2. Settings → Pages → Deploy from a branch → **main** / **/ (root)**.
3. Open the URL, e.g. `https://<you>.github.io/<repo>/`.

## Customise
- **Contact / social links**: `MIIDEAR_CONTACT` at the top of `main.js`.
- **Couples / collections / testimonials**: `MIIDEAR_DATA` / `MIIDEAR_TESTIMONIALS` in `main.js`.
- **Map**: replace the iframe `src` in `contact.html`.
- **Photos**: replace any `<div class="ph …"></div>` with `<img src="your.jpg" alt="…">`,
  or add `img` / `video` URLs to the image slots in `main.js` (the lightbox shows them).

## Booking & admin (demo)
- Bookings save to the browser via localStorage; the form prevents double-booking.
- Admin at `admin.html`, demo password `admin123` (in `admin.js`).
- Front-end demo only — add a backend later for shared, secure data.

## PWA
- `sw.js` caches the site for offline use. After any change, bump `CACHE_VERSION`
  (currently `miidear-v8`) so visitors receive the update.
- Test locally with `python3 -m http.server 8000`.

## Notes on preserved behaviour
- Only **View Collection** opens the lightbox; clicking a card image does not.
- Lightbox loops infinitely both directions (no dead ends); supports photo + video.
- Layout, navigation, user journey, responsiveness, and GitHub Pages paths are
  all preserved.
