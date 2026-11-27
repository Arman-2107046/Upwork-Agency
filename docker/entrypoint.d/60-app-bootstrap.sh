#!/bin/sh
# Runs after 50-laravel-automations.sh (migrations, storage:link, config cache).
# Seeds the original content on first start and creates the admin from ADMIN_EMAIL/ADMIN_PASSWORD,
# then copies new media to Cloudflare in the background (the site serves local files meanwhile).
set -e
artisan="${APP_BASE_DIR:-/var/www/html}/artisan"
if [ "${APP_BOOTSTRAP_ENABLED:-true}" = "true" ]; then
    echo "🚀 app:bootstrap"
    php "$artisan" app:bootstrap --no-interaction
    echo "🚀 media:sync (background)"
    php "$artisan" media:sync --no-interaction &
fi
