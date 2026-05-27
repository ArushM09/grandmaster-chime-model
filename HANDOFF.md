# Handoff

Current status:
Milestone 4 is complete. The viewer now supports time side and calendar side switching, exploded layer offsets, key in-scene labels, cutaway clipping, transparent case materials, reset view, and clear selection. The labels are intentionally a curated technical overlay while the inspector list still exposes every named mechanism group.

Files changed:
1. Updated src/App.jsx with side, explode, label, cutaway, and transparent case controls.
2. Updated src/components/GrandmasterViewer.jsx with side flip animation, exploded group offsets, cutaway clipping planes, case transparency handling, and label overlay anchors.
3. Updated src/styles.css with segmented controls, active toggle states, current-view status, and in-scene label styling.
4. Added validation/screenshots/milestone4-controls.png from Playwright validation.

What works:
1. npm run lint passes.
2. npm run build passes.
3. Playwright validates the calendar side, explode, labels, cutaway, and transparent case toggles.
4. Playwright confirms 16 key labels render in label mode.
5. Playwright confirms the WebGL canvas remains nonblank after the controls are enabled.
6. The current view panel reflects side, exploded, label, cutaway, and transparent case state.

What is broken:
1. Blender is still not available through PATH, so the committed GLB remains the temporary Node fallback asset.
2. Chime mode animations, energy particles, timeline, search, advanced/beginner panel toggles, source notes, and final screenshot matrix are still pending.
3. Production build emits a large chunk warning because the 3D stack is bundled into the main app; this is not a build failure.

Next exact task:
Implement the animation system for case flip, balance oscillation, gear rotation, governor spin, hammer strikes, energy particles, grande sonnerie, petite sonnerie, minute repeater, date repeater, alarm time strike, calendar advance, and moon phase motion.

How to resume:
1. git checkout from-zero-full-rebuild
2. npm install
3. npm run generate:fallback-model
4. npm run dev -- --host 127.0.0.1 --port 5173
5. npm run lint
6. npm run build
7. Continue with Milestone 5: animation modes and mechanism motion.
