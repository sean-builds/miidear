# Miidear Digital Atelier · v2

Three isolated routes, with no incoming links added to the normal website:

- `../digitalinv/`: The Grand Conservatory sample, or a published design using `?id=…` and a private household key in the URL fragment.
- `../digitalbuild/`: blank canvas or seven editable suites. Templates, vector initials, original flowers, text, uploads, color cutouts, layers, grouping, alignment, page ordering, wedding settings, local projects, PNG/SVG/JSON exports and guest management.
- `../digitaldashboard/`: a clearly labeled sample, or a wedding-scoped guest book using its private access link. Search, response/diet filters, meal totals, CSV and print.

The guest invitation and editor use the same Fabric document model. The original watercolor is a transparent WebP. New monograms are licensed font outlines in true vector paths. Plain-background removal is a color-distance cutout with continuous alpha, feathering and edge decontamination; it is not a neural segmentation model.

## Live replies

Local design, saving, exports and previews work without a Google connection. Publishing and real RSVP writes require the owner's Apps Script deployment. The site does not claim a reply was saved when disconnected. See `server/setup.html` and `server/Code.gs` for the prepared service.

The service verifies confirmed Supabase sessions against an email allowlist for admin actions. It hashes revocable household/couple tokens, validates meals and guest capacity, and closes all reply changes at the exact server-side deadline. A draft is separate from the published snapshot. Sheets cell limits are handled through JSON-quoted text chunks that cannot become formulas; pointers are committed only after chunks are written under a script lock. Guest records are canonical in Households and projected into formatted Guests and Overview tabs.

The couple's page displays a styled view of the same private data, rather than publishing or embedding a publicly readable Google Sheet. The optional “Open private Google Sheet” link still requires Google access. Access requests are handled by the workbook owner. Hidden routes and `noindex` are conveniences, not authorization. Possession of a guest/couple link grants its scoped access; share those links only with the intended recipients.

This uses existing GitHub Pages and Google resources without adding a paid storage subscription. Google storage/execution and GitHub hosting quotas still apply. Large photographs should be resized; project JSON is capped at 2.2 MB. Up to 20 pages and 180 top-level objects per page are supported in this first version. This is a focused invitation editor, not every feature in Canva.

## Research and provenance

See [50-paper review](RESEARCH.md), [20-repository audit](REPOSITORY-AUDIT.md), [implementation mapping](APPLICATIONS.md), and [pinned dependencies](DEPENDENCIES.json). The corpus spans wedding studies, layout, typography, matting, vectors and creative authoring. 48 full texts were retrieved; two wedding studies were reviewed through primary publisher pages. Findings were adapted into three reusable design skills and 20 repository-reference skills. Upstream wedding repositories were read and downloaded locally; their dependencies, private examples and copyrighted artwork were not imported into the product. No claim is made to implement the papers' neural models.

Fabric and OpenType.js retain their MIT notices in vendor/. Fonts retain their Google Fonts OFL notices in assets/fonts/. Botanicals, frames, conservatory engraving and application code were authored for this project. The watercolor corner was generated for Miidear and retains real transparency.

## Validation

20 Node service/data tests cover authorization, wedding isolation, token revocation, deadlines, capacity, menu enforcement, response replacement, draft separation, Sheets chunking, formula escaping and cutout alpha. 46 browser checks cover every template page's serialization round trip, vector imports, SVG safety, library artwork, IndexedDB and transformed ungrouping. UI checks additionally cover blank-start editing, monogram creation, undo/redo, saved-project reload, preview, export and dashboard filtering. The owner-approved Google service is deployed. A live two-person reply was saved through the guest page and appeared with separate meals and dietary notes in the private couple dashboard. The atelier sign-in entry point is available in the header and at digitalbuild/#account.

The Grand Conservatory is one 700 × 2700 editable flowing composition. The guest presentation has a ceremonial, user-triggered gate opening, divided floral depth, warm light, staggered section reveals and a native-scroll scene offset. A visible Motion control, reduced-motion support and immediate keyboard opening preserve access. Countdown seconds update locally, without per-second service requests.
