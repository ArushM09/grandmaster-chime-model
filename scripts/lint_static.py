from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
required = [
    ROOT / "src" / "App.jsx",
    ROOT / "src" / "main.jsx",
    ROOT / "src" / "styles.css",
    ROOT / "src" / "generatedModel.js",
]

missing = [path for path in required if not path.exists()]
if missing:
    for path in missing:
        print(f"missing required file: {path.relative_to(ROOT)}")
    sys.exit(1)

app = (ROOT / "src" / "App.jsx").read_text(encoding="utf-8")
checks = {
    "disclaimer": "educational abstraction" in app,
    "r3f canvas": "<Canvas" in app,
    "orbit controls": "OrbitControls" in app,
    "energy flow": "EnergyFlow" in app,
    "calendar side": "CalendarDial" in app,
}

failed = [name for name, ok in checks.items() if not ok]
if failed:
    for name in failed:
        print(f"lint check failed: {name}")
    sys.exit(1)

print("static lint checks passed")
