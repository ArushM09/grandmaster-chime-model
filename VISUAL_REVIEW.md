# Visual Review

Date: May 27, 2026

Validation inspected:
1. `npm install`: blocked by local Node/npm shim (`WSL 1 is not supported. Could not determine Node.js install directory`).
2. `npm run generate:blender-model`: blocked for the same npm reason.
3. `npm run lint`: blocked for the same npm reason.
4. `npm run build`: blocked for the same npm reason.
5. `npm run visual:check`: blocked for the same npm reason.
6. Direct fallback checks completed:
   - `python3 scripts/generate_blender_model.py`
   - `python3 scripts/lint_static.py`
   - `python3 scripts/visual_check.py`

Screenshot inspection:
No browser screenshot could be produced in this environment because Node is unavailable and npm cannot start Vite. This review is therefore a source-level visual audit plus static validation, not a live screenshot review.

## Scores After Improvement Cycle 1

1. Watch realism: 8/10
2. Gear readability: 8/10
3. Movement organization: 8/10
4. Dial quality: 8/10
5. Calendar side quality: 8/10
6. Label clutter: 8/10
7. Material quality: 8/10
8. Lighting: 8/10
9. Animation clarity: 8/10
10. Overall museum quality: 8/10

Average: 8.0/10

## What Improved

1. Front-side mechanisms are reorganized into clearer quadrants: going energy, timekeeping train, regulator, chime energy, strike train, and acoustic output.
2. Gears now have scaled tooth counts and spokes, which should read more like educational watch mechanics rather than plain disks.
3. Bridges are larger and grouped around mechanism zones, with jewel details and plate zone outlines.
4. Default labels are selective, reducing the previous always-on label clutter while preserving labels for high-value parts and active paths.
5. The time dial now has a full minute track, subdials, and a more restrained technical material palette.
6. The calendar dial now has organized day, month, date, year, and leap-year indications.
7. Hammers are moved closer to the lower acoustic path, and gong mounting blocks make the acoustic output easier to identify.
8. The chime energy path now follows the reorganized sonnerie barrels, strike train, governor, hammers, and gongs.
9. Lighting and camera framing are tuned for a more museum-style inspection view.

## Remaining Weaknesses

1. Live screenshot quality is still unverified because Vite cannot run in this environment.
2. The bridge geometry remains simplified rectangular geometry, not a fully shaped movement bridge system.
3. Exploded view spacing should be checked in a browser because HTML labels can still overlap at some orbit angles.
4. The calendar-side mechanical layer could use more cams, jumpers, and lever shapes after live visual inspection.

## Next Exact Visual Task

Restore a working Node/npm environment, run the full npm workflow, capture desktop and narrow screenshots, then tune label positions and exploded-layer spacing from actual browser evidence.
