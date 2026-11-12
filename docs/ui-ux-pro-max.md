# UI UX Pro Max

[nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) is installed as the Codex skill `ui-ux-pro-max`. It provides local searches for interface styles, palettes, typography, accessibility, interaction patterns and framework guidance, plus a design-system recommendation generator.

The user-level installation is at `~/.codex/skills/ui-ux-pro-max` (or `$CODEX_HOME/skills/ui-ux-pro-max` when configured), alongside Taste Skill. It will be available on your next turn; start a new Codex session if it is not listed then. Invoke it with a request such as: “Use $ui-ux-pro-max to review Rebag's keyboard navigation while preserving the selected design.”

Python 3 is required. This machine has Python 3.13.15. The search scripts use only Python's standard library and bundled data, so no pip packages, API keys or browser are required for searches. This setup installs the skill directly; the separate `uipro` CLI is not installed.

## Run from Rebag

The project command resolves the user-level skill and forwards arguments to its search tool:

```sh
npm run uiux -- --help
npm run uiux -- "keyboard focus modal" --domain ux
npm run uiux -- "server client components" --stack nextjs
```

The wrapper uses `python3`, honours `CODEX_HOME`, and leaves the upstream scripts unchanged. It disables bytecode writes to the shared installation. For direct use outside Rebag:

```sh
python3 -B "${CODEX_HOME:-$HOME/.codex}/skills/ui-ux-pro-max/scripts/search.py" "keyboard focus modal" --domain ux
```

To explore a design-system recommendation without saving or applying it:

```sh
npm run uiux -- "sustainable fashion ecommerce" --design-system -p "Rebag exploration"
```

Use a separate `--stack` query for framework guidance; the generator ignores that flag. Rebag contains Next.js/React code and an authored HTML storefront in `public/`, so choose implementation guidance for the files being changed. Search results are recommendations; check their relevance before using them.

Rebag's selected Orbit Studio design remains in place. Taste Skill supplies a design/build workflow and browser checks; UI UX Pro Max supplies searchable guidance; Awesome DESIGN.md remains a reference collection. State which skill should lead a future design task and preserve the existing project requirements.

For an intentional future design task, `--persist --output-dir <project-root>` saves a recommendation under `design-system/<project-slug>/MASTER.md`. Review the recommendation before persisting it. Existing files are preserved by default; read them before considering an explicitly authorized overwrite with `--force`.

## Installation details

Installed on 2026-11-12 from `.claude/skills/ui-ux-pro-max` in the upstream repository. Its example search commands were adapted from the Claude plugin path to `${CODEX_HOME:-$HOME/.codex}/skills/ui-ux-pro-max/scripts/search.py`; the search engine, datasets and references are unchanged.

Verification passed: the upstream data validator checked 12 domains, 22 stacks and the reasoning dataset; all installed Python scripts passed syntax checks; UX and Next.js searches returned matching records; and the design-system generator returned structured JSON without persisting a new design. The project wrapper's argument forwarding and missing-installation error were also checked. Rebag's storefront was not audited or redesigned during setup.

To install on another machine with Codex's bundled installer:

```sh
python3 ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py --repo nextlevelbuilder/ui-ux-pro-max-skill --path .claude/skills/ui-ux-pro-max --name ui-ux-pro-max
```

The installer refuses to overwrite an existing installation. This command downloads the upstream Claude-oriented `SKILL.md`; adapt its example search paths to the actual Codex skill directory as described above. The project wrapper already resolves the correct location. See the upstream repository for CLI-based installation alternatives.
