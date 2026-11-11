# Rebag design versions

All versions belong to the same project at `D:/work/Rebag_`. They use separate page/style files under `public/`; authored templates for generated pages live under `templates/` in the same project. They are not separate repositories or workspaces.

**Selected base:** the founder selected Design 04 / Orbit Studio. The main `/` route now opens `/future-orbit.html`; the standalone preview server uses the same default. The original remains available at `/design-one.html` and the full design/checkout prototype remains in versions 01 and 02.

| Version | Browser page | Authored layout and styling | Interaction |
| --- | --- | --- | --- |
| 01 / Original | `/design-one.html` | `public/design-one.html`, `public/style.css` | Shared full prototype. |
| 02 / Minimal Atelier | `/design-two.html` | `templates/design-two.html`, `public/design-two.css` | Shared full prototype; assembled with the canonical studio dialogs. |
| 03 / Future Studio | `/future-studio.html` | `public/future-studio.html`, `public/future-studio.css` | Lightweight standalone visual playground. |
| 04 / Orbit Studio (selected base) | `/` or `/future-orbit.html` | `templates/future-orbit.html`, `public/future-orbit.css`, `public/orbit-palettes.css` | Visual controls, stitch view, ambient motion, five website palettes, lighting and detail points. |

Generated `public/design-two.html` and `public/future-orbit.html` are ignored by Git and recreated by the dev/build wrapper. Edit their source templates rather than the generated output. Regenerate manually with `node scripts/build-design-two.mjs` and `node scripts/build-future-orbit.mjs` if needed during an already-running preview.

The selected Orbit template also generates the tracked `public/index.html` landing page so static asset hosting and the framework home route agree on Design 04. Edit `templates/future-orbit.html` and regenerate; do not hand-edit that landing output. The original full storefront, including the shared studio dialogs, is authored in `public/design-one.html` and is the input to the Atelier generator.

Orbit Lab shares the bag SVG and `public/future-studio.js` controls with Future Studio. Its small additional script is `public/future-orbit.js`. Its stitch view is an illustration effect, not a cutting pattern, actual material inspection or manufacturing blueprint. The tilting illustration is not a true 3D model. It does not restore reference-photo upload or create orders, payments, courier bookings or persistent customer records.

Ambient effects can be paused, pause while the page is hidden, and respect reduced-motion preferences. The existing bounded fabric transformation and manual slider remain available through the shared control engine. The fuller checkout and pricing workflow remains in versions 01 and 02.

## Website colour study

Use the palette bar on Design 04 to compare Midnight Sage, Lunar Pearl, Indigo Copper, Sand Bronze and Arctic Cyan. These change the website background, text, panels, buttons, borders, textures and orbital lighting; fabric moods remain an independent control. Midnight Sage is the default and subjective starting recommendation. Lunar Pearl is the proposed light alternative.

The selected palette is reflected in a shareable query parameter, e.g. `/future-orbit.html?palette=pearl`. Only the five known keys are accepted; an unknown key falls back to Midnight Sage. No palette or customer input is stored in a database or browser wallet. The lighting control and optional detail overlay are visual exploration features. Detail points explain maker-review considerations and do not approve construction or cutting.
