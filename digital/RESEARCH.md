# Miidear invitation research review

Review date: 2 November 2026. 50 studies: 48 full texts retrieved, two wedding-specific publisher abstracts/pages reviewed. This is a design-oriented review, not a systematic meta-analysis. Algorithmic papers inform clearly labeled design adaptations; their models are not claimed to be implemented.

The corpus spans wedding invitation design/genre, layout, typography, matting, vectors and creative authoring. Research PDFs and source archives stay local and are not redistributed with the website.

## P01 · Constrained Graphic Layout Generation via Latent Optimization

https://arxiv.org/abs/2108.00871v1

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Alignment and overlap constraints can be imposed separately from a layout generator.
- Design application (our inference): Offer alignment, safe margins, snap guides and explicit free positioning.
- Limit: Adapt the constraints; no GAN is trained or claimed.

## P02 · Neural Design Network: Graphic Layout Generation with Constraints

https://arxiv.org/abs/1912.09421v2

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Element relationships, layout construction and refinement are separate stages.
- Design application (our inference): Separate text, artwork and monogram objects; make relationships visible in layers.
- Limit: Bounding-box plausibility does not establish wedding taste.

## P03 · LayoutDiffusion: Improving Graphic Layout Generation by Discrete Diffusion Probabilistic Models

https://arxiv.org/abs/2303.11589v2

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Categorical type and ordinal position should not be treated identically.
- Design application (our inference): Preserve object type and editable geometry in a versioned document model.
- Limit: Document benchmarks do not prove a better invitation.

## P04 · Spot the Error: Non-autoregressive Graphic Layout Generation with Wireframe Locator

https://arxiv.org/abs/2401.16375v1

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Rendered wireframes expose spatial errors missed by token-only assessment.
- Design application (our inference): Inspect actual desktop/mobile renders and provide margin guides.
- Limit: Wireframe correctness cannot assess the emotional quality of flowers.

## P05 · LayoutFormer++: Conditional Graphic Layout Generation via Constraint Serialization and Decoding Space Restriction

https://arxiv.org/abs/2208.08037v2

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Explicit constraints improve control; excluding impossible choices reduces violations.
- Design application (our inference): Constrain invalid dimensions, restrict guest counts and give precise transform controls.
- Limit: This transfers a control principle, not the learned decoder.

## P06 · Composition-aware Graphic Layout GAN for Visual-textual Presentation Designs

https://arxiv.org/abs/2205.00303v3

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Image composition and spatial salience affect the suitability of overlaid text.
- Design application (our inference): Keep text in quiet negative space; put floral masses outside the reading column.
- Limit: Advertising poster evidence is adapted to stationery.

## P07 · LayoutGAN: Generating Graphic Layouts with Wireframe Discriminators

https://arxiv.org/abs/1901.06767v1

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Accurate geometric alignment is central to plausible graphic layouts.
- Design application (our inference): Implement center/edge alignment and consistent typographic axes.
- Limit: A generator is not required for deterministic alignment.

## P08 · Diffusion-based Document Layout Generation

https://arxiv.org/abs/2303.10787v1

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: An explicit sequence of typed boxes permits document editing beyond raster synthesis.
- Design application (our inference): Persist semantic objects rather than a screenshot of the invitation.
- Limit: The source concerns document generation, not RSVP workflow.

## P09 · Constrained Layout Generation with Factor Graphs

https://arxiv.org/abs/2404.00385v1

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Constraints can attach to parts or edges of objects rather than only whole objects.
- Design application (our inference): Snap object edges and centers, with optional precise numeric positioning.
- Limit: Floorplan research; the application here is an explicitly stated analogy.

## P10 · Variational Transformer Networks for Layout Generation

https://arxiv.org/abs/2104.02416v1

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Global relationships capture margins and alignment beyond individual objects.
- Design application (our inference): Use shared paper dimensions, margins and consistent presets across pages.
- Limit: Do not claim learned rules are implemented.

## P11 · LayoutFlow: Flow Matching for Layout Generation

https://arxiv.org/abs/2403.18187v2

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: A unified conditional representation can support several layout tasks.
- Design application (our inference): Blank pages and templates use one document model and one renderer.
- Limit: Flow matching is not shipped; the representation lesson is used.

## P12 · READ: Recursive Autoencoders for Document Layout Generation

https://arxiv.org/abs/1909.00302v4

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Hierarchical structure models layouts but can still leave overlap and alignment artifacts.
- Design application (our inference): Keep groups editable and run a human render review after template creation.
- Limit: Structural similarity is not sufficient visual QA.

## P13 · AesthetiQ: Enhancing Graphic Layout Design via Aesthetic-Aware Preference Alignment of Multi-modal Large Language Models

