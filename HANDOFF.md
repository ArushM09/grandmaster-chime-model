# Handoff

Current status:
Milestone 5 is complete. The viewer now has a mode and phase animation system with active group highlighting, energy particles, balance oscillation, gear rotation, governor spin, hammer strike pulses, moon phase motion, calendar advance motion, and a case flip mode. Grande sonnerie, petite sonnerie, minute repeater, date repeater, alarm time strike, calendar advance, and case flip are selectable from the UI and drive the timeline panel.

Files changed:
1. Added src/data/animationModes.js with mode durations, phases, active groups, and energy paths.
2. Updated src/components/GrandmasterViewer.jsx with animation runtime, animated mechanism collection, active highlighting, energy particles, case flip, balance/gears/governor/hammers/calendar/moon motion.
3. Updated src/App.jsx with animation mode controls and a live timeline panel.
4. Updated src/styles.css with animation mode buttons and timeline styling.
5. Updated eslint.config.js to allow intentional React Three Fiber per-frame object mutation.
6. Added validation/screenshots/milestone5-chime-mode.png from Playwright validation.

What works:
1. npm run lint passes.
2. npm run build passes.
3. Playwright validates each required mode reaches its expected first phase.
4. Playwright validates Grande sonnerie transitions from hour strike flow to quarter strike flow.
5. Playwright validates minute repeater, date repeater, and alarm modes highlight their counting/release phases before strike flow.
6. Playwright confirms the WebGL canvas remains nonblank during active chime animation.
7. The milestone screenshot shows Grande sonnerie energy particles in the viewer.

What is broken:
1. Blender is still not available through PATH, so the committed GLB remains the temporary Node fallback asset.
2. Search/filter, beginner/advanced content toggle, richer source notes, final screenshot matrix, and final README polish are still pending.
3. Production build emits a large chunk warning because the 3D stack is bundled into the main app; this is not a build failure.

Next exact task:
Complete the educational interface: beginner and advanced explanation panels, complication search/filter, source notes, non-CAD disclaimer, and improved selected-mechanism detail content.

How to resume:
1. git checkout from-zero-full-rebuild
2. npm install
3. npm run generate:fallback-model
4. npm run dev -- --host 127.0.0.1 --port 5173
5. npm run lint
6. npm run build
7. Continue with Milestone 6: educational panels, complication search, source notes, and beginner/advanced content.
