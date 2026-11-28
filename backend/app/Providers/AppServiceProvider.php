<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Admin uploads: project videos can be up to 200 MB.
        config([
            'livewire.temporary_file_upload.rules' => ['required', 'file', 'max:204800'],
            'livewire.temporary_file_upload.max_upload_time' => 30,
        ]);

        // Contact form: a few messages per minute and per day from one address.
        RateLimiter::for('contact', fn (Request $request) => [
            Limit::perMinute(5)->by($request->ip()),
            Limit::perDay(30)->by($request->ip()),
        ]);

        // Public blog routes, each with its own budget per visitor.
        RateLimiter::for('content', fn (Request $request) => Limit::perMinute(240)->by($request->ip()));
        RateLimiter::for('feed', fn (Request $request) => Limit::perMinute(60)->by($request->ip()));
        RateLimiter::for('share-image', fn (Request $request) => Limit::perMinute(60)->by($request->ip()));
        RateLimiter::for('blog-view', fn (Request $request) => Limit::perMinute(60)->by($request->ip()));
        RateLimiter::for('blog-like', fn (Request $request) => Limit::perMinute(60)->by($request->ip()));
        RateLimiter::for('blog-comment', fn (Request $request) => [
            Limit::perMinute(10)->by($request->ip()),
            Limit::perDay(50)->by($request->ip()),
        ]);
    }
}
