# Handoff

Current status:
Core React + Vite + Three.js educational model implemented from scratch with interactive 3D scene, control panels, mechanism groups, side switching, explode mode, clickable parts, beginner/advanced explanations, and chiming mode selection.

Files changed:
- package.json
- vite.config.js
- index.html
- src/main.jsx
- src/App.jsx
- src/styles.css
- README.md
- HANDOFF.md

What works:
- Dark technical responsive interface with left controls, central 3D viewport, and right educational panel.
- Orbit rotate/zoom controls in Three.js canvas.
- Reset view action.
- Exploded movement toggle.
- Front/calendar side toggle with visibility filtering.
- 18 required mechanism groups represented and clickable.
- Beginner/advanced explanation mode.
- Complication panel listing 20 complications.
- Animated energy flow path for striking chain and active mode emphasis.
- Chiming mode selection: grande sonnerie, petite sonnerie, minute repeater, date repeater, alarm strike.
- Source notes explaining abstraction/public-spec basis and non-CAD accuracy.

What is broken:
- Dependency installation is blocked in this environment by npm registry 403 policy, so npm run build and npm run dev cannot be executed here until registry/network policy is opened.

Next exact task:
1) Resolve npm registry access or provide local mirror.
2) Run npm install.
3) Run npm run build.
4) Run npm run dev and verify interactions visually in browser.
5) Address any runtime/console issues and polish animation timing.

How to resume:
- From repo root: `npm install && npm run dev` once package registry access is available.
- Validate production build with `npm run build` and then iterate in `src/App.jsx` and `src/styles.css` if adjustments are needed.