https://arxiv.org/abs/2503.00591v1

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Final rendered output and aesthetic preferences add information beyond box prediction.
- Design application (our inference): Review typography, hierarchy, palette, ornament density and brief fidelity separately.
- Limit: Model-based preference scores are not universal proof of beauty.

## P14 · LayoutTransformer: Layout Generation and Completion with Self-attention

https://arxiv.org/abs/2006.14615v2

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Compositional primitives allow both empty-start and seeded layout completion.
- Design application (our inference): Support a genuinely blank canvas alongside editable template starting points.
- Limit: Dataset frequency biases are a reason to retain manual control.

## P15 · Deep Image Matting

https://arxiv.org/abs/1703.03872v3

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Alpha estimation and a separate refinement stage improve composite boundaries.
- Design application (our inference): Provide soft-edge background removal and inspect the result on dark and light paper.
- Limit: The browser tool is a color-based cutout, not this neural method.

## P16 · Deep Image Matting: A Comprehensive Survey

https://arxiv.org/abs/2304.04672v1

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Matting estimates continuous opacity; segmentation only labels foreground/background.
- Design application (our inference): Preserve PNG alpha and expose tolerance/feathering rather than only binary deletion.
- Limit: Similar foreground/background colors remain intrinsically ambiguous.

## P17 · Automatic Trimap Generation for Image Matting

https://arxiv.org/abs/1707.00333v2

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: A trimap distinguishes known foreground, known background and uncertain edges.
- Design application (our inference): Treat the selected background color as evidence, preview uncertain boundary pixels.
- Limit: Automatic trimap inference is not equivalent to thresholding.

## P18 · High-Resolution Deep Image Matting

https://arxiv.org/abs/2009.06613v2

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: High-resolution boundary quality and global context must be balanced with hardware limits.
- Design application (our inference): Keep uploaded originals in the session; limit preview size and allow high-resolution export.
- Limit: Browser processing has a documented image-size ceiling.

## P19 · Hierarchical Opacity Propagation for Image Matting

https://arxiv.org/abs/2004.03249v1

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Opacity propagation benefits from both local and wider context.
- Design application (our inference): Avoid blunt whole-image binary masking; preserve fine floral strokes and semitransparent edges.
- Limit: The deterministic browser cutout cannot reproduce learned contextual inference.

## P20 · Deep Image Matting with Flexible Guidance Input

https://arxiv.org/abs/2110.10898v1

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Practical matting can accept simpler user hints rather than demanding a perfect trimap.
- Design application (our inference): Let the user choose background color and adjust removal strength with immediate preview.
- Limit: Hints are useful, but difficult photographs still need manual preparation.

## P21 · Learning Trimaps via Clicks for Image Matting

https://arxiv.org/abs/2404.00335v3

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Small interactive inputs can make matting substantially more approachable.
- Design application (our inference): Provide an understandable background picker and reset instead of hidden automatic guesses.
- Limit: The paper model and its reported speed are not claimed for this tool.

## P22 · Natural Image Matting via Guided Contextual Attention

https://arxiv.org/abs/2001.04069v1

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Semitransparent boundaries are vulnerable to blur and local color ambiguity.
- Design application (our inference): Use edge decontamination and a contrasting preview to catch pale halos.
- Limit: White petals on white paper can be lost; retain the original and make undo possible.

## P23 · FontCraft: Multimodal Font Design Using Interactive Bayesian Optimization

https://arxiv.org/abs/2502.11399v1

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Non-expert font exploration benefits from reversible choices and style propagation.
- Design application (our inference): Offer curated font pairings, per-letter monogram controls and undo.
- Limit: Use licensed font outlines; do not pretend to train or generate a new typeface.

## P24 · Word-As-Image for Semantic Typography

https://arxiv.org/abs/2303.01818v2

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Expressive letter outlines can retain meaning when legibility is explicitly preserved.
- Design application (our inference): Build actual vector initial outlines with modest overlap and controllable spacing.
- Limit: Keep guest information readable; expressive monograms need not imitate semantic diffusion.

## P25 · Towards Diverse and Consistent Typography Generation

https://arxiv.org/abs/2309.02099v1

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Typographic variation is more coherent when consistency relationships are maintained.
- Design application (our inference): Use coordinated title, script and body roles with explicit font and tracking controls.
- Limit: Curated roles are a design adaptation rather than an autoregressive model.

## P26 · The Cognitive Type Project -- Mapping Typography to Cognition

https://arxiv.org/abs/2403.04087v1

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Legibility, beauty and memorability are different cognitive properties.
- Design application (our inference): Reserve ornate script for names/initials and use clear body fonts for dates and RSVP.
- Limit: This is a research agenda; it does not prove a specific font raises conversion.

