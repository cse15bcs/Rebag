# Reference-photo designs

The two starting points are independent:

- **Start from a bag shape** uses the Everyday Tote or Little Mood, with the existing colour, layout, handle and pocket controls.
- **Use my reference photo** shows the uploaded photograph in the left prototype window. Its blueprint uses numeric contours derived from that image, never a substituted starter bag. The starter controls are hidden. Requested changes, depth, handle drop and initials are recorded for maker review.

## Photo-to-outline workflow

1. Choose a JPG, PNG or WebP up to 5 MB. A clear front view against a plain background works best. Images over 40 megapixels or 10,000 pixels on either side are rejected in the browser before tracing.
2. The browser samples the image locally, separates foreground using transparency or border background colours, and traces its largest connected outline. It can suggest enclosed handle openings near the top. It does not recognize bag categories or infer hidden construction. Three-quarter photos retain their visible profile; they are not converted into an inferred front view.
3. Check the overlay against the original photo. Crop to the bag, adjust background sensitivity, move/delete points, or trace the outer boundary and handle openings manually. Detail lines can describe seams or pockets. Hands, shadows, patterned backgrounds and fabric matching the background may need manual correction. A failed extraction leaves an explicit empty state.
4. The blueprint redraws those paths at the requested dimensions. Overall height includes the visible handles/strap. Photo proportions are locked by default; unlocking records an intentional change. Only the visible profile is traced; depth, handle drop, side and back construction need maker confirmation.
5. Confirm the outline, then review the whole design and explicitly approve/send. Editing any design choice clears design approval; editing the outline or replacing the photo also clears outline confirmation. An immutable earlier approval remains accessible in history.

No image-analysis service or model receives the photo during tracing. The original selected photo is uploaded to private storage only with explicit design approval, along with the normalized outline and requested changes. Local saved drafts retain the geometry but not photo bytes. Sign-in, user isolation and private photo retrieval remain unchanged.

## Approval integrity and pricing

The server requires reference-specific shape/layout/handle/colour values and a reviewed outline. Geometry uses bounded numeric coordinates, limited path/point counts, source image proportions and the SHA-256 of the reference file. It rejects an outline linked to another photo. The canonical approval fingerprint includes both geometry and original image hashes. Moving points requires a new version; it cannot overwrite an earlier snapshot.

Reference mode uses schema 2 and approval wording `design-intent-v2-reference-outline`. Historical schema 1 reference approvals preserve their original starter proposal and are labelled **archived / photo was not traced**. Historical consent wording remains unchanged.

Custom reference designs require a maker quote. The UI does not assign the Tote/Mini price, redeem points against an unknown subtotal or offer a preset-price payment test. Approved contribution rewards remain available for a later priced order.

The result is a customer-reviewed design brief, not a manufacturing CAD drawing, automatic photorealistic redesign, final quotation or permission to cut treasured fabric.

## Verification

Run `npm test` for contour, approval isolation/versioning, photo binding, unknown-price rewards, briefs and payment regressions. `node node_modules/typescript/bin/tsc --noEmit` checks framework types. Build using the Sites build helper. Browser QA covers real photo input events, contour rendering, review/approval, editing invalidation, manual tracing, switching between modes and responsive widths 320/390/768/1440.
