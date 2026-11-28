#!/bin/sh
# Runs after 50-laravel-automations.sh (migrations, storage:link, config cache).
# Seeds the original content on first start and creates the admin from ADMIN_EMAIL/ADMIN_PASSWORD.
set -e
artisan="${APP_BASE_DIR:-/var/www/html}/artisan"
if [ "${APP_BOOTSTRAP_ENABLED:-true}" = "true" ]; then
    echo "🚀 app:bootstrap"
    php "$artisan" app:bootstrap --no-interaction
fi
