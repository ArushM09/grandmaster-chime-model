from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
app = (ROOT / "src" / "App.jsx").read_text(encoding="utf-8")
css = (ROOT / "src" / "styles.css").read_text(encoding="utf-8")

signals = {
    "canvas scene": "<Canvas" in app and "WatchModel" in app,
    "front dial": "function TimeDial" in app,
    "calendar dial": "function CalendarDial" in app,
    "gongs and hammers": "function Gongs" in app and "function Hammers" in app,
    "energy path": "flowPath" in app and "EnergyParticle" in app,
    "labels": "part-label" in css and "labelPriority" in app,
    "responsive layout": "@media(max-width:820px)" in css,
}

failed = [name for name, ok in signals.items() if not ok]
if failed:
    for name in failed:
        print(f"visual signal missing: {name}")
    sys.exit(1)

print("visual source check passed; browser screenshot inspection still required")
