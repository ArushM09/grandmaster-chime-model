# Grandmaster Chime Educational 3D Model

This branch is a from-zero rebuild of an interactive educational model inspired by the Patek Philippe Grandmaster Chime 6300GR.

It is not exact CAD. It does not copy Patek Philippe images, diagrams, photos, CAD, or proprietary layouts. The model uses public specification anchors and original generated geometry for a mechanically plausible museum style teaching experience.

## What Is Built

1. React, Vite, Three.js, React Three Fiber, and Drei viewer.
2. Blender Python asset generator at `scripts/blender/generate_grandmaster_chime.py`.
3. Temporary Node fallback GLB generator at `scripts/create_fallback_model.js`.
4. GLB asset and manifest under `public/models`.
5. Named mechanism groups for case, dials, crystals, controls, mainplate, bridges, jewels, screws, barrels, gear trains, balance, strike train, governor, gongs, hammers, racks, alarm path, calendar works, moon phase, isolators, and differential.
6. Orbit controls, reset view, side switching, exploded view, labels, cutaway mode, transparent case mode, selection, hover, and highlighting.
7. Animation modes for case flip, grande sonnerie, petite sonnerie, minute repeater, date repeater, alarm time strike, and calendar advance.
8. Beginner and advanced explanations, mechanism search, acoustic function notes, source notes, and non-CAD disclaimer.
9. Playwright screenshot validation with canvas pixel checks.

## Commands

```bash
npm install
npm run generate:fallback-model
npm run lint
npm run build
npm run visual:check
npm run dev -- --host 127.0.0.1 --port 5173
```

Open the local app at:

```text
http://127.0.0.1:5173/
```

## Blender Asset Generation

If Blender is installed and available on `PATH`, run:

```bash
npm run generate:blender-model
```

On this machine Blender was not available, so the committed `public/models/grandmaster_chime.glb` is the temporary Node-generated fallback. The full Blender script is present and ready to run on a Blender-equipped machine.

## Visual Validation

Run:

```bash
npm run visual:check
```

The script captures:

1. `validation/screenshots/desktop.png`
2. `validation/screenshots/narrow.png`
3. `validation/screenshots/front-side.png`
4. `validation/screenshots/calendar-side.png`
5. `validation/screenshots/exploded-view.png`
6. `validation/screenshots/chime-mode.png`

It also checks that each scenario renders a nonblank WebGL canvas and fails on browser console or page errors.

## Public Spec Anchors

The app uses the project-provided public facts: 20 complications, five acoustic functions, reversible double sided case, caliber GS AL 36 750 QIS FUS IRM, 1366 parts, 108 jewels, 37 mm movement diameter, 10.7 mm movement thickness, 25,200 semi-oscillations per hour equal to 3.5 Hz, 47.7 mm case diameter, 16.07 mm case thickness, humidity and dust protection only, and three classic gongs.

