# Bytecode Software Labs: agency website

Client-side rendered marketing site built with Vite, React 18, TypeScript (strict),
React Router 6, Tailwind CSS 4 and Framer Motion. No backend.

## Quick start

```bash
npm install
cp .env.example .env      # then fill in the values
npm run dev               # http://localhost:5173 (includes /motion-lab)
npm run build             # type-check + production build into dist/
npm run preview           # serve dist/ at http://localhost:4173
npm run lint              # ESLint
npm run format            # Prettier
```

Node 20.19+ or 22.12+ is required (Vite 8).

## Environment variables

| Variable               | Purpose                                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_SITE_URL`        | Production URL without trailing slash. Used for canonical URLs, Open Graph, JSON-LD, `robots.txt`, `sitemap.xml`.                     |
| `VITE_CONTACT_EMAIL`   | Email shown in the footer and contact page, and used for the form's mailto fallback. Hidden when empty.                               |
| `VITE_UPWORK_URL`      | Upwork profile link. Hidden when empty.                                                                                               |
| `VITE_FORM_ENDPOINT`   | JSON POST endpoint for the contact form: Formspree (`https://formspree.io/f/<id>`) or Web3Forms (`https://api.web3forms.com/submit`). |
| `VITE_FORM_ACCESS_KEY` | Optional. Web3Forms access key (not needed for Formspree).                                                                            |

Variables are baked in at build time: rebuild after changing them.

## Editing content (no React knowledge needed)

| What                                                                                 | Where                                                         |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| Brand name, tagline, response time, social links, claims (`17+` years, Upwork badge) | `src/config/site.ts`                                          |
| Services (titles, bullets, "what you get")                                           | `src/data/services.ts`                                        |
| Projects, scope/technology tags, images                                              | `src/data/projects.ts`                                        |
| Configurator showcase stages and screenshots                                         | `src/data/showcase.ts`                                        |
| Technologies                                                                         | `src/data/technologies.ts`                                    |
| Process steps, "Why choose us", About copy                                           | `src/data/process.ts`, `src/data/why.ts`, `src/data/about.ts` |
| Hero and final call-to-action copy                                                   | `src/data/home.ts`                                            |
| Colors (including `--accent`) and type scale                                         | `src/styles/globals.css` (top of file)                        |
| Animation timings and easings                                                        | `src/motion/tokens.ts`                                        |

To hide a claim everywhere, set it to `false` in `site.claims`.

### Images

Project, showcase and service images are real screenshots of the live projects, stored as
WebP in `public/images/work/` and `public/images/showcase/`. Each image has a full-size file
(`name.webp`) and a small-screen file (`name-800.webp`); the `webp()` helper in
`src/data/types.ts` builds the entry from that pair:

```ts
cover: webp('work/customtailor-home', 'CustomTailor.store homepage', 1600, 1000),
```

Keep `width` and `height` equal to the full-size file so the layout does not shift.
Entries without `src` render a designed placeholder, never a broken image. A service shows
a screenshot only when one of the projects demonstrates it (`example` in `services.ts`).

Look for `TODO` comments in `src/data` for facts still to provide (each project's technology
stack is left empty on purpose until it is confirmed).

### Technology logos

The logo slider and stack table use brand marks from simple-icons (CC0), copied into
`src/data/brandIcons.ts` so the full icon package is not shipped. To add a logo, copy the
icon's `hex` and `path` from simpleicons.org into that file; names without a brand mark get a
neutral line icon (see `src/components/ui/TechLogo.tsx`).

`public/og-image.png` and the favicons are generated from the wordmark; replace them with
final artwork when available.

## SEO

- `<Seo />` (`src/components/seo/Seo.tsx`) sets title, description, canonical, Open Graph,
  Twitter and theme-color tags per route, plus route JSON-LD (`Service`, `CreativeWork`).
- `index.html` gets default tags and the `Organization` JSON-LD at build time from
  `src/config/site.ts` (see `vite.config.ts`).
- `public/robots.txt` and `public/sitemap.xml` are regenerated on every build/dev start
  from `VITE_SITE_URL` and the project list. `/motion-lab` is never included.
- Pages are pure components with data in `src/data`, so prerendering or a move to Next.js
  only needs a new rendering layer.

## Deployment (SPA fallback)

Every route is rendered client-side, so the host must serve `index.html` for unknown paths.

- **Netlify**: `public/_redirects` (`/* /index.html 200`) is copied into `dist/`.
- **Vercel**: `vercel.json` rewrites all paths to `/index.html` and caches `/assets/` for a year.
- **Ubuntu VPS / Nginx**: see `nginx.conf.example` (`try_files $uri $uri/ /index.html;`).

Enable gzip or brotli on your host; the JavaScript is roughly 3x smaller compressed.

## Motion and accessibility

See [`src/motion/README.md`](src/motion/README.md) for every primitive. All effects respect
`prefers-reduced-motion`: pinned sections become stacked sections, the marquee stops,
parallax, smooth scrolling and the custom cursor are off, and reveals become a 150ms fade.
The site has a skip link, visible focus rings, a focus-trapped mobile menu, and focus moves to
each new page's heading after navigation.

## Project structure

```
src/
  config/      site.ts (brand + env), routes.ts
  data/        all copy and content
  motion/      tokens, primitives, smooth scroll, page transition
  components/  layout/, ui/, sections/, seo/, cursor/
  pages/       one file per route (+ MotionLab, dev only)
  hooks/       useTheme, useScrollSpy, useMediaQuery
  lib/         cn, validators, scroll helpers
  styles/      globals.css (design tokens)
```
