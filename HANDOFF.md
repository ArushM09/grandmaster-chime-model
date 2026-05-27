# Handoff

Current status:
Milestone 2 is complete. The project has a Blender Python generator for an original educational Grandmaster Chime model, plus a temporary Node fallback exporter because Blender is not installed on this machine. The fallback exporter generated public/models/grandmaster_chime.glb and public/models/grandmaster_chime_manifest.json with all required named mechanism groups.

Files changed:
1. Added scripts/blender/generate_grandmaster_chime.py.
2. Added scripts/blender/README.md with Blender install and run instructions.
3. Added scripts/create_fallback_model.js.
4. Added public/models/grandmaster_chime.glb.
5. Added public/models/grandmaster_chime_manifest.json.
6. Updated package.json with generate:blender-model and generate:fallback-model scripts.
7. Updated eslint.config.js so src uses browser globals and scripts use Node globals.

What works:
1. python -m py_compile scripts/blender/generate_grandmaster_chime.py passes.
2. npm run generate:fallback-model writes the temporary GLB and manifest.
3. npm run lint passes.
4. npm run build passes.
5. The manifest includes public facts, the non-CAD accuracy boundary, and all required named mechanism groups.

What is broken:
1. Blender is not available through PATH, so the Blender-generated GLB has not been produced on this machine.
2. The app still renders the milestone 1 shell and does not load the GLB yet.
3. Viewer interactions, animations, educational panels, and Playwright screenshots are still pending.

Next exact task:
Implement the React Three Fiber viewer that loads public/models/grandmaster_chime.glb with useGLTF, shows loading and error states, supports OrbitControls, and allows named mechanism selection with highlighting.

How to resume:
1. git checkout from-zero-full-rebuild
2. npm install
3. npm run generate:fallback-model
4. npm run build
5. Continue with Milestone 3: GLB viewer loading, selection, highlighting, orbit controls, and loading/error states.
