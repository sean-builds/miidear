# Illustrated ceremony refinement · 2 November 2026

## Primary-source research and application

- [NN/g, Executing UX Animations](https://www.nngroup.com/articles/animation-duration/): define trigger, transformations, timing and easing; frequent actions should remain short. Applied: click-triggered unsealing, a 400 ms anticipation before doors turn, a 2.8 s complete ceremony, immediate RSVP controls and keyboard/reduced-motion bypass.
- [Google Material, Choreography](https://m1.material.io/motion/choreography.html): preserve a focal point and shared elements through transitions. Applied: the outlined crest and same engraved botanical language connect the entrance, invitation and chapter ornaments; native scrolling continues throughout.
- [Figma, Motion timing](https://help.figma.com/hc/en-us/articles/41238756222615-Motion-design-fundamentals-Timing): larger transformations require appropriate timing. Applied: doors turn more slowly than the seal release; names appear after the doors begin parting.
- [Colville-Walker, Aman identity](https://colville-walker.com/work/aman-branding-identity-development-and-expansion): the originating studio describes refined typography, material standards, nature-inspired colors and narrative art direction. Design interpretation: vellum, engraved architecture, original vector flowers and antique gold, instead of a photorealistic fantasy scene. This is an aesthetic interpretation, not an empirical claim that these choices guarantee awe.

## Concrete fixes

The server-independent loading shell hides the original envelope until the chosen design, monogram, fonts and canvas finish preparing, including personal-link network requests. Errors dismiss the loading shell and expose a readable message.

New sample artwork uses authored SVG illustration. The old generated artwork remains available to existing saved projects; they are never silently overwritten. The revised Grand template uses the same flowing canvas with illustrated artwork. One paper color continues through hero, letter, practical sections and footer, replacing the abrupt color changes. Chapter crests draw their outlines, titles unfold and palette swatches settle into place. Motion off and reduced-motion paths expose all content.

The public sample now accepts a clearly labeled demonstration RSVP in sessionStorage. It does not send guest data to the couple or pretend to be a real reply. A personal guest link still uses server validation and Google Sheets. Preview mode remains unable to submit.
