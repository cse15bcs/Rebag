# Local UPI Gateway sandbox

Installed [mynkdev-21/upi-gateway](https://github.com/mynkdev-21/upi-gateway) at commit `f95bbbc841bc444ca9f508116aa21aadcc281f7c`. The upstream MIT licence remains with the downloaded source. This is a separate local evaluation of that gateway, alongside Rebag's earlier YouPI lab; it does not replace the hosted storefront's checkout.

## Open and test

Gateway login: <http://127.0.0.1:8085/login>.

Local merchant and administrator logins are in [the ignored local access file](../.local/upi-runtime/local-access.txt). Use the merchant account to view Sandbox orders and settings. No real UPI account or bank credentials are configured.

From the Rebag project root:

```powershell
node scripts/upi-gateway-local.mjs start
node scripts/upi-gateway-local.mjs create-test
```

The second command creates a new **Sandbox** payment for a sample amount of ₹399 and prints its checkout URL. Open it and choose **Simulate success**, **Simulate failure**, **Keep pending**, **Simulate expiry**, **Simulate timeout** or **Invalid reference**. Each outcome needs a new test order. Invalid reference is rejected; it does not mark the order paid. Timeout remains pending. A successful sandbox order is labelled `test: true` and `verified_by: sandbox`.

To choose another simulated amount:

```powershell
node scripts/upi-gateway-local.mjs create-test 1.00
```

To review results after merchant login, open <http://127.0.0.1:8085/orders?environment=sandbox>. The gateway stores orders in the local MariaDB database and retains them across restarts. This does not place a Rebag order, spend reward points or authorize making a bag.

```powershell
node scripts/upi-gateway-local.mjs status
node scripts/upi-gateway-local.mjs stop
```

The runner starts hidden background processes for the database, PHP web server, queue worker and scheduler. It binds the web server and database to `127.0.0.1` on ports `8085` and `3307`. Stopping verifies the recorded process identities, stops their process trees and asks MariaDB to shut down cleanly. It retains the installation and database files. No Windows service or automatic startup entry is installed.

## Installation details

Everything downloaded or generated is under the ignored `.local/` directory:

- `upi-gateway/`: original upstream source, bundled Composer dependencies and compiled frontend assets.
- `tools/php/`: portable PHP 8.5.12, with the required extensions enabled.
- `tools/mariadb/mariadb-11.8.9-winx64/`: portable MariaDB 11.8.9.
- `upi-runtime/`: database, process records, logs, local passwords and sandbox API credentials.

A small local view adjustment adds the existing Tailwind `break-all` class to Sandbox order references so long IDs fit narrow screens. No payment or security logic was changed.

Both runtime archives were checked against SHA-256 checksums published by their official download hosts before extraction. PHP is not added to the machine-wide PATH.

The web installer requires exact Unix `0600` file modes, which Windows PHP does not represent. Local installation instead used the gateway's `InstallationManager` and Laravel migration commands to configure the database, generate the application key, create the administrator and lock installation. A separate merchant and sandbox credentials were then provisioned. Upstream application source was not patched to disable those permission checks. Windows ACLs restrict the local credential directory and gateway environment file to the current Windows user and SYSTEM.

The local setup uses an application-specific database user, encrypted sessions, closed public registration and no configured payment-provider accounts. It uses the repository's actual Sandbox API and hosted Sandbox checkout, rather than a substitute simulator. Live credentials are not generated for the test merchant. Sandbox API credentials are read by the command-line runner from an ignored private file; they are never embedded in Rebag browser assets.

The local PHP bootstrap scripts in `upi-runtime/` are installation records, not scripts to rerun on an existing installation. `start` uses the installed runtime; a fresh checkout or another computer needs a separate installation.

## Verification

With the local service running:

```powershell
node scripts/check-upi-gateway.mjs
```

This creates real gateway Sandbox records and checks all six outcomes, authenticated status retrieval, duplicate client references, completed-simulation replay rejection, missing/incorrect API credentials, frontend assets, and protection of environment/vendor/log paths. It does not test bank settlement, provider credentials or delivery to an external merchant webhook. The gateway's queue worker and scheduler are running, but no external webhook URL is configured.

For public hosting, this Laravel application needs a PHP/MySQL host and production setup as described in the [upstream installation guide](https://github.com/mynkdev-21/upi-gateway/blob/main/docs/INSTALLATION.md). The existing Rebag Sites publication does not execute this local PHP service. Rebag checkout integration with this gateway's API/signature format requires a separate server adapter; the old YouPI adapter uses a different protocol.
