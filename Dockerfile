# syntax=docker/dockerfile:1.7
#
# One image serves everything: the React site, the JSON API and the Filament admin.
#   docker build -t bytecode .
# Stages: frontend (Vite build of ./frontend) -> base (PHP + extensions) -> app (final image
# with ./backend and the built site).

############################################
# 1. Frontend: build the React site with Vite
############################################
FROM node:22-alpine AS frontend
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund
COPY frontend/index.html frontend/vite.config.ts frontend/tsconfig.json frontend/tsconfig.app.json frontend/tsconfig.node.json ./
COPY frontend/public ./public
COPY frontend/src ./src
RUN npm run build

############################################
# 2. PHP base: nginx + php-fpm with the extensions Laravel and Filament need
############################################
FROM serversideup/php:8.4-fpm-nginx AS base
USER root
# intl: Filament number/date formatting. gd: image dimensions and responsive variants.
RUN install-php-extensions intl gd bcmath exif
USER www-data
WORKDIR /var/www/html

############################################
# 3. Final image
############################################
FROM base AS app

ENV AUTORUN_ENABLED=true \
    AUTORUN_LARAVEL_MIGRATION=true \
    AUTORUN_LARAVEL_STORAGE_LINK=true \
    PHP_OPCACHE_ENABLE=1 \
    PHP_UPLOAD_MAX_FILE_SIZE=210M \
    PHP_POST_MAX_SIZE=220M \
    PHP_MAX_EXECUTION_TIME=300 \
    NGINX_CLIENT_MAX_BODY_SIZE=220M \
    LOG_CHANNEL=stderr

# Dependencies first, so code changes do not reinstall them.
COPY --chown=www-data:www-data backend/composer.json backend/composer.lock ./
RUN --mount=type=cache,target=/tmp/composer-cache,uid=33,gid=33 \
    COMPOSER_CACHE_DIR=/tmp/composer-cache \
    composer install --no-dev --no-interaction --no-scripts --no-autoloader --prefer-dist

COPY --chown=www-data:www-data backend/ ./
RUN composer dump-autoload --optimize --no-dev \
    && php artisan package:discover --ansi

# The built site: assets go to public/, the HTML shell to resources/spa/ (Laravel fills it
# with per-page meta and the CMS content on every request, so it must not be served raw).
COPY --chown=www-data:www-data --from=frontend /app/dist/ ./public/
RUN mkdir -p resources/spa storage/app/public \
    && mv public/index.html resources/spa/index.html \
    && php artisan filament:assets

# Runs after the image's Laravel automations (migrations, storage link, caches).
COPY --chmod=755 docker/entrypoint.d/ /etc/entrypoint.d/

EXPOSE 8080
