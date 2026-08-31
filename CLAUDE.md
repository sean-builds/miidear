# CLAUDE.md — Miidear Website Project

This file is read automatically at the start of every Claude Code session. It captures
the project, the owner's working style, and the hard rules. Follow it closely.

## What this project is

**Miidear** is a bespoke luxury wedding-invitation atelier in **Bangkok, Thailand
(Sukhumvit 26, K Village)**, by appointment. This repo is the atelier's website: a
**static site** (plain HTML/CSS/JS — no build step, no framework) with a **Supabase**
backend for live content and **EmailJS** for the booking form. Aesthetic is quiet,
high-end (think Cartier/Hermès): restraint, generous whitespace, calligraphic accents.

The owner is not a professional developer but is precise and detail-driven. The owner's
father — non-technical — manages day-to-day content through the dashboard, so **the
entire site must stay fully editable without touching code**. This is non-negotiable and
shapes every decision.

## The owner's working method (MATCH THIS EXACTLY)

The owner works **audit-first**. Before writing any code:
1. **Audit** — read the relevant files, enumerate every risk and every way the change
   could break something, and list the possible approaches.
2. **Choose** — pick the *safest* path that still achieves the goal, and say why.
3. **Proceed** — only then make the change, scoped as narrowly as possible.

Then **report clearly**: exact files changed, exact functions changed, what was added/
removed, and how to verify. Be honest about what you did and didn't test.

Additional expectations:
- **Never touch files or features the owner didn't ask you to change.** When told "only
  change X," change only X and confirm everything else is byte-identical.
- **No speculative or exploratory code.** No "while I'm here" changes.
- **Validate**: run `node --check` on any JS you edit; diff against the prior state to
  confirm scope; grep to confirm the change landed and nothing else moved.
- **Be honest about limits.** If something can't be verified without a browser/live
  Supabase, say so plainly rather than claiming it works. Do not fabricate results.
- If the requested change already exists or won't do what the owner expects, **say so**
  instead of inventing busywork.

## Architecture / where things live

Two layers, kept separate:
- **Files (this repo)** = structure, design, default text. Flat layout at repo root.
- **Live content = Supabase** (NOT in the files):
  - `reviews` table → testimonials (single "Name(s)" stored in `bride_name`, `groom_name` left empty)
  - `projects` table → portfolio (title, `bride_name` (single name), `description`,
    `banner_url` = cover, `category` (legacy/unused), `featured`, `sort_order`)
  - `project_images` table → gallery images per project (`project_id`, `url`, `sort_order`)
  - `site_content` table → editable page text (keys like `home:couples_title`)
  - `site_links` table → destination URLs for buttons (keys: `maps`, `line`, `whatsapp`, etc.)
  - `inquiries` table → booking submissions
  - Storage `media` bucket → uploaded images/video (tables store the URLs)
- **config.js** is the link to Supabase (`SUPABASE_URL`, table `inquiries`, bucket `media`).
  Only the **publishable/anon** key belongs here — never the service_role key.
- **supabase-client.js** exposes `window.MiidearDB` (anon client for public reads +
  booking insert; auth client for the dashboard).
- **EmailJS** sends booking emails (service configured in emailjs.js).

Pages: index, portfolio, experience, contact, booking, faq, admin, dashboard (.html).
Key JS: main, content, dashboard, admin, booking, carousel, lightbox, supabase-client,
config, emailjs. PWA: manifest.json, sw.js. AI descriptor: llms.txt.

## Critical conventions

- **Service worker cache version:** `sw.js` has `CACHE_VERSION` (currently
  **`miidear-v54`**). BUMP IT whenever you change any cached file, or users get stale
  files. Always `grep` the current value first — do not assume it; blind sed on an
  assumed string has silently failed before.
- **Shared helpers:** `couple(bride, groom)` renders names for BOTH reviews and projects.
  With `groom_name` empty it returns just the name (no trailing "&"). Reviews AND
  projects both now use a single "Name(s)" field saved to `bride_name`.
- **Guard clauses must track DOM changes.** `applyProjects()` in content.js has an entry
  guard; when portfolio markup changed (rails → single `#portfolioGrid`), the guard had
  to learn `#portfolioGrid` or it early-returned and rendered nothing. If you change
  which containers exist, update the guards in the same edit.
- **Portfolio** is one 3-column grid (`#portfolioGrid`), no categories. **Selection** on
  the homepage (`#featuredGrid`) shows only projects with `featured === true`.
- **Dashboard editing** uses an iframe preview (`?edit=1` sets `data-edit-mode`) that
  posts messages to the parent dashboard, which calls the real CRUD (`openReview`,
  `openProject`, `DB.deleteRow`, etc.). Edit controls must be gated so the PUBLIC site
  never shows them (`window.top === window.self` guard).
- **Booking form:** hard floor = Email, Consultation Type, Preferred Date, Preferred Time.
  Everything else (name, phone, bride/groom, wedding date, venue, guests, notes) is
  optional; blanks trigger an elegant confirmation modal ("A Few Details Remain") that
  lets the client proceed. Fail-open: if the modal errors, submit normally. Empty strings
  (not null) are sent for blank optional text fields to satisfy any NOT NULL constraints.

## Packaging / delivery (how the owner has been versioning)

- Work has been delivered as versioned folders `MiiNN` (currently at **Mii50**). Each
  new version = copy the previous, make the change, bump SW, deliver the folder + a zip.
- **Nested-folder bug to avoid:** a stray `Mii36/` full-site copy once got nested inside
  builds and propagated via `cp -r`. Before packaging, delete any nested `Mii*` folder
  and verify with `find . -type d -name 'Mii*'` that none remain.
- If you (Claude Code) now edit files in place instead of versioned folders, that's fine —
  just keep Git commits as the checkpoint/rollback mechanism, and still bump the SW.

## What must NOT happen

- Do not break no-code operability (the father must manage everything via the dashboard).
- Do not put the Supabase service_role key (or any secret) in client files.
- Do not add heavy media to Supabase (egress is limited; the hero video and large images
  should be served from FastComet at `https://mildear.com/media/...`, not Supabase).
- Do not reformat, "clean up," or refactor files you weren't asked to change.

## Hosting / deployment context (Claude Code cannot do these — they're manual)

- Target host: **FastComet** (cPanel/LiteSpeed), domain **mildear.com**. Media folder:
  `public_html/media/`.
- Claude Code edits FILES only. It cannot log into FastComet, Supabase, EmailJS, or the
  domain registrar. Those steps stay with the owner.
- Open launch item at last check: confirm mildear.com actually points to FastComet — a
  test image URL returned 404, which usually means DNS/domain not fully pointed yet.
- On any host move: keep config.js intact, serve over HTTPS, add the domain to Supabase
  allowed origins and EmailJS allowed origins, keep the media bucket public, bump SW.

## First things to do in a new session

1. Read this file (done automatically) and the current `sw.js` `CACHE_VERSION`.
2. When given a task, AUDIT first, state the plan and the safest path, then implement
   narrowly and report exact changes. Ask before touching anything outside the request.
