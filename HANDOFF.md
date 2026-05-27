# Handoff

Current status:
Milestone 1 is complete. The from-zero branch now has a Vite React app with the required Three.js, React Three Fiber, Drei, and Playwright dependencies installed. The starter Vite screen has been replaced with a project-specific museum style shell and public-spec anchor cards.

Files changed:
1. Added package.json and package-lock.json.
2. Added index.html, vite.config.js, eslint.config.js, and .gitignore.
3. Added src/main.jsx, src/App.jsx, and src/styles.css.
4. Added public/favicon.svg.
5. Kept README.md, AGENTS.md, PROJECT_SPEC.md, and FULL_REBUILD_PLAN.md intact.

What works:
1. npm install completes with no vulnerabilities reported.
2. npm run build passes.
3. The app renders a project-specific landing shell and explicitly states that the model is not exact CAD.

What is broken:
1. No Blender asset generator exists yet.
2. No GLB model exists yet.
3. The 3D viewer, mechanism selection, animation modes, and Playwright screenshots are not implemented yet.

Next exact task:
Create scripts/blender/generate_grandmaster_chime.py, generate public/models/grandmaster_chime.glb if Blender is available, and create a fallback model path if Blender is unavailable.

How to resume:
1. git checkout from-zero-full-rebuild
2. npm install
3. npm run build
4. Continue with Milestone 2: Blender asset generation and model manifest.
