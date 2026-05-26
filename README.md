# Grandmaster Chime 3D Educational Model

This is a from scratch interactive educational web model inspired by the Patek Philippe Grandmaster Chime.

It is not an exact CAD replica. The geometry is original and simplified so the model can explain the main mechanism groups without copying Patek Philippe images, diagrams, photos, or proprietary layouts.

## Stack

1. React
2. Vite
3. Three.js
4. @react-three/fiber
5. @react-three/drei

## What it does

1. Shows a central interactive 3D watch model
2. Supports orbit rotate and zoom controls
3. Flips between the time side and calendar side
4. Explodes the movement into readable layers
5. Adds clickable mechanism labels
6. Explains each mechanism in beginner and advanced modes
7. Simulates grande sonnerie, petite sonnerie, minute repeater, date repeater, alarm time strike, and calendar advance
8. Shows animated energy flow from sonnerie barrels to strike train, governor, hammers, and gongs
9. Lists 20 public complication groups
10. Includes public specification notes and an abstraction disclaimer

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Validation status

Validated locally on May 26, 2026.

1. `npm install` completed
2. `npm run build` completed successfully
3. `npm run dev -- --host 127.0.0.1` started successfully
4. HTTP check against the Vite server returned 200 OK

The production build is large because Three.js and React Three Fiber add a large client bundle. The build still succeeds.
