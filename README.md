# Grandmaster Chime 3D Educational Model

A from-scratch React + Vite + Three.js educational model inspired by the architecture of the Patek Philippe Grandmaster Chime (Ref. 6300GR).

> This is **not** an exact CAD replica. All geometry is original and simplified for education.

## Technical stack
- React
- Vite
- Three.js
- @react-three/fiber
- @react-three/drei

## Educational scope
The model demonstrates a mechanically plausible abstraction of:
- Reversible double-sided case concept
- Time side vs calendar side architecture
- Four-barrel energy concept
- Going train, strike train, governor, hammers, and gongs
- Perpetual calendar works and moon phase
- Second time zone and alarm works
- Movement and strikework reserve indications
- Strikework isolator concept

## Included public facts
- 20 complications
- Five acoustic functions: grande sonnerie, petite sonnerie, minute repeater, alarm with time strike, date repeater
- Caliber GS AL 36-750 QIS FUS IRM
- 1366 parts, 108 jewels
- Movement diameter 37 mm, thickness 10.7 mm
- 25,200 semi-oscillations/hour

## Features
- Dark technical UI with responsive layout
- Interactive 3D watch model
- Orbit rotate/zoom controls
- Reset view
- Exploded movement view by layer separation
- Front/calendar side switching
- Toggleable labels
- Clickable mechanism groups with per-mechanism beginner/advanced explanations
- Differentiated chiming modes with realtime animation
- Animated strike energy path
- Source notes/disclaimer panel

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```
