# Design 02: the Rebag Atelier

The alternate visual direction is available at `/design-two.html`. The original remains at `/index.html`; comparison links connect the two. The default home route is unchanged.

Design 02 uses warm cream, rust and olive colours, editorial serif headings, a pattern-book hero, larger concept illustrations and a collection-first layout. Its sections explain the two customer routes, the design/fabric review process, preservation details, later-order rewards and enquiry readiness. Illustrations are labelled as concepts; no physical samples, real testimonials or live ordering claims have been invented.

The shared studio, approval dialogs, wallet and saved designs come from the canonical storefront. Both versions use the same application scripts and browser storage. Postcode entry and the separate courier breakdown remain in the final checkout step. Reference-photo entry remains commented out. Contact links stay unavailable until configured.

## Editing and generating

- Edit the alternate page shell in `templates/design-two.html` and styles in `public/design-two.css`.
- `scripts/build-design-two.mjs` inserts the canonical head/scripts and dialog markup from `public/index.html`, then emits the ignored `public/design-two.html` file.
- The framework dev/build wrapper and standalone preview server run this generator before serving/building. To regenerate manually, run `node scripts/build-design-two.mjs`.
- After changing shared studio markup during an already-running dev session, rerun the generator or restart the dev server before checking the second version.

The variant uses existing SVG bag illustrations and local CSS composition. No generated photography is presented as a manufactured sample. Its financial and operational behavior has the same prototype limits as the original site.
