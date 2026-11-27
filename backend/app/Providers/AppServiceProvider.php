<?php

namespace App\Providers;

use App\Media\Cloudflare;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(Cloudflare::class, fn () => Cloudflare::fromConfig());
    }

    public function boot(): void
    {
        // Admin uploads: project videos can be up to 200 MB (the Cloudflare Stream single-upload limit).
        config([
            'livewire.temporary_file_upload.rules' => ['required', 'file', 'max:204800'],
            'livewire.temporary_file_upload.max_upload_time' => 30,
        ]);

        // Contact form: a few messages per minute and per day from one address.
        RateLimiter::for('contact', fn (Request $request) => [
            Limit::perMinute(5)->by($request->ip()),
            Limit::perDay(30)->by($request->ip()),
        ]);
    }
}
