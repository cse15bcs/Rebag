import { accessSync, constants, existsSync } from "node:fs";
import { homedir } from "node:os";
import { delimiter, join } from "node:path";
import { spawnSync } from "node:child_process";

const tools = {
  start: "scripts/start.mjs",
  consistency: "scripts/consistency.mjs",
  "copy-lint": "scripts/copy-lint.mjs",
  shoot: "scripts/shoot.mjs",
  perf: "scripts/perf.mjs",
  gate: "scripts/gate.mjs",
  photos: "scripts/photos.mjs",
  icons: "scripts/icons.mjs",
  effects: "scripts/effects.mjs",
  moments: "scripts/moments.mjs",
  "layout-deal": "assets/layout/deal.mjs",
  "layout-check": "assets/layout/check.mjs",
};

const [tool, ...args] = process.argv.slice(2);
if (!tool || tool === "--help" || tool === "-h") {
  console.log(`Usage: npm run taste -- <tool> [arguments]\nTools: ${Object.keys(tools).join(", ")}\nExample: npm run taste -- start types --page product`);
  process.exit(0);
}
if (!Object.hasOwn(tools, tool)) {
  console.error(`Unknown Taste Skill tool: ${tool}. Run npm run taste -- --help.`);
  process.exit(1);
}

const skillHome = join(process.env.CODEX_HOME || join(homedir(), ".codex"), "skills", "design-taste-frontend");
const script = join(skillHome, tools[tool]);
if (!existsSync(script)) {
  console.error(`Taste Skill is missing at ${skillHome}. See docs/taste-skill.md for installation.`);
  process.exit(1);
}

const env = { ...process.env };
if (!env.CHROME_PATH) {
  const names = ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "microsoft-edge"];
  const candidates = (env.PATH || "").split(delimiter).filter(Boolean)
    .flatMap((directory) => names.map((name) => join(directory, name)));
  const chrome = candidates.find((candidate) => {
    try { accessSync(candidate, constants.X_OK); return true; } catch { return false; }
  });
  if (chrome) env.CHROME_PATH = chrome;
}

const result = spawnSync(process.execPath, [script, ...args], { env, stdio: "inherit" });
if (result.error) console.error(`Taste Skill could not start: ${result.error.message}`);
process.exit(result.status ?? 1);
