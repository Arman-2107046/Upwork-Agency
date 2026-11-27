<?php

namespace App\Console\Commands;

use App\Content\SiteContent;
use App\Models\Project;
use App\Models\Service;
use App\Models\Setting;
use App\Models\User;
use Database\Seeders\ContentSeeder;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

/**
 * Runs on every container start (docker/entrypoint.d), after migrations.
 * First start: seeds the original website content and creates the admin from ADMIN_* variables.
 * Later starts: only clears the cached content so a new release never serves stale data.
 */
#[Signature('app:bootstrap')]
#[Description('Seed content and the first admin user when the database is empty')]
class BootstrapApp extends Command
{
    public function handle(): int
    {
        if (! Project::query()->exists() && ! Service::query()->exists() && ! Setting::query()->exists()) {
            $this->components->task('Seeding website content', fn () => $this->callSilently('db:seed', [
                '--class' => ContentSeeder::class,
                '--force' => true,
            ]) === 0);
        }

        if (! User::query()->exists()) {
            $admin = config('app.admin');
            if ($admin['email'] && $admin['password']) {
                User::query()->forceCreate([
                    'name' => $admin['name'],
                    'email' => $admin['email'],
                    'password' => $admin['password'],
                    'email_verified_at' => now(),
                ]);
                $this->components->info("Admin user {$admin['email']} created.");
            } else {
                $this->components->warn('No admin user yet. Set ADMIN_EMAIL and ADMIN_PASSWORD and restart, '
                    .'or run: php artisan make:filament-user');
            }
        }

        SiteContent::flush();

        return self::SUCCESS;
    }
}
