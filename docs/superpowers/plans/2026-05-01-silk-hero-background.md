# Silk Hero Background Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the LiquidEther animated background in the hero section with the Silk WebGL shader component, tighten mobile spacing, and add a bottom gradient fade.

**Architecture:** Silk is a self-contained React component that renders a Three.js GLSL shader via `@react-three/fiber`'s `Canvas`. It is placed in an `absolute inset-0` wrapper div so it fills the hero section behind all content. Opacity is set to 35% via inline style on the wrapper; a second sibling div provides a gradient fade at the bottom boundary.

**Tech Stack:** React 19, Vite, TypeScript, Three.js (`three` already installed), `@react-three/fiber` (new), Tailwind CSS v4

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Install | — | Add `@react-three/fiber` to dependencies |
| Create | `web/components/landing/Silk.jsx` | Self-contained Silk WebGL shader component |
| Modify | `web/components/landing/hero-section.tsx` | Swap background, add gradient overlay, tighten spacing |

---

### Task 1: Install `@react-three/fiber`

**Files:**
- Modify: `web/package.json` (via npm)

- [ ] **Step 1: Install the dependency**

```bash
cd web
npm install @react-three/fiber
```

Expected output: added 1 package (or similar), no errors.

- [ ] **Step 2: Verify it appears in package.json**

Open `web/package.json` and confirm `@react-three/fiber` appears in `dependencies`.

- [ ] **Step 3: Commit**

```bash
git add web/package.json web/package-lock.json
git commit -m "chore: add @react-three/fiber for Silk background"
```

---

### Task 2: Create the Silk component

**Files:**
- Create: `web/components/landing/Silk.jsx`

- [ ] **Step 1: Create `web/components/landing/Silk.jsx` with this exact content**

```jsx
/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { forwardRef, useRef, useMemo, useLayoutEffect } from 'react';
import { Color } from 'three';

const hexToNormalizedRGB = hex => {
  hex = hex.replace('#', '');
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255
  ];
};

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`;

const SilkPlane = forwardRef(function SilkPlane({ uniforms }, ref) {
  const { viewport } = useThree();

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.scale.set(viewport.width, viewport.height, 1);
    }
  }, [ref, viewport]);

  useFrame((_, delta) => {
    ref.current.material.uniforms.uTime.value += 0.1 * delta;
  });

  return (
    <mesh ref={ref}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} />
    </mesh>
  );
});
SilkPlane.displayName = 'SilkPlane';

const Silk = ({ speed = 5, scale = 1, color = '#7B7481', noiseIntensity = 1.5, rotation = 0 }) => {
  const meshRef = useRef();

  const uniforms = useMemo(
    () => ({
      uSpeed: { value: speed },
      uScale: { value: scale },
      uNoiseIntensity: { value: noiseIntensity },
      uColor: { value: new Color(...hexToNormalizedRGB(color)) },
      uRotation: { value: rotation },
      uTime: { value: 0 }
    }),
    [speed, scale, noiseIntensity, color, rotation]
  );

  return (
    <Canvas dpr={[1, 2]} frameloop="always">
      <SilkPlane ref={meshRef} uniforms={uniforms} />
    </Canvas>
  );
};

export default Silk;
```

- [ ] **Step 2: Verify the file was saved correctly**

```bash
head -5 web/components/landing/Silk.jsx
```

Expected: `/* eslint-disable react/no-unknown-property */` on line 1.

- [ ] **Step 3: Commit**

```bash
git add web/components/landing/Silk.jsx
git commit -m "feat: add Silk WebGL shader background component"
```

---

### Task 3: Update hero-section.tsx

**Files:**
- Modify: `web/components/landing/hero-section.tsx`

- [ ] **Step 1: Replace the LiquidEther import with Silk**

In `web/components/landing/hero-section.tsx`, find line 6:

```tsx
import LiquidEther from "./LiquidEther"
```

Replace with:

```tsx
import Silk from "./Silk"
```

- [ ] **Step 2: Replace the LiquidEther background block with Silk + gradient overlay**

Find the entire block (lines 30–42):

```tsx
      {/* ── LiquidEther fluid background ── */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-50" aria-hidden="true">
        <LiquidEther
          colors={['#93C5FD', '#60A5FA', '#38BDF8']}
          mouseForce={20}
          cursorSize={120}
          autoDemo={true}
          autoSpeed={0.4}
          autoIntensity={1.6}
          resolution={0.5}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
```

Replace with:

```tsx
      {/* ── Silk WebGL background ── */}
      <div className="pointer-events-none absolute inset-0 z-0" style={{ opacity: 0.35 }} aria-hidden="true">
        <Silk speed={5} scale={1} color="#5B6FEF" noiseIntensity={1.5} rotation={0} />
      </div>

      {/* ── Bottom gradient fade ── */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-32 bg-gradient-to-b from-transparent to-background/60"
        aria-hidden="true"
      />
```

- [ ] **Step 3: Tighten mobile vertical padding**

Find on line 45:

```tsx
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-28 lg:flex lg:min-h-screen lg:items-center lg:px-12 lg:py-0">
```

Replace with:

```tsx
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:flex lg:min-h-screen lg:items-center lg:px-12 lg:py-0">
```

- [ ] **Step 4: Tighten grid gap**

Find on line 46:

```tsx
        <div className="grid w-full items-center gap-16 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
```

Replace with:

```tsx
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
```

- [ ] **Step 5: Run the TypeScript build to catch any errors**

```bash
cd web && npx tsc --noEmit
```

Expected: no output (zero errors). If errors appear, they will name a file and line number — fix before continuing.

- [ ] **Step 6: Start the dev server and verify visually**

```bash
cd web && npm run dev
```

Open the app in a browser. Confirm:
- Silk shader renders as a full-bleed animated background behind the hero content
- Effect is subtle (35% opacity) — headline and body text are fully readable
- A soft gradient fade is visible at the bottom of the hero section
- Mobile layout has less vertical whitespace than before (padding reduced from `py-28` to `py-20`)
- Desktop layout is unchanged (vertically centered, full viewport height)
- No console errors related to WebGL, Three.js, or `@react-three/fiber`

- [ ] **Step 7: Commit**

```bash
git add web/components/landing/hero-section.tsx
git commit -m "feat: replace LiquidEther with Silk background in hero section"
```
