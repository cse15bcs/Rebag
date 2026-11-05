# Rebag
same soul. new silhouette

## Full-stack design studio

The authored storefront is now in `public/`. `dist/` is generated deployment output; do not edit it.

Run `npm run dev` (PowerShell: `npm.cmd run dev`) and open the printed local URL. The portable Sites starter supports local test sign-in through `/signin-with-chatgpt?return_to=/index.html`. Hosted authentication remains owned by Sites.

Design approvals use D1 (`DB`) and private reference/fabric images use R2 (`BUCKET`). See [the design approval workflow](docs/design-approval-workflow.md) for setup, local migrations, approval scope and verification.

Run `npm test` (PowerShell: `npm.cmd test`) for blueprint, approval, rewards and payment tests. Build and publish through the Sites workflow.

Run the prototype with `node preview.mjs` and open `http://127.0.0.1:4173`.

The optional [YouPI payment test lab](docs/youpi-integration.md) is available at
`http://127.0.0.1:4173/payment-test.html`. It uses synthetic payments by default.
The hosted static prototype provides a browser-only simulation; it does not run
the local Node/SQLite merchant API.
