# Taste Skill

[Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) is installed as the Codex skill `design-taste-frontend`, version 2.5.1. It includes design guidance, reference assets, copy checks, screenshots and browser audits.

The installation lives at `~/.codex/skills/design-taste-frontend` (or `$CODEX_HOME/skills/design-taste-frontend` when configured). It is a user-level skill, available to Codex across projects on this machine, rather than a Rebag runtime dependency. It will be available on your next turn; if it is not listed then, start a new Codex session.

To invoke it, ask: “Use $design-taste-frontend to review Rebag and propose improvements while preserving its current design and functionality.” Installation alone does not redesign Rebag or enable a plugin's automatic hooks. Use the `gate` tool explicitly when following the skill's build workflow.

## Prerequisites and commands

The tools require Node 22+ and Chrome, Chromium or Edge. This machine has Node 24.19.0 and Chrome at `/run/current-system/sw/bin/google-chrome`. ffmpeg is optional for image conversion and is not installed here.

Run tools from the Rebag project root through this wrapper:

```sh
npm run taste -- --help
npm run taste -- start types --page product
```

The wrapper finds the installed skill and supplies `CHROME_PATH` from your executable search path, including NixOS's Chrome location. An explicitly set `CHROME_PATH` takes precedence. It forwards arguments to the upstream scripts without modifying them. No npm dependency installation is needed for this command.

For example, capture the storefront with the skill's own local HTTP server:

```sh
npm run taste -- shoot --url public/index.html --root public --w 1440 --out .local/taste-check/desktop.png --no-tiles
```

Screenshots here go into the already ignored `.local/` directory. A running framework server URL can be used instead of an HTML file when checking server-dependent features. The static screenshot command does not validate authentication, database storage or payment workflows.

Other tools include `consistency`, `copy-lint`, `perf`, `gate`, `photos`, `icons`, `effects`, `moments`, `layout-deal` and `layout-check`. Follow the installed `SKILL.md` and its references for their arguments. `start deal` and `gate --start` create build state in `.taste-skill/`; run those when beginning an intentional design task. Browser tools need permission to launch Chrome and bind a local HTTP port when running in a restricted environment.

Rebag's selected Orbit Studio design and application requirements remain the context for future work. The Awesome DESIGN.md collection remains an optional reference; installation does not adopt another brand's guide.

## Setup verification

Checked on 2026-11-12: all ten upstream command scripts passed Node syntax checks, the palette and typography libraries parsed successfully, and the typography listing command ran. The wrapper's unknown-tool and missing-installation errors were checked. The screenshot tool rendered a local test page in headless Chrome at 390×844 and exited successfully without warnings; its output is in `.local/taste-skill-smoke/mobile.png`. This verifies the installation and browser connection, rather than auditing Rebag's storefront against the skill's design rules.

## Reinstall on another machine

With Codex's bundled skill-installer available:

```sh
python3 ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py --repo Leonxlnx/taste-skill --path skills/taste-skill --name design-taste-frontend
```

The installer downloads the skill and its assets and refuses to overwrite an existing installation. Inspect an existing skill before replacing it when updating. The upstream repository documents other installation options.
