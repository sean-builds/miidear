# Evidence applied to this implementation

The linked research review records each paper's finding, design application and transfer limit. This file ties those adaptations and all 20 audited source patterns to working components. These are independently written implementations, not combined copies of 20 upstream applications.

| Evidence | Applied component |
|---|---|
| P01–P14: layout and visual hierarchy | `design.js` editable templates; `builder.js` alignment, center snapping, margins and page geometry; palette and typographic roles in `atelier.css` |
| P15–P22: image matting and boundaries | `core.js` continuous-alpha cutout and color decontamination; `builder.js` color hint, tolerance, feathering, original retention and three preview backgrounds |
| P23–P30: typography | `design.js` protected text widths and serif/script/sans roles; local licensed fonts; inspector font, size, alignment and spacing controls |
| P31–P38: vector graphics | `art.js` OpenType glyph outlines, layered wreath/crest/initials; outlined SVG import; SVG and transparent PNG exports; editable groups |
| P39–P46: creative authoring | `builder.js` blank-start and template-start, layers, precise inspector, history, direct manipulation and a shared serialized document |
| P47–P50: wedding-specific studies | configurable wording, optional music and emblems, editable culturally adaptable designs, recognizable ceremony/venue/RSVP structure |

| Repository reference | Independently implemented application |
|---|---|
| R01 rampatra/wedding-website | `guest.js`: calendar and directions actions |
| R02 dewanakl/undangan | `guest.js`: explicit opening and separate optional music control |
| R03 hallee9000/wedding-invitation-for-programmers | `invitation.css`, `guest.js`: staged user-triggered envelope reveal |
| R04 czue/django-wedding-website | `server/Code.gs`: household capacity and separate individual meal/dietary answers |
| R05 heejin-hwang/mobile-wedding-invitation | `digitalinv/index.html`: sticky navigation to details, palette and reply |
| R06 daengdoang/simple-wedding-invitation | `guest.js`: human-readable ceremony date, timezone and calendar download |
| R07 vinitshahdeo/Wedding-Invitation | `guest.js`: wedding countdown from one adjusted service clock |
| R08 NgodingSolusi/the-wedding-of-rehan-maulidan | `design.js`, `builder.js`: story chapters and user-uploaded photograph pages |
| R09 ericf/open-marriage | `server/Code.gs`: updates replace the same household's saved RSVP |
| R10 zouyaoji/wedding-invitation | `guest.js`: previous reply is restored with explicit saved/error feedback |
| R11 sakeenah-wedding/template | `core.js`, `service.js`: wedding-scoped document and private capabilities |
| R12 sandhikagalih/dino-wedding | `guest.js`: accessible open-letter action, focus transfer and reduced motion |
| R13 nijun008/weddingInvitations | `guest.js`, `core.js`: menu, event and dress configuration rendered from shared data |
| R14 LeeKyuHyuk/wedding-invitation | `core.js`, `design.js`: central wedding settings and bound canvas text |
| R15 JaminQ/wedding-invitation | `digitalinv/index.html`: distinct event, dress and RSVP sections with original art |
| R16 danixsofyan/wedding-invitation | `builder.js`, `couple.js`: separate operator editing and couple guest overview |
| R17 dewanakl/undangan-api | `server/Code.gs`: server authorization and meal/capacity/deadline validation |
| R18 sauanla/wedding-invitation | `core.js`, `builder.js`: named persistent projects and editable configuration |
| R19 S-jooyoung/WEDDING_INVITATION | native dialogs, focus controls, reduced motion and browser interaction checks |
| R20 sdprdh/wedding-invitation | `service.js`, `server/Code.gs`, `couple.js`: private Sheets source, decorated data view |

The research corpus and suitability judgments are design guidance. They do not establish that this product is scientifically optimal or that an upstream repository's security has been certified.

## Continuous guest presentation and ceremonial motion

The Grand Conservatory now uses one editable 700 × 2700 composition rather than three displayed cards. Guests scroll natively through blended paper, gardens and evening photography. Countdown seconds update in the browser. The existing exact server deadline still governs replies.

The user referenced https://lusion.co/ for immersive polish; its primary site describes integrated visual storytelling, motion and interactive journeys. This application interprets those principles through original wedding florals, antique gold, a split botanical arch, perspective gates and a warm-light passage, without importing its code or visual motifs. One-time chapter reveals orient the guest. A visible motion toggle, operating-system reduced motion and instant keyboard opening preserve access; RSVP editing remains immediate.

Validation: 46 browser document checks and 20 service/data tests passed. Live Google Sheets JSON-quoted storage was read back through a private fictional guest link. The fictional test RSVP was closed afterwards. The ceremony was visually checked at desktop and 390px, with no horizontal phone overflow; Motion off exposes all 24 reveal targets, and keyboard opening focuses the main invitation immediately.
