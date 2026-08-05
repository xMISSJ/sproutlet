---
name: reframe-plant-images
description: >-
  Crops and reframes catalog plant PNGs in public/plants so the subject fills
  the frame like the other cutouts (tight alpha/luma bounds, ~3% margin,
  transparent background preserved, ~926px tall). Use when adding or replacing
  plant images under public/plants, when a plant looks too small in
  catalog/care cards, or when the user asks to crop, reframe, or normalize
  plant assets.
---

# Reframe plant images

Catalog cards use `object-contain`, so extra transparent padding makes a plant look smaller than the others. New assets in `public/plants/` must be reframed before shipping.

## When to run

- After dropping a new PNG into `public/plants/`
- After replacing an existing plant image
- When the user says a plant looks too small / differently sized vs others

## How to run

From the repo root (PowerShell):

```powershell
# One file
powershell -NoProfile -ExecutionPolicy Bypass -File .cursor/skills/reframe-plant-images/scripts/reframe-plant-images.ps1 -Path public/plants/olea-europaea.png

# Every PNG in public/plants
powershell -NoProfile -ExecutionPolicy Bypass -File .cursor/skills/reframe-plant-images/scripts/reframe-plant-images.ps1 -All
```

The script overwrites the target file(s) in place. It does not keep backups — use git to restore if needed.

## What the script does

1. If the PNG has a solid black background (no alpha), **knock out** near-black edge-connected pixels to transparency
2. Find the subject bounding box via **alpha** (preferred) or **luma**
3. Crop with ~3% margin
4. Scale so height is **926px**
5. Write a PNG on a **transparent** canvas (never fill with opaque black)

## After reframing

- Point `image_url` in `src/data/seedPlants.js` at the file under `public/plants/`
- Hard-refresh the app if the old asset is cached

## Checklist

- [ ] PNG lives in `public/plants/`
- [ ] Ran the reframe script on that file (or `-All`)
- [ ] Background is transparent; subject fills the frame similarly to other plants
- [ ] Seed / catalog entry uses the correct filename
