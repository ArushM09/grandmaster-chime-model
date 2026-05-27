# Handoff

Current status:
Milestone 6 is complete. The educational inspector now has beginner and advanced explanation tabs, mechanism search/filtering, acoustic function notes, source notes, and a clear non-CAD/no-proprietary-layout disclaimer. Search operates across labels, categories, beginner copy, and advanced copy.

Files changed:
1. Updated src/data/mechanisms.js with acoustic function notes and source/disclaimer notes.
2. Updated src/App.jsx with beginner/advanced tabs, mechanism search, filtered mechanism counts, acoustic function panel, and source notes panel.
3. Updated src/styles.css with search, tabs, acoustic notes, and source-note styling.
4. Added validation/screenshots/milestone6-education.png from Playwright validation.

What works:
1. npm run lint passes.
2. npm run build passes.
3. Playwright validates the advanced explanation tab.
4. Playwright validates searching for "gong" filters the mechanism list.
5. Playwright validates selecting Three gongs after filtering shows the advanced explanation.
6. Playwright validates acoustic function notes and the non-CAD/no-proprietary-layout source disclaimer are present.
7. Playwright confirms the WebGL canvas remains nonblank with the educational UI state.

What is broken:
1. Blender is still not available through PATH, so the committed GLB remains the temporary Node fallback asset.
2. Final screenshot matrix script, README polish, final handoff polish, and production build cleanup are still pending.
3. Production build emits a large chunk warning because the 3D stack is bundled into the main app; this is not a build failure.

Next exact task:
Add scripts/visual_check.js and capture the required Playwright screenshot matrix: desktop, narrow, front side, calendar side, exploded view, and chime mode.

How to resume:
1. git checkout from-zero-full-rebuild
2. npm install
3. npm run generate:fallback-model
4. npm run dev -- --host 127.0.0.1 --port 5173
5. npm run lint
6. npm run build
7. Continue with Milestone 7: Playwright screenshot validation script and screenshot matrix.
