# Invitation 01 — Guang & House

Photo-based, articulated 3D reconstruction of the invitation supplied in the
[reference folder](https://drive.google.com/drive/folders/1MYeYyjLL1pme1-x_Nx199iLXQESKZ6Zr).

The current presentation preserves the photographed print and foil. All textured
surfaces use `KHR_materials_unlit`, with no added tone mapping, simulated metallic
gold, or normal-map relighting. The original photos already contain lighting and
paper detail. Earlier derived PBR texture files remain as source experiments but
are not used by the current model. Geometry and the opening animation are retained.

The browser preview adds a separate, low-opacity reflective overlay masked to the
gold foil on the insert and crest. Its additive highlights change with angle without
darkening or recolouring the underlying photograph. This preview-only reflection
layer is not embedded in the downloaded GLB. The closed photo remains unchanged.

## Location and deliverables

Everything for this invitation is in `models/invitation-01/` inside the Miidear project.

- `invitation.glb` — portable glTF 2.0 binary model with embedded textures and a
  five-second opening animation. Can be imported into Blender or another glTF-compatible editor.
- `invitation-mobile.glb` — the same geometry, materials and animation with reduced
  texture resolutions for mobile devices. The preview selects it on narrow/touch screens.
- `index.html`, `viewer.css`, `viewer.js` — standalone scroll-controlled browser preview.
- `textures/` — rectified photographic surfaces and cutout textures.
- `references/` — original 17 photographs and two videos, stored locally and ignored by Git.
- `source-manifest.json` — original Drive file IDs, names, and expected byte lengths.
- `build_model.py` — repeatable texture preparation and GLB generation. Requires Pillow and NumPy.
- `validation.json` — result of validating the GLB with the Khronos glTF Validator.
- `validation-mobile.json` — validator result for the mobile edition.
- `vendor/` — Three.js 0.180.0 runtime and loaders, with its MIT license. No runtime CDN dependency for 3D.

The portfolio features this invitation with a link to the interactive page.
The featured entry retains the original site's text, image and link hooks.
Publishing requires write access to `sean-builds/miidear`; local integration alone
does not deploy the live website. Backend configuration is unchanged.

## Preview

The closed front presentation keeps the original photograph visible after loading.
Opening or inspecting switches to the articulated reconstruction. This preserves
the requested starting photograph without presenting it as a rendered 3D result.
The card slides upward behind the pocket before moving forward once fully clear.

Serve the Miidear project root using a local HTTP server, then open:

`http://127.0.0.1:8765/models/invitation-01/`

For example, from the project root: `python -m http.server 8765 --bind 127.0.0.1`.
Use HTTP rather than opening `index.html` directly, because browser modules and model loading need it.

Scroll normally to open the two gatefold covers and lift the loose printed card out.
Scroll backward to reverse. The slider and Closed/Unfold buttons provide alternatives.
Play runs the reveal automatically; Pause or a manual interaction stops playback.
Inspect in 3D enables drag-to-rotate and pinch/scroll-to-zoom. Finish inspecting restores the presentation camera.
Back view shows the reverse. Download 3D model saves the full-resolution GLB.
The download always supplies the full-resolution edition. Paper & foil and Crest
detail isolate those pieces with dedicated framing, inspection and Zoom in/out controls.

Reduced-motion preferences show the fully open state without scroll-driven animation.
The slider and state buttons still work. If WebGL fails, the reference photograph and
download link remain available. Google Fonts are optional; local serif/sans fallbacks are provided.

## Construction and fidelity

Eight meshes: back board, left gate, right gate, traced cut-paper crest,
rounded printed insert, shaped die-cut landscape pocket, and two hinge linings.
Named hinge nodes are embedded in the model. The crest is attached to the left
gate, as observed in the videos. The paper has bevelled edges; the crest and
pocket follow cut outlines instead of rectangular transparency cards. A morph
target bows the pocket outward as the covers open.

Print textures are up to 4096 pixels. Paper grain, foil and embossing retain their
appearance in the supplied photographs. Printed surfaces are unlit so the viewer
does not alter those colours with a second layer of simulated illumination.
Physical paper edges retain simple lighting; shadows in the photos are baked in.

The photographs supply all printed artwork and lettering. The opening sequence
follows `20261025_133207.mp4`: gates open, then the separate insert is lifted.
The card extraction distance and speed are presentation choices.

This is a visual reconstruction, not a dimensionally certified scan:

- Nominal closed size is **200 × 180 mm**, estimated from photographic proportions.
  This can be rescaled when measurements are available.
- Board thickness, hinge offsets, traced die-cut contours, and hidden internal folds are approximate.
- Artwork beneath the crest on the right cover comes from the unobstructed gate
  in `20261025_132904.jpg`, registered and colour-matched to the closed photograph.
- Foil, paper texture, and embossing are photographic rather than responsive
  material simulations. This is not a measured material scan.
- Hidden support tabs and fabrication folds are simplified. The illustrated
  couple is printed on the landscape pocket, as it is in the supplied references.

## Rebuild and validate

From the project root, with Python and the original references present:

`python models/invitation-01/build_model.py`

The validation helper uses the official `gltf-validator` npm package, installed locally
under `tools/node_modules/` and excluded from Git:

`npm install --prefix models/invitation-01/tools --no-save --package-lock=false gltf-validator`

`node models/invitation-01/tools/validate-model.cjs`

`node models/invitation-01/tools/validate-model.cjs invitation-mobile.glb`

The helper writes `validation.json` and exits with a failure status for validation errors.
