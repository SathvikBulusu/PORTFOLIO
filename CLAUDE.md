# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Vite, localhost:5173)
npm run build    # Production build
npm run preview  # Preview production build
```

No linter or test runner is configured.

## Stack

React 18 + Vite SPA. Key libraries:
- **Three.js / @react-three/fiber / @react-three/drei** — 3D orb navigation menu
- **GSAP + @gsap/react** — all animations (scroll reveals, transitions, orb entrance)
- **Lenis** — smooth scroll, integrated with GSAP's ticker

## Architecture

The app is a single-page portfolio with a scroll-based layout. All sections are rendered in `App.jsx` and separated into section components.

### Component map

| File | Role |
|------|------|
| `App.jsx` | Root — loader, hero, story popup, page assembly |
| `components/LenisProvider.jsx` | Singleton Lenis instance + GSAP ScrollTrigger bridge. Exports `useLenis()`, `useGsapReveal()`, `getLenis()` |
| `components/OrbMenu.jsx` | Fixed bottom-right 3D nav orb (R3F Canvas + GSAP popup) |
| `components/Work.jsx` | Work experience section — multi-step overlay flow (Moneyview) |
| `components/Useworkflow.jsx` | `useWorkFlow()` hook — state machine (closed → transitioning → categories → detail) for Work overlay |
| `components/Projects.jsx` | Projects grid section |
| `components/Writing.jsx` | Writing section with month-bar visualization |
| `components/PrimaDiagram.jsx` | Pure SVG architecture diagram for the PRIMA product |
| `components/Footer.jsx` | Footer with contact links |

### Key patterns

**Scroll locking in overlays:** When the Work overlay opens, `lenis.stop()` is called. Scrollable overlay panels use `data-lenis-prevent` attribute so Lenis releases native scroll to those elements. Closing calls `lenis.start()`.

**GSAP reveal:** Elements with className `rv` (opacity:0 in CSS) are animated in on scroll via `useGsapReveal()` in `LenisProvider.jsx`. Dynamic/conditional content must NOT use `rv` (it would stay invisible when conditionally rendered after scroll position has passed).

**Cursor pill:** `data-cursor="Label"` on any element shows a floating label pill following the mouse.

**Fonts:** Three custom font families — `Array` (display/headings, from `/fonts/`), `Nippo` (body, from `/fonts/`), `Space Mono` (Google Fonts, labels/meta). CSS is injected as a template literal in `App.jsx`.

**Visitor count:** Simulated via localStorage with a seed value. Lives in `useViews()` inside `App.jsx`.

### Work overlay state machine

```
closed → [open()] → transitioning → [transitionDone()] → categories → [select(cat)] → detail
                                         ↑                                  ↑
                                    [back()]  ←─────────────────────────────┘
                                    [close()] closes from any step back to closed
```
