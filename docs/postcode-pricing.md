# Checkout postcode pricing

Latest founder direction: postcode entry, courier charges and the complete price breakdown belong in the final checkout/review step. This replaces the earlier catalogue-level inclusive-price approach.

## Customer flow

1. The main page shows sample bag prices only. There is no postcode field, courier estimate, courier asterisk or shipping-dependent catalogue price.
2. The design window calculates the bag and customization charges independently of courier charges. Its footer shows the bag plus customization subtotal.
3. The final Review & checkout step shows the selected design, postcode input and a complete breakdown: bag price, layout customization, handle/strap customization, customization subtotal, bag/customization subtotal, earlier points discount, subtotal after points, courier collection/delivery charge and final estimated total.
4. A current matching tariff supplies the courier charge after postcode entry. Missing, invalid or unmatched postcodes leave the bag/customization calculations visible and mark only the courier/final total as pending. Postcode entry is required for final draft saving, not for reaching checkout.
5. Earlier accepted contribution points apply to making/customization charges under the existing demo cap; courier charges do not increase eligibility. Entering a matching postcode refreshes point controls immediately. New contributions remain usable only on a later order after acceptance.
6. New local drafts carry checkout presentation metadata. Downloaded briefs show separate bag, customization and courier amounts. Older delivery-inclusive drafts retain their recorded price meaning when exported.

## Current setup and missing inputs

There is no connected courier provider and no approved tariff table. `public/config.js` deliberately contains `delivery: { originPincode: null, rates: [] }`. Do not invent origin PINs, geographic PIN-prefix mappings or courier fees. A well-formed PIN is not proof of serviceability.

Unconfigured, expired, ambiguous, mismatched or over-limit tariffs show **Courier quote required**. The customer can still save an unpriced design draft with no points spent; it is not a free-delivery or zero-value order. The currently displayed making fees and all reward balances remain prototype values.

To activate courier calculations, obtain the Meerut origin PIN and current provider quotations for both legs, including the relevant parcel weights/dimensions, garment limits, supported designs/routes, serviceable destination PINs and rate validity. Add only operator-confirmed tariff records. No API credentials belong in public configuration.

A record has these fields:

| Field | Meaning |
| --- | --- |
| `id` | Unique tariff reference, 1–80 characters. |
| `pincode`, `city` | Exact destination PIN and one of Delhi, Meerut, Ghaziabad, Noida or Greater Noida. |
| `shape` | `tote`, `mini` or `*` if the quoted parcel assumptions cover both. |
| `route` | `own-fabric`, `contribution` or `*` if both are covered. Use a wildcard only when the approved parcel assumptions cover both routes. |
| `maxGarments` | Confirmed parcel capacity, 1–20 garments. Larger counts require a fresh quotation. |
| `collectionPaise`, `deliveryPaise` | Confirmed nonnegative integer paise amounts for the two legs. Both must be explicit, including any genuine zero. |
| `validUntil` | Future ISO timestamp after which the tariff cannot be used. |

Use one matching record per context. Overlapping matches require review instead of selecting an arbitrary price. Internal transfers to makers, exceptional parcel sizes and return shipments are operational decisions; do not silently treat them as included if the agreed tariff does not cover them.

## Prototype boundaries

Calculations use configured tariffs in the browser; they do not call a live courier API, book a pickup or create a paid order. Before real checkout, the server must quote and validate the exact parcel and amount again. The existing YouPI lab only tests catalogue making fees, so delivery-priced drafts do not link to that mismatched test checkout. The standalone payment lab remains available separately.

Reference-photo entry remains commented out. Its implementation and historical approvals remain intact. Design-intent approvals cover design choices; they do not approve this financial quote or authorize cutting.

## Verification

`npm test` includes PIN format, missing/expired/ambiguous tariffs, city/design/route/garment matching, combined total calculation, earlier-points redemption, quote invalidation, local saving and customer brief regression checks. Test tariffs exist only in test fixtures or transient browser QA configuration; they are not shipped as rates.