## P27 · FonTS: Text Rendering with Typography and Style Controls

https://arxiv.org/abs/2412.00136v3

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Word-level typography controls reduce the mismatch between intended and rendered styling.
- Design application (our inference): Keep every text object editable, with size, family, tracking, weight and line-height.
- Limit: The editor uses real text rendering, not image generation.

## P28 · Khattat: Enhancing Readability and Concept Representation of Semantic Typography

https://arxiv.org/abs/2410.03748v1

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Semantic expression must be balanced against letter recognition.
- Design application (our inference): Retain recognizable initials in overlapping monograms and provide a plain paired alternative.
- Limit: No OCR model is deployed; inspect small and large output manually.

## P29 · FontCLIP: A Semantic Typography Visual-Language Model for Multilingual Font Applications

https://arxiv.org/abs/2403.06453v1

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Semantic font descriptions can help non-experts navigate large font collections.
- Design application (our inference): Label curated choices by mood and role as well as font name.
- Limit: Verify glyph availability; Roman coverage does not imply Thai or CJK coverage.

## P30 · Intelligent Artistic Typography: A Comprehensive Review of Artistic Text Design and Generation

https://arxiv.org/abs/2407.14774v1

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Text effects and changes to glyph shape are distinct operations with different tradeoffs.
- Design application (our inference): Separate text styling from monogram outline generation; keep both reversible.
- Limit: A survey taxonomy is not a recipe for one universally best design.

## P31 · Text-Guided Vector Graphics Customization

https://arxiv.org/abs/2309.12302v1

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Preserving paths and layer topology retains the editable identity of vector artwork.
- Design application (our inference): Keep monograms, wreaths and flower groups as scalable paths, not flattened photographs.
- Limit: Original paths and licensed font outlines are used; no exemplar artwork is copied.

## P32 · Im2Vec: Synthesizing Vector Graphics without Vector Supervision

https://arxiv.org/abs/2102.02798v3

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Rasterizing a design can discard the key advantages of vector representation.
- Design application (our inference): Default generated monograms to transparent SVG with a PNG export option.
- Limit: The project does not implement neural raster-to-vector reconstruction.

## P33 · A Learned Representation for Scalable Vector Graphics

https://arxiv.org/abs/1904.02632v1

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Vector representations capture letter structure independently of output resolution.
- Design application (our inference): Generate initials from OpenType glyph paths and reuse at seal, crest and page scales.
- Limit: Font drawing requires correct licensing and glyph coverage.

## P34 · Interactive Flexible Style Transfer for Vector Graphics

https://arxiv.org/abs/2309.11628v1

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Designers value control over which style attributes transfer across graphics.
- Design application (our inference): Allow artwork color/opacity edits without forcing text or page colors to change.
- Limit: The paper notes generated designs can be hard to edit; preserve familiar direct controls.

## P35 · Interactively Optimizing Layout Transfer for Vector Graphics

https://arxiv.org/abs/2309.11635v1

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Layout transfer works better when users can adjust both relationships and individual elements.
- Design application (our inference): Offer templates plus grouping, ungrouping, alignment and per-object transforms.
- Limit: Do not silently rearrange a client-approved composition.

## P36 · SuperSVG: Superpixel-based Scalable Vector Graphics Synthesis

https://arxiv.org/abs/2406.09794v1

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Coarse structure and detail refinement are different steps in vectorization.
- Design application (our inference): Build floral assets from editable groups, then inspect detail density at mobile size.
- Limit: The browser tool does not turn arbitrary photos into neural SVGs.

## P37 · DeepSVG: A Hierarchical Generative Network for Vector Graphics Animation

https://arxiv.org/abs/2007.11301v3

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Separating high-level shapes from low-level path commands supports reusable SVG structure.
- Design application (our inference): Keep botanical arrangements grouped yet ungroupable; name objects in the layers panel.
- Limit: No latent interpolation model is required for grouped editing.

## P38 · Poisson Vector Graphics (PVG) and Its Closed-Form Solver

https://arxiv.org/abs/1701.04303v1

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Shape, color and tone can be controlled separately in vector authoring.
- Design application (our inference): Use subtle tonal layers for watercolor-like botanicals while retaining a one-color option.
- Limit: Gradients are an aesthetic adaptation; no Poisson solver is claimed.

## P39 · Sketch-based Creativity Support Tools using Deep Learning

https://arxiv.org/abs/2111.09991v1

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Creative tools can support discovery, retrieval and critique as separate acts.
- Design application (our inference): Provide a browseable asset library, manual placement and a preview/review step.
- Limit: Sketch retrieval and conversational generation are outside this version.

## P40 · Beyond Productivity: Rethinking the Impact of Creativity Support Tools

