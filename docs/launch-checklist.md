# Rebag launch checklist

Planning baseline: 4 November 2026; founder direction updated 11 November 2026. Confirmed launch region: Delhi NCR, India.

## Founder decisions recorded

- Initial shapes: Everyday Tote and Little Mood, with customer-selected shape/design in the customization window.
- Two routes: use the customer's own fabric, or accept clothing contributions for points and sell a bag made from Rebag materials.
- Instagram will introduce the concept and receive initial preorder conversations. The founder confirmed the handle is not ready; do not invent a contact destination. WhatsApp is a proposed supporting channel; its number is pending.
- Clothing rewards become usable on a later order after acceptance, as confirmed by the founder. Pending/rejected garments cannot fund checkout.
- The website will be developed in parallel. A public website checkout is not a prerequisite for the first social enquiry.
- Founder planning inputs: five tailors at 50 bags each per week (250 total), INR 250 per bag including material, and courier handover. Maker quotes, availability, tested capacity and turnaround remain to be confirmed.
- The founder chose to make samples of both website designs: Everyday Tote and Little Mood. Other bag designs are available, but completion of these two samples and a sample budget/date remain pending. See [the sample and pilot plan](./sample-and-pilot-plan.md) and [costing sheet](./pilot-costing.csv).
- Meerut, Uttar Pradesh is the confirmed main receiving and dispatch base. Planned customer service cities are Delhi, Meerut, Ghaziabad, Noida and Greater Noida. Exact base address, courier coverage and charges remain pending.
- See [the initial offer](./initial-offer.md) for detailed confirmed and pending decisions.

## Current position

- The prototype is privately hosted and the application source is on GitHub.
- Bag customization, garment tracking, points and checkout are demonstrations.
- Orders and reward balances are stored in the browser, not in customer accounts or a production database.
- Design-intent approvals now have a separate signed-in, site-backed D1/R2 workflow with versioned blueprints and private reference photos. They do not create a paid order or approve cutting. See [the approval workflow](./design-approval-workflow.md).
- Garment reviews are simulations. There are no live payments, courier bookings or maker notifications.
- A keepsake-bag concept video and promotional copy are available. The imagery illustrates the idea, rather than showing manufactured samples.

Customer pricing decision (revised): show bag prices on the main page and calculate bag/customization charges independently. Collect the PIN and add courier charges as separate lines only in the final checkout/review breakdown. Current provider tariffs and the Meerut origin PIN are still pending. See [postcode pricing](./postcode-pricing.md).

## Suggested launch sequence

1. Introduce the concept on Instagram and receive enquiries through the chosen chat channel.
2. In parallel, confirm makers, make physical samples, cost the products and agree garment handling.
3. Prepare the website's concept explanation, two customer routes, customization window and chat handoff.
4. Run a small, capacity-limited pilot with individual fabric review, agreed designs and quotes.
5. Add website-based orders, live rewards and checkout as the relevant operational and technical arrangements become ready.

A customer journey to implement:

Enquiry → fabric photo review → provisional quote → garment handover → receipt and inspection → final design and price approval → payment → making → quality check → dispatch → delivery.

Any reservation deposit or payment before physical inspection needs its own clear acceptance, cancellation and refund process.

## Readiness checklist

