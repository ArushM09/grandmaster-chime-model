# Handoff

Current status:
Improvement cycle 1 is complete, but commit creation is blocked by read-only Git metadata. The app source has been revised toward a stronger museum-style educational model with a cleaner mechanism layout, richer dials, more readable gears and bridges, reduced label clutter, a clearer chime energy path, and project-local validation scripts.

Files changed:
1. package.json
2. src/App.jsx
3. src/styles.css
4. src/generatedModel.js
5. scripts/generate_blender_model.py
6. scripts/lint_static.py
7. scripts/visual_check.py
8. VISUAL_REVIEW.md
9. HANDOFF.md

What works:
1. `python3 scripts/generate_blender_model.py` generates `src/generatedModel.js`.
2. `python3 scripts/lint_static.py` passes.
3. `python3 scripts/visual_check.py` passes as a source-level visual signal check.
4. Mechanism groups are now separated into clearer front-side quadrants.
5. Gears have spokes, scaled teeth, and guide rails for better readability.
6. Bridges now read as functional support groups with jewel markers and plate zone outlines.
7. Default labels are selective and less cluttered.
8. Time and calendar dials have stronger visual hierarchy and more detailed indications.
9. Chime energy flow follows sonnerie barrels, strike train, governor, hammers, and gongs.

What is broken:
1. The local Node/npm runtime is unavailable. `node --version` returns `node: command not found`.
2. `npm install`, `npm run generate:blender-model`, `npm run lint`, `npm run build`, and `npm run visual:check` all fail before running scripts with: `WSL 1 is not supported. Could not determine Node.js install directory`.
3. Because Vite cannot run, live browser loading, screenshots, console checks, and responsive visual inspection could not be completed in this environment.
4. Bridge shapes and calendar-side mechanics are still simplified and should be tuned from screenshots once the app can run.
5. `git add`/`git commit` is blocked because `.git` is read-only in this environment: `fatal: Unable to create '/root/grandmaster-chime-model/.git/index.lock': Read-only file system`.

Next exact task:
Fix the local Node/npm environment, then run:
1. `npm install`
2. `npm run generate:blender-model`
3. `npm run lint`
4. `npm run build`
5. `npm run visual:check`
6. `npm run dev -- --host 127.0.0.1`

After that, capture desktop and narrow screenshots, update `VISUAL_REVIEW.md` with live visual scores, and tune any remaining label overlap, exploded-layer spacing, and calendar-side mechanism detail.

How to resume:
1. Open `/root/grandmaster-chime-model`.
2. Confirm Node is installed with `node --version`.
3. Run the npm workflow above.
4. Inspect the running app visually, especially front assembled view, calendar side, and exploded view.
5. Continue edits in `src/App.jsx` and `src/styles.css`, then rerun validation and update `VISUAL_REVIEW.md` and this file.
