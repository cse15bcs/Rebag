"""Run the user-installed UI UX Pro Max search tool from the project root."""

import os
from pathlib import Path
import subprocess
import sys


def main():
    codex_home = Path(os.environ.get("CODEX_HOME") or Path.home() / ".codex")
    script = codex_home / "skills" / "ui-ux-pro-max" / "scripts" / "search.py"
    if not script.is_file():
        print(
            f"UI UX Pro Max is missing at {script.parent.parent}. "
            "See docs/ui-ux-pro-max.md for installation.",
            file=sys.stderr,
        )
        return 1

    # Avoid writing bytecode into the shared skill installation.
    return subprocess.call([sys.executable, "-B", str(script), *(sys.argv[1:] or ["--help"])])


if __name__ == "__main__":
    sys.exit(main())
