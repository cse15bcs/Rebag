# PIN-based inclusive price

Founder decision: customers fund courier costs through one displayed, postcode-specific combined price. Do not list a separate courier charge in the customer price breakdown. Explain the inclusion with an asterisk under each product and in review.

## Customer flow

1. Before a PIN is entered, show the starting sample making fee, e.g. **From INR 399***, with a note that collection/delivery is not quoted yet.
2. Enter a six-digit Indian PIN in the catalogue or studio. The fields stay synchronized for this page session.
3. If a current configured tariff matches the PIN, service city, design, route and garment count, add both courier legs to the making fee and display one inclusive estimate. Recalculate when any of those inputs change.
4. Show any available earlier contribution points as a discount against the making fee only, using the existing 25% demo cap. Do not increase redemption eligibility because delivery raises the total. Newly offered garments still earn only after acceptance for a later order.
5. Save the postcode, quote status, rate identity/expiry and inclusive price in the local draft. Customer TXT/JSON briefs show the bundled total and inclusion note. Earlier local drafts retain their old delivery-excluded meaning.

Suggested copy: **"*Includes garment collection to Meerut and bag delivery to your PIN. Customization may change the total. Parcel suitability and the final quote need confirmation."**

## Current setup and missing inputs

There is no connected courier provider and no approved tariff table. `public/config.js` deliberately contains `delivery: { originPincode: null, rates: [] }`. Do not invent origin PINs, geographic PIN-prefix mappings or courier fees. A well-formed PIN is not proof of serviceability.

Unconfigured, expired, ambiguous, mismatched or over-limit tariffs show **Courier quote required**. The customer can still save an unpriced design draft with no points spent; it is not a free-delivery or zero-value order. The currently displayed making fees and all reward balances remain prototype values.

To activate inclusive calculations, obtain the Meerut origin PIN and current provider quotations for both legs, including the relevant parcel weights/dimensions, garment limits, supported designs/routes, serviceable destination PINs and rate validity. Add only operator-confirmed tariff records. No API credentials belong in public configuration.

A record has these fields:

| Field | Meaning |
| --- | --- |
| `id` | Unique tariff reference, 1–80 characters. |
| `pincode`, `city` | Exact destination PIN and one of Delhi, Meerut, Ghaziabad, Noida or Greater Noida. |
| `shape` | `tote`, `mini` or `*` if the quoted parcel assumptions cover both. |
| `route` | `own-fabric`, `contribution` or `*` if both are covered. Catalogue prices before route selection need a wildcard tariff. |
| `maxGarments` | Confirmed parcel capacity, 1–20 garments. Larger counts require a fresh quotation. |
| `collectionPaise`, `deliveryPaise` | Confirmed nonnegative integer paise amounts for the two legs. Both must be explicit, including any genuine zero. |
| `validUntil` | Future ISO timestamp after which the tariff cannot be used. |

Use one matching record per context. Overlapping matches require review instead of selecting an arbitrary price. Internal transfers to makers, exceptional parcel sizes and return shipments are operational decisions; do not silently treat them as included if the agreed tariff does not cover them.

## Prototype boundaries

Calculations use configured tariffs in the browser; they do not call a live courier API, book a pickup or create a paid order. Before real checkout, the server must quote and validate the exact parcel and amount again. The existing YouPI lab only tests catalogue making fees, so delivery-priced drafts do not link to that mismatched test checkout. The standalone payment lab remains available separately.

Reference-photo entry remains commented out. Its implementation and historical approvals remain intact. Design-intent approvals cover design choices; they do not approve this financial quote or authorize cutting.

## Verification

`npm test` includes PIN format, missing/expired/ambiguous tariffs, city/design/route/garment matching, combined total calculation, earlier-points redemption, quote invalidation, local saving and customer brief regression checks. Test tariffs exist only in test fixtures or transient browser QA configuration; they are not shipped as rates.
