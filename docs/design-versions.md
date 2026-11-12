# Rebag design versions

All versions belong to the same project at `D:/work/Rebag_`. They use separate page/style files under `public/`; authored templates for generated pages live under `templates/` in the same project. They are not separate repositories or workspaces.

**Selected website:** Design 04 / Orbit Studio, in Indigo Copper with Metallic Copper as the final default finish. The main `/` route, `/index.html` and `/future-orbit.html` serve the same functional storefront. The standalone preview server uses the same default. Earlier designs remain available in the footer's design archive.

| Version | Browser page | Authored layout and styling | Interaction |
| --- | --- | --- | --- |
| 01 / Original | `/design-one.html` | `public/design-one.html`, `public/style.css` | Shared full prototype. |
| 02 / Minimal Atelier | `/design-two.html` | `templates/design-two.html`, `public/design-two.css` | Shared full prototype; assembled with the canonical studio dialogs. |
| 03 / Future Studio | `/future-studio.html` | `public/future-studio.html`, `public/future-studio.css` | Lightweight standalone visual playground. |
| 04 / Orbit Studio (selected website) | `/` or `/future-orbit.html` | `templates/future-orbit.html`, `public/future-orbit.css`, `public/orbit-palettes.css`, `public/orbit-commerce.css` | Full shared prototype plus interactive illustration, stitch view, ambient motion, website palettes, lighting and detail points. |

Generated `public/design-two.html` and `public/future-orbit.html` are ignored by Git and recreated by the dev/build wrapper. Edit their source templates rather than the generated output. Regenerate manually with `node scripts/build-design-two.mjs` and `node scripts/build-future-orbit.mjs` if needed during an already-running preview.

The selected Orbit template also generates the tracked `public/index.html` landing page so static asset hosting and the framework home route agree on Design 04. Edit `templates/future-orbit.html` and regenerate; do not hand-edit that landing output. Both Orbit and Atelier generators take shared dependencies and studio dialogs from `public/design-one.html`. All three storefronts use the same design, rewards and approval logic and the same browser-local wallet key.

Orbit shares the bag SVG and `public/future-studio.js` visual controls with Future Studio. Its appearance script is `public/future-orbit.js`. Its stitch view is an illustration effect, not a cutting pattern, material inspection or manufacturing blueprint. The tilting illustration is not a true 3D model. “Build this bag” carries its shape and initials into the shared studio, with supported colour preferences carried over; a Copper mood is captured as a discussion note. Reference-photo entry remains commented out, while the original implementation and record support remain in the codebase.

The storefront includes both own-fabric and contribution routes, requested dimensions, schematic blueprints, private signed-in design approvals, local drafts, demo garment review and rewards. PIN entry and the separate bag, customization and courier breakdown appear only at checkout. No courier tariff is invented: unconfigured prices stay pending and spend no points. There are no live payments, orders or courier bookings. Approvals store design intent in the existing D1/R2 workflow; they do not authorize cutting.

Ambient effects can be paused, pause while the page is hidden, and respect reduced-motion preferences. The bounded fabric transformation and manual slider remain available through the shared control engine.

## Website colour study

Open Website atmosphere on Design 04 to compare Midnight Sage, Lunar Pearl, Indigo Copper, Sand Bronze and Arctic Cyan. These change the website background, text, panels, buttons, borders, textures, studio dialogs and orbital lighting; fabric moods remain an independent control. Indigo Copper / Metallic Copper is the final default. Matte remains available as an optional comparison. The fabric preview remains a separate material illustration.

The selected palette is reflected in a shareable query parameter, e.g. `/future-orbit.html?palette=pearl`. Only the five known keys are accepted; an unknown key falls back to Indigo Copper. No palette or customer input is stored in a database or browser wallet. The lighting control and optional detail overlay are visual exploration features. Detail points explain maker-review considerations and do not approve construction or cutting.

The metallic finish adds a static brushed-copper sheen to website buttons, the hero accent text, panel edges and orbital lighting. It does not add metallic fabric, metal hardware or manufacturing options to a bag. The normal website URL opens the metallic finish; older `?finish=metallic` links also work. Use `?finish=matte` to compare matte. Unknown finish values use the default metallic finish for Indigo; other palettes use matte. Neither choice is stored in the wallet or database.
