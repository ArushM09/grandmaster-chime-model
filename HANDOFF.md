# Handoff

Current status:
Major rebuild completed. The app now has a richer layered mechanism model, fixed position math for mechanisms, realtime `useFrame`-driven movement animation, differentiated chiming mode behavior, and per-mechanism educational explanations with official 20-function list framing.

Files changed:
- src/App.jsx
- src/styles.css
- README.md
- HANDOFF.md

What works:
- Dark technical responsive interface with left controls, central 3D viewport, and right explanation panel.
- Orbit rotate/zoom controls.
- Reset view, explode movement, front/calendar side switching, and labels toggle.
- 18 required mechanism groups represented with varied geometry (barrels, gears, balance, gongs, hammers, dial discs, etc.).
- Vector position mutation bug fixed (display position now computed from cloned vectors).
- useFrame-based animation loop (no Date.now render hack).
- Chiming modes visibly alter motion cadence and strike flow animation.
- Per-mechanism beginner and advanced explanations.
- Complication panel aligned to official-style 20-function framing instead of filler list.
- Source notes clearly state educational abstraction and non-CAD accuracy.

What is broken:
- npm registry access is still blocked in this environment:
  - `npm install` fails with `403 Forbidden - GET https://registry.npmjs.org/@react-three%2fdrei`.
- Because dependencies are not installed, runtime validation is blocked:
  - `npm run build` fails with `sh: 1: vite: not found`.
  - `npm run dev` fails with `sh: 1: vite: not found`.

Next exact task:
1) Restore npm registry access (or configure mirror) and run `npm install`.
2) Run `npm run build` and fix any compile errors.
3) Run `npm run dev`, verify app load, controls, mode animations, and no console errors.
4) Perform final visual polish pass from actual running preview.

How to resume:
- From repo root:
  1. `npm install`
  2. `npm run build`
  3. `npm run dev`
- If build/dev errors appear, start in `src/App.jsx` for scene logic and `src/styles.css` for layout polish.
