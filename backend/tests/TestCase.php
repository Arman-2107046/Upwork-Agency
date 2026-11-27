<?php

namespace Tests;

use Database\Seeders\ContentSeeder;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        // Tests never reach Cloudflare or any other real service.
        Http::preventStrayRequests();
        config(['app.spa_index' => base_path('tests/Fixtures/index.html'), 'app.url' => 'https://bytecode.test']);
    }

    /** Seeds the original website content (images go to the fake public disk). */
    protected function seedContent(): void
    {
        $this->seed(ContentSeeder::class);
    }
}
