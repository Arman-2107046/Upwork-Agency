# Bytecode Software Labs: agency website

A React marketing site with a Laravel + Filament CMS behind it, packaged as one Docker image
with PostgreSQL. Ready for [Coolify](https://coolify.io).

| Part    | Stack                                                                          | Where                              |
| ------- | ------------------------------------------------------------------------------ | ---------------------------------- |
| Website | Vite, React 18, TypeScript (strict), React Router 6, Tailwind 4, Framer Motion | `frontend/`                        |
| Backend | Laravel 13, PHP 8.4, PostgreSQL 17                                             | `backend/`                         |
| Admin   | Filament 5 at `/admin`                                                         | `backend/app/Filament/`            |
| Hosting | `serversideup/php` (nginx + PHP-FPM), Docker Compose                           | `Dockerfile`, `docker-compose.yml` |

## How it fits together

```
Browser ──► nginx + PHP-FPM (one container, port 8080) ──► PostgreSQL (db service)
            │
            ├─ /assets, /favicon.svg …  built React files, served by nginx
            ├─ /storage/…               images uploaded in the admin (volume: app-media)
            ├─ /api/content             all website content as JSON
            ├─ /api/contact             contact form: saves the message, emails the team
            ├─ /sitemap.xml, /robots.txt  generated from published content
            ├─ /admin                   Filament admin
            └─ every other path         the React site
```

Laravel serves the React site's `index.html` for every page and fills in two slots:

- **`<!--app:head-->`**: the page's title, description, canonical URL, Open Graph tags and
  JSON-LD, so search engines and link previews see the right tags before JavaScript runs.
  Unknown paths return a real 404.
- **`<!--app:content-->`**: the full CMS content as JSON. The React data modules
  (`frontend/src/data/*.ts`) read it synchronously (`frontend/src/content/load.ts`), so pages render without a
  loading state, exactly as when the content lived in code.

The content is cached and the cache is cleared automatically whenever anything is saved in the
admin, so changes show on the next page load.

## Editing content (admin)

Sign in at `/admin`. Everything the website shows is editable:

| Admin menu               | What it controls                                                               |
| ------------------------ | ------------------------------------------------------------------------------ |
| Inbox › Messages         | Contact form enquiries (unread count in the menu, reply by email)              |
| Content › Projects       | Projects, cover and gallery images, scope, technologies, home page selection   |
| Content › Services       | Services, offer list, example screenshot, icon, "Tools we use"                 |
| Content › Technologies   | Technology groups, logo slider rows                                            |
| Pages › Home page        | Hero, statement, process, "Why us", configurator showcase                      |
| Pages › About page       | Statement, "How we work", team roles, footer closing line                      |
| Settings › Site settings | Brand name, emails, Upwork link, social links, claims (17+ years, Upwork)      |
| Settings › SEO           | Search title and description of the Home, Services, Work, About, Contact pages |
| Settings › Users         | Admin accounts                                                                 |

Drag rows in a table to reorder projects, services and technology groups. Turning off
"Published" hides a record from the website and the sitemap. Clearing "Years of experience"
or turning off the Upwork claim hides that claim everywhere.

**Images**: upload WebP, JPG or PNG (up to 10 MB). The backend reads the dimensions and creates
an 800 px WebP copy for small screens, so pages keep their layout and load fast. The original
screenshots are in `backend/database/seeders/content/images/` and are copied to the media
volume on the first start.

Page headings and section titles (for example "Design craft meets modern engineering.") are
part of the design and stay in the React components.

## Cloudflare Images and Stream (optional)

With the `CLOUDFLARE_*` variables set, every website image is copied to Cloudflare Images and
served from `imagedelivery.net` (resized per screen, WebP/AVIF automatically), and project
videos are copied to Cloudflare Stream (adaptive streaming player). Copying happens right after
a save in the admin and on every container start; run it by hand with
`php artisan media:sync`. Files keep their originals in the `app-media` volume, and anything not
yet on Cloudflare (or failing to upload) is served from there, so the site never breaks.

Requirements in the Cloudflare account:

- **Images**: an active Cloudflare Images plan that includes storage (the free plan only
  transforms images stored elsewhere), and **Flexible variants** turned on (Images › Variants).
- **Stream**: an active Stream subscription for videos.
- An API token with **Account › Cloudflare Images › Edit** and **Account › Stream › Edit**.

Files are uploaded under the `CLOUDFLARE_MEDIA_PREFIX` folder (default `bytecode/`), so other
projects in the same account are never touched. The dashboard shows how many images and videos
Cloudflare serves, and the project form shows each video's status. To delete Cloudflare copies
of media the site no longer uses: `php artisan media:sync --prune`.

## Deploy on Coolify

1. Push this repository to GitHub, GitLab or any Git host Coolify can read.
2. In Coolify: **New Resource › Public/Private Repository**, choose the repository, and set
   **Build Pack** to **Docker Compose** with the file `/docker-compose.yml`.
3. Under **Environment Variables**, set:

   | Variable         | Value                                                               |
   | ---------------- | ------------------------------------------------------------------- |
   | `APP_URL`        | Your public URL, e.g. `https://www.example.com` (no trailing slash) |
   | `APP_KEY`        | Output of `echo "base64:$(openssl rand -base64 32)"`                |
   | `DB_PASSWORD`    | A long random password                                              |
   | `ADMIN_EMAIL`    | Your email (first admin, created on the first start only)           |
   | `ADMIN_PASSWORD` | A strong password (change it later in the admin under your profile) |

   Optional: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_IMAGES_HASH` to serve
   images and videos from Cloudflare (see "Cloudflare Images and Stream" above), and
   `MAIL_MAILER=smtp` with `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`,
   `MAIL_PASSWORD`, `MAIL_FROM_ADDRESS` to receive contact form emails. Without them,
   messages are still saved in the admin inbox.

4. Under the **app** service, set the domain to `https://www.example.com:8080` (the container
   listens on port 8080; Coolify's proxy handles HTTPS on 443).
5. Deploy. On every start the container runs migrations, caches config and routes, and runs
   `php artisan app:bootstrap`, which seeds the original content and creates the admin on the
   first start only. Redeploys keep all data.

Data lives in two named volumes: `db-data` (PostgreSQL) and `app-media` (uploaded images).
Enable Coolify's scheduled database backups for the `db` service.

Any other Docker host works the same way: `docker compose up -d --build` with the variables in
a `.env` file next to `docker-compose.yml`, behind a reverse proxy that terminates HTTPS.

## Local development

Requirements: Docker, and Node 20.19+ or 22.12+ for the frontend dev server.

**Run the whole stack** (production image, http://localhost:8080):

```bash
cp .env.example .env
# set APP_KEY in .env:  echo "base64:$(openssl rand -base64 32)"
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

Sign in at http://localhost:8080/admin with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`.
If port 8080 is taken, set `APP_PORT` (and match `APP_URL` and `VITE_BACKEND_URL`).

**Work on the frontend with hot reload**, with the stack above running:

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173, /api and /storage are proxied to VITE_BACKEND_URL
npm run build      # type-check + production build into frontend/dist/
npm run lint
npm run format
```

**Work on the backend**: the code in `backend/` is a standard Laravel app. Without PHP on your
machine, run Artisan and Composer through the image, for example:

```bash
docker compose exec app php artisan tinker
docker compose exec db psql -U bytecode          # database shell
```

To run the backend tests (SQLite in memory, no database needed):

```bash
docker build --target base -t bytecode-php .
docker run --rm -u "$(id -u):$(id -g)" -e HOME=/tmp -v "$PWD/backend":/var/www/html \
  --entrypoint sh bytecode-php -c "composer install && php artisan test"
```

Code changes need a rebuild of the image (`up --build`).

## Environment variables

Root `.env` (used by docker compose; on Coolify set them in the UI). See `.env.example`.

| Variable                        | Purpose                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `APP_URL`                       | Public URL. Used for canonical URLs, Open Graph, JSON-LD, sitemap.           |
| `APP_KEY`                       | Laravel encryption key (sessions, cookies).                                  |
| `DB_PASSWORD`                   | PostgreSQL password (also `DB_DATABASE`, `DB_USERNAME`, default `bytecode`). |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First admin, created when no user exists yet.                                |
| `MAIL_*`                        | SMTP for contact form notifications. Default `log`: inbox only.              |
| `CONTACT_NOTIFY_EMAIL`          | Fallback recipient when none is set in Site settings.                        |
| `APP_PORT`                      | Local runs only: host port of the site (default 8080).                       |
| `VITE_BACKEND_URL`              | `npm run dev` only: where `/api` and `/storage` are proxied.                 |

The public email, Upwork link and social links are set in the admin, not in environment
variables.

## Images and technology logos

Images entered in the admin become `ImageAsset` objects (`src`, `srcSet`, `alt`, `width`,
`height`). Records without an image render a designed placeholder, never a broken image.

The logo slider and stack table use brand marks from simple-icons (CC0), copied into
`frontend/src/data/brandIcons.ts`. A technology entered in the admin shows its logo when its name matches
an entry there (the admin lists those names); others get a neutral line icon. To add a logo,
copy the icon's `hex` and `path` from simpleicons.org into that file and add the name to
`BRAND_LOGOS` in `backend/app/Filament/Support/Fields.php`.

`public/og-image.png` and the favicons are generated from the wordmark; replace them with final
artwork when available.

## Motion and accessibility

See [`frontend/src/motion/README.md`](frontend/src/motion/README.md) for every primitive. All effects respect
`prefers-reduced-motion`: pinned sections become stacked sections, the marquee stops,
parallax, smooth scrolling and the custom cursor are off, and reveals become a 150ms fade.
The site has a skip link, visible focus rings, a focus-trapped mobile menu, and focus moves to
each new page's heading after navigation.

## Project structure

```
frontend/                            React site (Vite)
  public/                            favicons, OG image, manifest
  src/
    content/   types.ts (CMS content shape), load.ts (reads the embedded content)
    data/      thin modules over the CMS content (projects, services, …), brand icons
    config/    site.ts (brand settings from the CMS), routes.ts
    motion/, components/, pages/, hooks/, lib/, styles/
backend/                             Laravel app
  app/Content/          SiteContent (payload + cache), PageMeta (SEO tags), ImageAsset
  app/Filament/         admin resources, settings pages, dashboard widgets
  app/Http/Controllers/ SpaController (serves the site), Api/, SitemapController
  app/Models/           Project, Service, TechnologyGroup, Setting, ContactMessage, User
  database/seeders/     ContentSeeder + content/ (original content and screenshots)
  tests/Feature/        API, website, contact form, images, admin
docker/entrypoint.d/                 runs app:bootstrap on container start
Dockerfile                           one image: builds frontend/, then adds backend/
docker-compose.yml                   app + PostgreSQL (Coolify); docker-compose.local.yml for local runs
.env.example                         variables for docker compose and the frontend dev server
```