https://arxiv.org/abs/2505.01601v1

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: A review of 173 evaluations argues that productivity alone is too narrow for creativity tools.
- Design application (our inference): Evaluate freedom, reversibility, clarity and output quality alongside task completion.
- Limit: This is a review, not evidence that more controls always improve creativity.

## P41 · Bidirectional Evaluation with Direct Manipulation

https://arxiv.org/abs/1809.04209v2

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Direct output changes can synchronize back to the underlying representation.
- Design application (our inference): Dragging and inspector edits must update the same saved object state and preview.
- Limit: The implementation uses serialized objects, not program synthesis.

## P42 · Guru, Partner, or Pencil Sharpener? Understanding Designers' Attitudes Towards Intelligent Creativity Support Tools

https://arxiv.org/abs/2007.04848v1

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Professional designers show pragmatic interest in assistance without giving up authorship.
- Design application (our inference): Templates and automatic cutouts remain optional; always support starting from blank.
- Limit: A small professional survey should not be generalized to every client.

## P43 · Semi-Automated SVG Programming via Direct Manipulation

https://arxiv.org/abs/1608.02829v1

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Grouping and explicit relationships can make sophisticated editing available without code.
- Design application (our inference): Expose group/ungroup, duplicate and layer controls as ordinary UI actions.
- Limit: Do not expose programming as a requirement for the atelier operator.

## P44 · Programmatic and Direct Manipulation, Together at Last

https://arxiv.org/abs/1507.02988v3

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Immediate visual feedback and reusable abstractions have complementary value.
- Design application (our inference): Use a direct-manipulation canvas plus editable reusable templates and JSON backup.
- Limit: There is no automatic code inference in this first version.

## P45 · Towards Sustainable Creativity Support: An Exploratory Study on Prompt Based Image Generation

https://arxiv.org/abs/2504.07879v2

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: A 24-person exploratory study found lower-cost generation settings without significant loss in measured support.
- Design application (our inference): Prefer reusable deterministic vector assets over repeatedly generating large raster alternatives.
- Limit: The result does not establish a universal energy or creativity guarantee.

## P46 · Hybrid design tools - making of a digitally augmented blackboard

https://arxiv.org/abs/1809.04857v1

- Evidence: Full text retrieved; abstract and relevant method/discussion sections reviewed.
- Finding: Hybrid workflows preserve useful qualities of traditional drawing while enabling digital revision.
- Design application (our inference): Let atelier artwork enter as images/SVG while names and event details remain editable.
- Limit: Architecture education evidence transfers only as a workflow analogy.

## P47 · Designing User Interface (UI) & User Experience (UX) Mobile Website Templates Digital Wedding Invitations

https://journal.binus.ac.id/index.php/ijvcdc/article/view/10756

- Evidence: Primary publisher abstract/page reviewed through web search.
- Finding: A 92-person design-thinking study preferred simple modern invitations and several customizable template directions.
- Design application (our inference): Offer refined template choices and mobile previews; keep client customization central.
- Limit: Publisher abstract/page reviewed; the local full text was inaccessible. Sample and cultural context limit generalization.

## P48 · Religious Aesthetics of Wedding Invitation Cards in East Java Community

https://ijsses.tiu.edu.iq/index.php/ijsses/article/view/502

- Evidence: Primary publisher abstract/page reviewed through web search.
- Finding: Visual form, ornament, wording and material jointly express cultural and religious meaning.
- Design application (our inference): Make wording, imagery and ornament optional and editable; do not impose a religious symbol.
- Limit: Publisher abstract/page reviewed; local full text inaccessible. East Java findings are contextual, not Thai client defaults.

## P49 · Implementation of Digital Invitation by Utilizing Grapes.js for Invitation Design and QR Scanner for Attendance Tracking

https://ejournal.uin-suska.ac.id/index.php/coreit/article/view/38120

- Evidence: Full-text sections reviewed.
- Finding: The system distinguishes client authoring, guest attendance and administrative workflows; reported respondents valued customization and confirmation.
- Design application (our inference): Separate builder, invitation and couple dashboard routes, retaining a functional RSVP component.
- Limit: Small self-reported study; reported satisfaction is not independent validation of this implementation. Payments and QR scanning are outside the request.

## P50 · Wedding Invitation Genre: Communicating Sociocultural Identities of Iraqi Society

https://journals.umcs.pl/lsmll/article/view/4012/0

- Evidence: Full-text sections reviewed.
- Finding: A corpus of 250 invitations found recognizable information moves and culturally encoded wording/visual choices.
- Design application (our inference): Keep hosts, names, date, venue and RSVP discoverable while allowing chapter order and wording to change.
- Limit: Genre findings are culturally specific; preserve client authorship instead of copying the corpus.
