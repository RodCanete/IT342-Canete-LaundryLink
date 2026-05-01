# Silk Hero Background Integration

**Date:** 2026-05-01
**Branch:** feature/UI_refactoring

## Summary

Replace the `LiquidEther` animated background in the hero section with the `Silk` WebGL shader component from React Bits. Adjust hero section spacing for a more compact, modern layout.

## Goals

- Swap the fluid background from LiquidEther to Silk (Three.js shader)
- Match the Silk color to the project's primary blue-indigo token (`#5B6FEF`)
- Keep content fully readable by reducing Silk opacity to 35%
- Smooth the section-to-section transition with a bottom gradient fade
- Tighten mobile vertical padding and grid gap without touching the desktop layout

## Component: Silk

**Source file:** `web/components/landing/Silk.jsx`

Copied verbatim from the React Bits library (JavaScript + CSS variant). Uses `@react-three/fiber` `Canvas` + a custom GLSL shader (`vertexShader` / `fragmentShader`) that produces an animated silk-wave texture. The `Canvas` fills its parent container via CSS; sizing is controlled by the parent wrapper div.

**Props used:**

| Prop | Value | Reason |
|------|-------|--------|
| `speed` | `5` | Default — smooth, not distracting |
| `scale` | `1` | Default |
| `color` | `#5B6FEF` | Matches project primary token |
| `noiseIntensity` | `1.5` | Default |
| `rotation` | `0` | Default |

## Dependencies

- `@react-three/fiber` — **new**, must be installed (`three` is already present)
- No other new dependencies

## Changes

### 1. New file: `web/components/landing/Silk.jsx`

Copy the full Silk component source (forwardRef SilkPlane + Silk default export).

### 2. `web/components/landing/hero-section.tsx`

**Background wrapper** — replace the LiquidEther div with:

```jsx
<div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true"
     style={{ opacity: 0.35 }}>
  <Silk speed={5} scale={1} color="#5B6FEF" noiseIntensity={1.5} rotation={0} />
</div>
```

**Gradient fade overlay** — new sibling div after the Silk wrapper:

```jsx
<div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-32
                bg-gradient-to-b from-transparent to-background/60"
     aria-hidden="true" />
```

**Spacing** — content wrapper class changes:

| Token | Before | After |
|-------|--------|-------|
| Mobile vertical padding | `py-28` | `py-20` |
| Grid gap | `gap-16 lg:gap-20` | `gap-12 lg:gap-16` |

Desktop layout (`lg:min-h-screen lg:items-center lg:py-0`) is unchanged.

**Import** — replace `import LiquidEther from "./LiquidEther"` with `import Silk from "./Silk"`.

### 3. `web/package.json`

Add `@react-three/fiber` to dependencies and run `npm install`.

## What is NOT changing

- Desktop layout (min-h-screen, centered grid)
- Section base background (`bg-gradient-to-br from-background via-background to-primary/5`) — kept as fallback while Canvas initializes
- All hero content (headline, CTA buttons, stat bar, image, feature cards)
- LiquidEther.tsx and LiquidEther.css files (leave in place, just no longer imported by hero)

## Acceptance Criteria

- Silk shader renders full-bleed behind hero content with no layout shift
- Opacity is visibly subtle — text contrast is unaffected
- Bottom gradient fade is visible at the section boundary
- Mobile padding is visibly tighter than before
- No TypeScript errors, no console errors related to WebGL/three
