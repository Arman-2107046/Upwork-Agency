# Motion system

All timings, easings, springs, staggers and distances live in [`tokens.ts`](./tokens.ts).
CSS transitions read the same values through custom properties set by `applyMotionCssVars()`.
Every primitive calls `useMotionPreference()` and degrades under `prefers-reduced-motion`
(plain 150ms fade, no parallax, no pinning, no marquee movement, no custom cursor, no Lenis).

Only `transform`, `opacity` and `clip-path` are animated. Scroll reveals run once.

| Primitive                 | What it does                                                                             | Usage                                                               |
| ------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `Reveal`                  | Fade + slide in once when scrolled into view. `direction` is the direction of travel.    | `<Reveal direction="up" distance={48}>…</Reveal>`                   |
| `SplitText`               | Masked words (or `\n` lines) slide up from 110%; full text in `aria-label`.              | `<SplitText as="h2" text="Hello world" />`                          |
| `Stagger` / `StaggerItem` | Parent sequences children through variants.                                              | `<Stagger as="ul"><StaggerItem as="li">…</StaggerItem></Stagger>`   |
| `Parallax`                | Scroll-linked, spring-smoothed `translateY`; `speed` from -0.3 to 0.3.                   | `<Parallax speed={0.15}>…</Parallax>`                               |
| `ImageReveal`             | Clip-path reveal from the bottom while the inner content scales 1.15 → 1.                | `<ImageReveal><Media image={img} /></ImageReveal>`                  |
| `Magnetic`                | Child drifts toward the cursor within 12px (fine pointers only).                         | `<Magnetic><ButtonLink to="/contact">Start</ButtonLink></Magnetic>` |
| `Marquee`                 | Infinite ticker; pauses on hover, focus and via its button; static under reduced motion. | `<Marquee items={['React','Node.js']} label="Technologies" />`      |
| `CountUp`                 | Counts to a factual number once in view. Never use it for invented metrics.              | `<CountUp value={services.length} pad={2} />`                       |
| `ScrollProgress`          | 2px accent bar, `scaleX` follows page scroll. Mounted in the header.                     | `<ScrollProgress />`                                                |
| `PageTransition`          | Route fade + slide (< 500ms), scroll to top / #hash, focus moves to the new `h1`.        | `<PageTransition />` (in `RootLayout`)                              |
| `TextScrollFill`          | Words fill from `scrollFill.minOpacity` to 100% as the paragraph scrolls by.             | `<TextScrollFill text={intro} className="text-statement" />`        |
| `SpotlightCard`           | Pointer-following radial highlight + max 4deg tilt; simple lift on touch.                | `<SpotlightCard as="article">…</SpotlightCard>`                     |
| `LayoutFeatures`          | Lazy-loads layout animation support for `layoutId` elements.                             | `<LayoutFeatures><m.span layoutId="x" /></LayoutFeatures>`          |
| `SmoothScroll`            | Lenis for mouse wheels, driven by Framer's frame loop. Off on touch and reduced motion.  | Wraps the app in `main.tsx`                                         |
| `useMotionPreference`     | Returns `"full"` or `"reduced"`.                                                         | `const pref = useMotionPreference()`                                |

Open `/motion-lab` in development (`npm run dev`) to see every primitive. The route is
compiled out of production builds.
