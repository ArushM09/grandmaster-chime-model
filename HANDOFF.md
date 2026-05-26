# Handoff

Current status:
The project has been upgraded from the first scaffold into a larger interactive React, Vite, and Three.js model. The app now has richer original geometry, frame based motion, a stronger dark interface, side switching, layer explosion, labels, beginner and advanced explanations, public spec notes, and simulated chime modes.

Files changed:
1. src/App.jsx
2. src/styles.css
3. vite.config.js
4. README.md
5. HANDOFF.md

What works:
1. Central 3D model with orbit rotate and zoom
2. Time side and calendar side switching
3. Layer explosion slider
4. Clickable mechanism labels
5. Beginner and advanced explanation modes
6. Grande sonnerie, petite sonnerie, minute repeater, date repeater, alarm strike, and calendar advance modes
7. Gear, balance, governor, hammer, calendar, and energy path motion
8. Optional browser tone playback after user interaction
9. Richer geometry for barrels, gears, bridges, gongs, hammers, dials, calendar works, moon phase, reserves, levers, and case
10. 20 public complication groups in a responsive section
11. Clear note that the model is not CAD and does not copy proprietary geometry

Validation completed on May 26, 2026:
1. npm install passed
2. npm run build passed
3. npm run dev -- --host 127.0.0.1 started successfully
4. Local HTTP check returned 200 OK

Known issues:
1. The model is still an educational abstraction
2. The app still needs user side visual inspection in a browser
3. The chime tones are simple synthesized tones

Next exact task:
Open the app locally and tune camera angle, label density, colors, and spacing based on how it looks on screen.

How to resume:
1. Run npm install
2. Run npm run dev
3. Open the Vite local URL
4. Edit src/App.jsx for behavior and mechanism content
5. Edit src/styles.css for visual polish
