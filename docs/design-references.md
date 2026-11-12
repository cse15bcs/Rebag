# Design references

[VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) is available at `.local/awesome-design-md/`. It contains Markdown analyses of brand design systems, including colours, typography, components and layout guidance. It requires no package installation, server or API key.

The collection is a reference only. Rebag's selected design remains Orbit Studio (Design 04), Indigo Copper / Metallic Copper, as described in [design versions](design-versions.md). No upstream guide has been copied into a root `DESIGN.md` or applied to the storefront.

## Browse and use

Open `.local/awesome-design-md/README.md` for the catalogue. Each guide lives at:

```text
.local/awesome-design-md/design-md/<brand>/DESIGN.md
```

For example, Apple uses `apple`, Shopify uses `shopify`, and Linear uses `linear.app`. Each brand's `README.md` links to hosted previews and download options on getdesign.md. The checked-out version contains no HTML previews.

List all available guides from the Rebag project root:

```sh
rg --files --hidden .local/awesome-design-md/design-md -g DESIGN.md
```

Ask a coding agent to read a specific guide when exploring a future design. For example:

> Read `.local/awesome-design-md/design-md/apple/DESIGN.md` and propose a Rebag layout inspired by its spacing and typography. Preserve Rebag's selected palette and existing functionality. Show the proposal before changing the storefront.

Choose a guide explicitly before adopting it as a project-wide `DESIGN.md`. Brand fonts and imagery mentioned in a guide are not installed by this collection.

## Local checkout

Setup was checked on 2026-11-12 at upstream commit `fcc7028`, with 84 nonempty `DESIGN.md` files. The checkout retains the upstream MIT license in `.local/awesome-design-md/LICENSE`; include that notice when redistributing substantial portions of the guides.

The existing `/.local/` ignore rule keeps the collection outside Rebag's tracked source. To recreate it in a fresh checkout, run:

```sh
git clone --depth 1 https://github.com/VoltAgent/awesome-design-md.git .local/awesome-design-md
```

To update the local collection:

```sh
git -C .local/awesome-design-md pull --ff-only
```

To inspect its version and any local changes:

```sh
git -C .local/awesome-design-md log -1 --oneline
git -C .local/awesome-design-md status --short
```
