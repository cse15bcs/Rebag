# Design reference → blueprint → approval

## Customer flow

1. Choose own fabric or a Rebag-made bag with clothing contributions.
2. Start from a supported shape or add a design reference photo and describe the details to borrow.
3. Set requested width, height, depth, handle drop, pocket, layout, handles, initials and preservation notes.
4. Review the schematic front/side blueprint and the structured specification. The reference is displayed separately; it is not automatically traced or reconstructed by AI.
5. Explicitly approve the displayed design intent and send it to the site. Selected reference/fabric photos are uploaded privately at this point.
6. Receive a server-issued reference and version, marked **customer approved — maker review pending**.
7. Open **My approved designs** to retrieve the recorded versions, blueprint, structured record and readable brief across signed-in sessions.

The generated drawing is schematic and not to scale. It records requested measurements; it is not a sewing pattern. Changes after approval invalidate the current form's approval. A new approval gets a new version, preserving the previous recorded specification. A retry of the same request returns its original receipt rather than creating a duplicate.

## Scope of approval

Approval concerns shape, requested dimensions, layout and personal details. It does not agree the final quote, guarantee fabric suitability, authorize cutting treasured fabric, make a payment or reserve production. These decisions remain separate maker/customer agreements.

The stored record includes the normalized specification, stable account owner, display name at approval, server timestamp, exact approval text and text version, content fingerprints, optional private photos and an immutable version reference. It is a design record, not a claim of a certified digital signature.

Local draft saving and the demo rewards/checkout remain separate from the server approval log. No real production order is automatically marked paid or started. Instagram stays unavailable until the founder configures a real profile.

## Storage and access

- `.openai/hosting.json` retains the existing Site ID and declares D1 `DB` and R2 `BUCKET`.
- The website has migrated from static hosting to the supplied Vinext Worker starter. Authored assets live in `public/`; `dist/` is generated.
- Sites owns hosted sign-in. APIs require the trusted signed-in identity and enforce record ownership on every record/image read.
- Same-origin form submission and explicit current consent are required. File types/signatures and upload sizes are validated server-side.
- Reference/fabric images are JPG, PNG or WebP, at most 5 MB each, stored using server-controlled private object keys.
- Database failure does not issue a receipt; newly stored objects are cleaned up where possible. An interrupted request can be retried with the same key.
- The history surface lists the signed-in customer's most recent 50 approvals. It is not an unrestricted staff dashboard. A future public service will need a separately authorized maker inbox and retention/deletion processes.

## Local setup

Use the Sites installer and build helpers. After a build generates `dist/server/wrangler.json`, apply each pending local migration once, in order:

```powershell
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_stiff_purifiers.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_shallow_surge.sql
npm.cmd run dev -- --port 5173 --hostname 127.0.0.1
```

Local and hosted databases are separate. The Sites publication process applies pending hosted migrations. Applied SQL/journal entries are not rewritten.

The original `node preview.mjs` remains a loopback-only payment integration lab. It serves `public/` and its Node payment test API, but does not implement the hosted D1/R2 approval API. Use the full-stack preview for real local approval-flow testing.

## Verification

Automated approval tests exercise actual generated SQL through SQLite, including ownership isolation, cross-origin rejection, photo validation, content hashes, duplicate retries, version history and storage-failure cleanup. Existing reward/payment tests are retained.

Before production use with customers, confirm maker review procedures, material/sample specifications, business contact details, customer-facing terms and a retention/deletion policy. No automatic photo-to-pattern inference or maker notification service is configured.
