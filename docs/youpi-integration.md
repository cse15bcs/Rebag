# YouPI-PG payment evaluation in Rebag

## Scope and source reviewed

Reviewed [youpi-pg/YouPI-PG](https://github.com/youpi-pg/YouPI-PG) at commit `405327c27d78ae9d0dccdb1e2d2426cefc359477`, including its README, merchant integration guide, merchant client, payment routes and manual UPI guide.

This is an independently written HTTP adapter and a payment test lab. Upstream source, browser SDKs, bank observers and APKs are not copied into Rebag. The upstream package identifies its licence as `Commercial`, while the referenced root `LICENSE` file was absent at the reviewed commit. Clarify upstream rights before copying or redistributing its implementation.

The upstream README calls the gateway experimental. Its newer lifecycle distinguishes `OBSERVED_SUCCESS` from `RECONCILED`; some older examples still show UPI `SUCCESS`. This integration follows the newer lifecycle and treats COD/counter `SUCCESS` as a review state, not a UPI payment.

## Three distinct modes

| Mode | Where | What is tested | Real transfer? |
| --- | --- | --- | --- |
| Browser simulation | Hosted static prototype | Bag fee, statuses and isolated event history. Clearly labelled browser-only. | No. No gateway/UPI recipient/QR. |
| Local mock, default | `node preview.mjs` | Server-authorized prices, test sessions in SQLite, ownership, idempotency and synthetic signed webhooks. | No. No bank/WhatsApp/Gmail/UPI account. |
| External evaluation | Explicit environment configuration | Server creates a hosted checkout using an independently running YouPI gateway. Its signed webhooks update test records. | Potentially. The external gateway may display a real UPI recipient. Not enabled by default. |

The static Sites host cannot execute this Node/SQLite API. It serves the browser simulation. Do not point a hosted visitor's browser at localhost to reach a gateway or merchant server.

## Run the local test

Requires Node.js with built-in `node:sqlite` and Web Request/Response support (this implementation was tested with Node 26). No npm dependencies are needed.

```powershell
cd D:\work\Rebag_
node preview.mjs
```

Open `http://127.0.0.1:4173/payment-test.html`.

Alternatively, save a design in the storefront, open My makes, and select **Test YouPI checkout**. The lab uses its shape/pattern/strap as inputs and computes a fresh test fee. The design brief, garment acceptance and demo rewards remain unchanged.

1. Select a design and accept the test acknowledgement.
2. Create a checkout. Retry of the same request key returns the existing session.
3. Simulate an observed alert: status is observed, not reconciled.
4. Simulate reconciliation: the gateway-level event is recorded. No real order becomes paid or enters production.
5. Try a new test for review, failed, expired, cancelled and COD outcomes.
6. Reload to recover the session in the same tab/browser. Server test records persist in `.local/payment-tests.sqlite` across restarts; closing the browser tab can remove its session-storage reference, but not the server record.

The owner cookie remains HttpOnly. Restarting the local service requires refreshing the page to obtain a fresh CSRF token. Test controls exist only in mock mode; external mode rejects simulation requests.

## External YouPI setup

First provision and configure your own gateway independently, according to its current documentation and licensing. This task did not deploy the upstream gateway, configure a bank account, connect WhatsApp, install an observer APK, or send real money.

Copy `.env.example` to `.env` and configure values locally. Do not paste secrets into chat or put them in `dist/`.

```text
YOUPI_MODE=external
YOUPI_API_URL=https://your-payment-api.example
YOUPI_CHECKOUT_ORIGIN=https://your-checkout.example
YOUPI_MERCHANT_ID=<your merchant id>
YOUPI_MERCHANT_API_KEY=<your API key>
YOUPI_WEBHOOK_SECRET=<a separate webhook secret>
PUBLIC_STORE_URL=https://your-merchant-test-server.example
```

```powershell
node --env-file=.env preview.mjs
```

The preview binds to loopback and checks its local host names; it is a local developer server, not a production server. To use public webhooks, expose the merchant API through a deliberately configured secure host or development tunnel, preserve its expected local Host header, and set the external return origin correctly. A gateway running on the same machine can post directly to `http://127.0.0.1:4173/api/payments/webhook` without a tunnel.

On YouPI, configure this merchant's webhook endpoint as `/api/payments/webhook` on the reachable merchant server. Allow the exact storefront return origin in the gateway. Configure the merchant API key and webhook secret consistently at both ends.

The adapter uses:

- `POST /api/v1/payments` with `X-Merchant-Id`, server-only `X-Merchant-Key`, and `Idempotency-Key`.
- `orderId`, exact decimal `amount`, `currency: INR`, return URL and non-sensitive reference metadata.
- A returned checkout URL restricted to the configured checkout origin.
- Gateway webhooks with authenticated raw bytes, timestamp, delivery ID, order ID, payment ID, amount, currency and UPI reference.

The adapter does not install the upstream browser script or rely on browser payment callbacks. Closing or returning from a checkout is not payment verification; use Refresh status after an authenticated webhook arrives.

## Important boundaries

- All prices are recalculated from Rebag's supported catalogue in integer paise. Browser totals and discount claims do not set the payment amount.
- Existing rewards are still a separate device-local demonstration. They are explicitly excluded from the payment fee until a server-authorized wallet/quote system is implemented.
- No bank account or scannable UPI code is present in mock/browser modes.
- `bankVerified` and `fulfilmentAllowed` remain false in this lab, including external `RECONCILED` events. A signed gateway message authenticates the sender, not an independent bank settlement.
- An imported statement is still trusted operator input. Official bank review, order/quote approval, fabric approval, reconciliation and production authorization must be implemented before real order fulfilment.
- Failed/expired/cancelled outcomes do not establish that a transfer never occurred. Review bank records before retrying uncertain transfers.
- Idempotency is scoped by the owner and request key. An uncertain gateway creation keeps its reserved order, rather than silently issuing another request.
- Late observation after a terminal attempt enters manual review. Reconciled records cannot be downgraded by delayed failed/cancelled callbacks.
- External evaluation needs a remotely hosted merchant API and a customer account/quote authorization design before use outside a controlled test. The loopback preview and browser demo are not a public checkout service.

## Verification

```powershell
node --test payments.test.mjs rewards.test.mjs
```

Payment tests cover server pricing, ownership, idempotency, CSRF, external API headers and URLs, invalid/mismatched/tampered webhooks, signed timestamps, delivery deduplication, retry windows, late events, COD and persistence across restart. External HTTP integration is checked against an in-process contract fixture; it does not claim a live upstream deployment or a bank transaction was tested.

## Files

- `dist/payment-test.html`, `payment-test.js`, `payment-test.css`: test UI.
- `dist/payment-entry.js`: optional link from saved designs.
- `dist/payment-core.mjs`: shared fee and lifecycle logic.
- `server/payments.mjs`: persistent local test API and event handling.
- `server/youpi.mjs`: upstream HTTP adapter and signature verification.
- `.env.example`: optional external configuration; `.env` and `.local/` are ignored.
- `payments.test.mjs`: payment contract and security regression tests.
