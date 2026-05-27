# Project spec

## Goal

Create a full interactive educational 3D model of the Patek Philippe Grandmaster Chime from zero.

The app should feel like a serious museum grade technical model, not a quick mockup.

## Public facts to use

1. The Grandmaster Chime 6300GR has 20 complications.
2. It has five acoustic functions.
3. The acoustic functions include grande sonnerie, petite sonnerie, minute repeater, alarm with time strike, and date repeater.
4. It has a reversible double sided case.
5. The movement is caliber GS AL 36 750 QIS FUS IRM.
6. The movement has 1366 parts and 108 jewels.
7. Movement diameter is 37 mm.
8. Movement thickness is 10.7 mm.
9. Frequency is 25,200 semi oscillations per hour, equal to 3.5 Hz.
10. Case diameter is 47.7 mm.
11. Case thickness is 16.07 mm.
12. It is humidity and dust protected only and not water resistant.
13. The striking mechanism uses three classic gongs.

## Required architecture

1. React, Vite, Three.js, React Three Fiber, and Drei.
2. Blender Python script under scripts/blender/generate_grandmaster_chime.py.
3. Generated GLB assets under public/models.
4. Viewer loads GLB assets with useGLTF.
5. Fallback geometry is allowed only for debugging.
6. Playwright screenshot validation under validation/screenshots.

## Required model areas

1. Reversible case.
2. Two tone case feel.
3. Front time dial.
4. Calendar side dial.
5. Mainplate.
6. Bridges with bevels.
7. Jewels.
8. Screws.
9. Going barrels.
10. Sonnerie barrels.
11. Gear trains with teeth.
12. Balance and escapement abstraction.
13. Strike train.
14. Governor.
15. Three gongs.
16. Three hammers.
17. Repeater racks and snails.
18. Date repeater racks.
19. Alarm cam and release path.
20. Perpetual calendar wheels.
21. Isolator levers.
22. Power reserve differential.
23. Exploded layer positions.

## Required interactions

1. Rotate and zoom.
2. Reset view.
3. Switch time side and calendar side.
4. Explode layers.
5. Toggle labels.
6. Toggle cutaway mode.
7. Toggle transparent case.
8. Click named mechanism groups.
9. Beginner and advanced explanations.
10. Search or filter complications.
11. Timeline for animation phase.
12. Source notes and non CAD disclaimer.

## Required animations

1. Case flip.
2. Balance oscillation.
3. Gear rotation.
4. Governor spin.
5. Hammer strikes.
6. Energy particles from barrels to strike train to governor to hammers to gongs.
7. Grande sonnerie.
8. Petite sonnerie.
9. Minute repeater.
10. Date repeater.
11. Alarm time strike.
12. Calendar advance.
13. Moon phase slow rotation.

## Visual quality

1. Dark museum style interface.
2. Full screen model first layout.
3. Serious typography.
4. Smooth transitions.
5. Labels hidden or minimal by default.
6. Responsive layout.
7. Loading state for GLB assets.
8. Error boundary if model loading fails.
9. Metallic materials with roughness variation.
10. Separate materials for rose gold, white gold, brass, ruby jewels, sapphire crystal, dark dial, blued screws, and moon disk.
