This branch starts from zero.

Build a full interactive educational 3D model of the Patek Philippe Grandmaster Chime.

Use Codex CLI locally. Treat this branch as a clean rebuild branch.

Hard rules:
1. Do not reuse the old React implementation from main.
2. Do not copy Patek Philippe images, diagrams, photos, or proprietary layouts.
3. Do not claim exact CAD accuracy.
4. Use public specs and original geometry only.
5. Prefer generated GLB assets over primitive browser geometry.
6. Use Blender Python for model generation when possible.
7. Commit after every stable milestone.
8. Update HANDOFF.md after every major milestone.
9. Run npm run build before milestone commits once the app exists.
10. Use Playwright screenshots for visual checks once the viewer exists.

Stopping rule:
Before stopping for any reason, commit useful work and update HANDOFF.md with current status, files changed, what works, what is broken, next exact task, and how to resume.
