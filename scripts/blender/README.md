# Blender Asset Generator

Run from the repository root after installing Blender:

```bash
blender --background --python scripts/blender/generate_grandmaster_chime.py -- public/models/grandmaster_chime.glb
```

The script creates original, mechanically plausible educational geometry from public specifications. It does not use Patek Philippe images, diagrams, CAD, photos, or proprietary layouts, and it must not be described as exact CAD.

If Blender is not available, use the temporary fallback asset:

```bash
npm run generate:fallback-model
```

