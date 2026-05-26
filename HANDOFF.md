# Handoff

Current status:
The app has been further polished for readability and educational clarity, with improved default camera framing, denser and better-spaced labels, stronger technical lighting, and mode-specific status styling so each chime mode reads as distinct even before animation cues.

Files changed:
1. src/App.jsx
2. src/styles.css
3. HANDOFF.md

What works:
1. Existing interactive model structure remains intact (flip, explode, labels, mode selection, explanations).
2. Camera starts at a wider, more technical inspection angle for better layer readability.
3. Lighting now uses mixed ambient/hemisphere/directional/spot setup for better depth contrast.
4. Label anchor positions now scale by mechanism layer to reduce overlap.
5. Viewer status pills now include active mechanism path hints and mode-dependent visual color treatments.
6. Info panel now shows explicit energy route text for the current mode.
7. Responsive layout behavior is preserved and tuned with updated styles.

What is broken:
1. Local dependency install is currently blocked by registry policy (`npm install` returns 403 for `@react-three/drei`).
2. Because dependencies could not be installed, `npm run build` fails in this environment (`vite: not found`).
3. `npm run dev` visual validation could not be executed due to missing dependencies.

Next exact task:
Resolve package registry access for `@react-three/drei`, run full validation (`npm install`, `npm run build`, `npm run dev`), then visually tune mechanism animations and calendar-side detail with live browser feedback.

How to resume:
1. Ensure npm registry access allows installing `@react-three/drei`.
2. Run `npm install`.
3. Run `npm run build`.
4. Run `npm run dev` and open the app.
5. Continue with visual/animation polishing in `src/App.jsx` and `src/styles.css`.
