# Grandmaster Chime Full Rebuild

This branch starts from zero.

The goal is a full interactive educational 3D model of the Patek Philippe Grandmaster Chime using original geometry and public information only.

This is not an exact CAD replica. Exact movement CAD, hidden lever geometry, bridge geometry, and manufacturing drawings are not public.

## Target

Build a museum style browser experience with generated 3D assets, a serious React and Three.js viewer, explanatory panels, clickable mechanism groups, and animated complication flows.

## Intended stack

1. Codex CLI
2. React
3. Vite
4. Three.js
5. React Three Fiber
6. Drei
7. Blender Python generated GLB assets
8. Playwright screenshots for visual checks

## First local commands

```bash
git checkout from-zero-full-rebuild
npm create vite@latest . -- --template react
npm install three @react-three/fiber @react-three/drei
npm install -D playwright
```

If the Vite command refuses to run because files already exist, create the app in a temp folder and move the generated files into this branch.

## Core rule

Do not copy Patek Philippe images, diagrams, photos, or proprietary layouts.

Use public facts and original geometry only.
