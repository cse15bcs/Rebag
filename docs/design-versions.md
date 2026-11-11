# Rebag design versions

All versions belong to the same project at `D:/work/Rebag_`. They use separate page/style files under `public/`; authored templates for generated pages live under `templates/` in the same project. They are not separate repositories or workspaces.

| Version | Browser page | Authored layout and styling | Interaction |
| --- | --- | --- | --- |
| 01 / Original | `/index.html` | `public/index.html`, `public/style.css` | Shared full prototype. |
| 02 / Minimal Atelier | `/design-two.html` | `templates/design-two.html`, `public/design-two.css` | Shared full prototype; assembled with the canonical studio dialogs. |
| 03 / Future Studio | `/future-studio.html` | `public/future-studio.html`, `public/future-studio.css` | Lightweight standalone visual playground. |
| 04 / Orbit Lab | `/future-orbit.html` | `templates/future-orbit.html`, `public/future-orbit.css` | Shared visual controls plus stitch-view and ambient-motion switches. |

Generated `public/design-two.html` and `public/future-orbit.html` are ignored by Git and recreated by the dev/build wrapper. Edit their source templates rather than the generated output. Regenerate manually with `node scripts/build-design-two.mjs` and `node scripts/build-future-orbit.mjs` if needed during an already-running preview.

Orbit Lab shares the bag SVG and `public/future-studio.js` controls with Future Studio. Its small additional script is `public/future-orbit.js`. Its stitch view is an illustration effect, not a cutting pattern, actual material inspection or manufacturing blueprint. The tilting illustration is not a true 3D model. It does not restore reference-photo upload or create orders, payments, courier bookings or persistent customer records.

Ambient effects can be paused, pause while the page is hidden, and respect reduced-motion preferences. The existing bounded fabric transformation and manual slider remain available through the shared control engine. The fuller checkout and pricing workflow remains in versions 01 and 02.