| # | Workstream | Arrange or decide | Technical or process deliverable | Ready |
| --- | --- | --- | --- | --- |
| 1 | Initial offer | Delhi NCR, two starter shapes, both customer routes and social-first enquiries are confirmed. Finalize fabric/design boundaries and contact details. | Real product descriptions, customization boundaries and fabric guidelines; see initial-offer.md. | [ ] |
| 2 | Physical samples | Make samples from non-irreplaceable fabric; test seams, handles, lining and intended load. Take real photos and measurements. | Product listings based on actual samples; clearly label concept imagery. | [ ] |
| 3 | Makers and capacity | Proposed five tailors x 50 bags/week = 250 bags/week, at an assumed INR 250/bag including material. Confirm named makers, cost inclusions, availability, measured capacity, turnaround and rework terms. | Order acceptance limits based on pilot results and a production queue. | [ ] |
| 4 | Unit economics | Cost labour, lining, hardware, collection, shipping, packaging, payment fees, taxes where applicable, support, rework and margin. | Confirmed making fees, quote rules and delivery charges. Revisit illustrative points economics. | [ ] |
| 5 | Garment preservation | Agree what may be cut, which buttons/embroidery must stay, how unsuitable items are returned, and whether remnants are returned or retained with permission. | Per-garment IDs and receipt photos; a cut/design approval record; labelled storage and packing checks. | [ ] |
| 6 | Business and financial setup | Choose business ownership/structure, settlement bank account, applicable tax/invoice arrangements, business identity and support contact. | Provider onboarding and invoicing details; obtain accounting/legal advice where needed for the chosen setup. | [ ] |
| 7 | Domain and public presence | Select a domain and business email; confirm public brand identity and enquiry channels. | Public mobile-friendly site, HTTPS, domain connection and production configuration. | [ ] |
| 8 | Preorder enquiries | Decide what information is necessary: contact, service location, chosen bag, garment photos, items to preserve and preferred handover. | A real submission endpoint, permanent records, secure uploads, confirmation and notification to the team. | [ ] |
| 9 | Operations dashboard | Nominate who reviews fabric, approves quotes, communicates with customers and updates production. | Restricted admin access, customer/garment/order records, quote approval and status history. | [ ] |
| 10 | Customer access and privacy | Choose secure order access or sign-in; define necessary data, access, retention and deletion arrangements. Keep permission for public stories/photos separate from order processing. | Customer order access, protected storage, access controls, backups and recovery. | [ ] |
| 11 | Live rewards | Later-order use after garment acceptance is confirmed. Confirm values, redemption limits, expiry if any, and treatment of cancellations/refunds. | Account-linked server-side wallet and transaction history; only authorized maker acceptance credits garments; prevent duplicate credits and spending. | [ ] |
| 12 | Payments | Choose a provider, complete its eligibility/KYC/bank checks, and decide deposit versus full payment and payment timing. | Verified live checkout, payment confirmation, receipt, failed/pending payment handling, refunds and reconciliation. | [ ] |
| 13 | Pickup and delivery | Courier handover and Meerut base confirmed. Confirm exact base address/postcode, serviceable customer postcodes, provider, packaging, charges and handling of loss/damage. | Garment collection to Meerut and finished-bag dispatch records, tracking and customer updates. Test both shipping legs. | [ ] |
| 14 | Customer terms and support | Prepare accurate privacy, service, shipping, cancellation, refund, unsuitable-fabric and complaint processes. State preorder timings and how delays are handled. | Published policy/contact pages and customer acknowledgement where appropriate. | [ ] |
| 15 | Pilot validation | Allocate a small first batch, agreed turnaround and a support owner. | Test an entire order, rejected fabric, cancellation, refund, failed payment, points redemption, mobile uploads, access controls and restoration from backup. | [ ] |
| 16 | Public launch | Set capacity, real product photos, final promotional copy, response hours and a modest acquisition plan. | Open enquiries or paid slots only when the corresponding readiness checks pass; monitor conversion, fulfilment and feedback. | [ ] |

## What to arrange next

- Instagram handle and optional WhatsApp business number.
- Confirm the Meerut base address/postcode, courier coverage for the five planned service cities and confirmed tariffs for each shipping leg.
- Confirm the proposed five-maker pool, assumed 50 bags per maker per week and rework arrangements through samples and a small pilot.
- Physical sample budget/date and material/hardware supply; two samples imply INR 500 in maker/material charges only if the assumed rate applies.
- Actual cost inclusions and turnaround for each design; INR 250/bag is a planning input, not a confirmed delivered cost.
- Business contact, business identity and bank details.
- Reward values and limits for the contribution route; later-order redemption timing is already confirmed.
- How an Instagram/WhatsApp enquiry becomes an approved, quoted production order.

Do not set a paid launch date before the maker, sample, costs and handling process are confirmed.

## Budget categories

| Type | Items |
| --- | --- |
| Setup | Sample production, product photography, initial packaging, business setup and the initial application work. |
| Recurring | Domain renewal, hosting, database, file storage, business email, messaging and support tools. |
| Per order | Labour, lining/hardware, pickup, outbound delivery, packaging, transaction fees, applicable taxes, support/rework allowance and reward redemption. |
| Promotion | Campaign production and optional paid advertising. |

Request actual quotations before estimating a complete launch budget or fixed delivery schedule.

## Verified reference points

- A payment provider may require business/customer due diligence, and refund/cancellation terms need to be disclosed. See [Razorpay's terms](https://razorpay.com/terms/) as an example; provider selection and eligibility remain to be decided.
- For an India-first service, consumer-facing information and fulfilment/refund/grievance arrangements should be reviewed against the applicable rules, including the [Consumer Protection (E-Commerce) Rules, 2020](https://consumeraffairs.nic.in/sites/default/files/E%20commerce%20rules_0.pdf). This checklist does not determine which business/tax registrations apply to the eventual entity.
