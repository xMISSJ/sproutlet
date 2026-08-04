---
name: create-components
description: >-
  Extract and create reusable Vue components instead of growing large views.
  Use when building or editing UI in Sproutlet, adding forms/cards/lists,
  duplicating markup across views, or when a view file is getting large.
  Prefer components under src/components whenever a UI chunk has a clear
  responsibility or may be reused.
---

# Create components where possible

When adding or changing UI in this Vue app, **prefer extracting components** over packing more markup into views.

## When to extract

Create a component if any of these are true:

- Markup is (or will be) reused in more than one place
- A block has a clear job (card, form, empty state, pagination, media tile)
- A view is growing past ~150–200 lines of template, or mixing several unrelated UI sections
- The block needs its own props/emits and would be easier to test or reason about alone

**Do not extract** tiny one-off wrappers with no reuse and no clear boundary (e.g. a single heading).

## Where files live

| Kind | Location |
| --- | --- |
| App UI components | `src/components/` |
| Route screens | `src/views/` |
| Three.js scene helpers | `src/three/` (not Vue SFCs unless wrapping a canvas) |
| Data / API | `src/data/` |

Name files in PascalCase matching the component: `CarePlantCard.vue`, `PlantForm.vue`.

## Component conventions (match existing code)

Follow patterns already used by `PlantCard.vue` and `PlantCabinet.vue`:

1. **`<script setup>`** — no Options API
2. **Props** via `defineProps({ ... })` with types, `required` / `default`
3. **Events** via `defineEmits([...])` — parents handle navigation and data writes
4. **Keep data I/O out of presentational components** when practical — pass data in, emit actions out (views own `listCarePlants`, `createCustomPlant`, router pushes)
5. **Scoped styles** only when needed; prefer existing Tailwind / CSS variables (`--hero`, `--mint`, `--paper`, dark shell classes)
6. **Dark shell** — catalog and my-plants use the dark theme; new UI should use light text / elevated dark surfaces unless wrapping an intentional light card (e.g. photo cards)

## Workflow

1. Spot the reusable or heavy block in the view
2. Move it to `src/components/NewName.vue`
3. Define a minimal props/emits API
4. Replace the view markup with `<NewName ... />`
5. Reuse the same component elsewhere instead of copy-paste

## Good extractions targets in this app

- Catalog / care plant cards and grids
- “Add plant” / edit plant forms
- Empty states and CTA panels
- Pagination controls
- Filter chip rows
- Cabinet caption/meta chrome (if it grows beyond the canvas wrapper)

## Anti-patterns

- Duplicating the same card markup in `CatalogView` and `MyPlantsView`
- Putting `localStorage` or fetch logic deep inside every small visual component
- Giant “god” components that recreate a whole page — split by section instead
- Over-abstracting with premature props for a single use

## Checklist

- [ ] New UI chunk lives in `src/components/` when reusable or substantial
- [ ] Props/emits are minimal and documented by usage
- [ ] Parent view still owns routing and persistence
- [ ] Styling matches the current dark shell / existing tokens
- [ ] No copy-pasted twin of an existing component
