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

## Deploy on Coolify

1. Push this repository to GitHub, GitLab or any Git host Coolify can read.
2. In Coolify: **New Resource › Public/Private Repository**, choose the repository, and set
   **Build Pack** to **Docker Compose** with the file `/docker-compose.yml`.
3. Under the **app** service, set your domain, e.g. `https://www.example.com` (Coolify routes it
   to port 8080 and handles HTTPS). Without one, Coolify generates a test domain.
4. Under **Environment Variables**, set the first admin (created on the first start only):

   | Variable         | Value                                                               |
   | ---------------- | ------------------------------------------------------------------- |
   | `ADMIN_EMAIL`    | Your email                                                          |
   | `ADMIN_PASSWORD` | A strong password (change it later in the admin under your profile) |

   Everything else is optional. Coolify generates the app key (`SERVICE_PASSWORD_APPKEY`) and
   the database password (`SERVICE_PASSWORD_POSTGRES`) itself, keeps them between deploys, and
   fills `APP_URL` from the domain (`SERVICE_URL_APP`). Optional: `MAIL_MAILER=smtp` with `MAIL_HOST`,
   `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_ADDRESS` to receive contact form
   emails. Without them, messages are still saved in the admin inbox.

5. Deploy. On every start the container runs migrations, caches config and routes, and runs
   `php artisan app:bootstrap`, which seeds the original content and creates the admin on the
   first start only. Redeploys keep all data.

Do not edit `SERVICE_PASSWORD_POSTGRES` after the first deploy: the database keeps the password
it was created with. Data lives in two named volumes: `db-data` (PostgreSQL) and `app-media`
(uploaded images). Enable Coolify's scheduled database backups for the `db` service.

**Other Docker hosts**: outside Coolify the `SERVICE_*` values are not generated. Put
`SERVICE_URL_APP`, `SERVICE_PASSWORD_APPKEY` (exactly 32 letters and digits) and
`SERVICE_PASSWORD_POSTGRES` in a `.env` file next to `docker-compose.yml`, run
`docker compose up -d --build`, and put a reverse proxy that terminates HTTPS in front of
port 8080.

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
