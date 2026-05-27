# Full rebuild plan

## Milestone 1

Audit this clean branch and create the initial React and Vite app.

Expected files:
1. package.json
2. index.html
3. src/main.jsx
4. src/App.jsx
5. src/styles.css
6. vite.config.js

Validation:
1. npm install
2. npm run build

## Milestone 2

Add Blender asset generation.

Expected files:
1. scripts/blender/generate_grandmaster_chime.py
2. public/models/grandmaster_chime.glb
3. public/models/grandmaster_chime_manifest.json

The script should create original geometry for the case, dials, mainplate, bridges, barrels, gears, balance, governor, hammers, gongs, calendar works, moon phase, alarm works, levers, jewels, screws, and labels.

## Milestone 3

Load the GLB in the React viewer.

Required viewer features:
1. Loading state.
2. Error state.
3. Orbit controls.
4. Named mesh selection.
5. Highlight selected mechanism.
6. Side switching.
7. Explode layers.

## Milestone 4

Build the educational interface.

Required panels:
1. Selected mechanism.
2. Beginner explanation.
3. Advanced explanation.
4. Complication list.
5. Source notes.
6. Animation timeline.

## Milestone 5

Add animation modes.

Required modes:
1. Grande sonnerie.
2. Petite sonnerie.
3. Minute repeater.
4. Date repeater.
5. Alarm time strike.
6. Calendar advance.
7. Case flip.

## Milestone 6

Add Playwright visual validation.

Expected files:
1. scripts/visual_check.js
2. validation/screenshots

Required checks:
1. Desktop screenshot.
2. Narrow screen screenshot.
3. Front side screenshot.
4. Calendar side screenshot.
5. Exploded view screenshot.
6. Chime mode screenshot.

## Milestone 7

Polish and final handoff.

Required final checks:
1. npm run build.
2. npm run dev.
3. Screenshot inspection.
4. README update.
5. HANDOFF.md update.
6. Final commit.
