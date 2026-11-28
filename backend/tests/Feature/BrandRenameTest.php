<?php

namespace Tests\Feature;

use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class BrandRenameTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_site_saved_with_the_old_name_becomes_kernel_cloud_labs(): void
    {
        $migration = ['--path' => 'database/migrations/2026_11_28_000009_rename_brand_to_kernel_cloud_labs.php'];
        Artisan::call('migrate:rollback', $migration);

        Setting::putGroup('site', [
            'brand_name' => 'Bytecode Software Labs',
            'short_name' => 'Bytecode',
            'handle' => 'bytecode@labs',
            'tagline' => 'Bytecode builds things',
            'social' => [['label' => 'Upwork', 'href' => 'https://example.com']],
        ]);
        Setting::putGroup('pages', ['home' => ['title' => 'Bytecode Software Labs | Web, E-commerce & AI Automation']]);

        Artisan::call('migrate', $migration);

        $site = Setting::group('site');
        $this->assertSame('Kernel Cloud Labs', $site['brand_name']);
        $this->assertSame('Kernel', $site['short_name']);
        $this->assertSame('kernel@labs', $site['handle']);
        // Only the old full name and handle are replaced; other wording is the team's to edit.
        $this->assertSame('Bytecode builds things', $site['tagline']);
        $this->assertSame('Kernel Cloud Labs | Web, E-commerce & AI Automation', Setting::group('pages')['home']['title']);
        $this->getJson('/api/content')->assertJsonPath('site.brandName', 'Kernel Cloud Labs');
    }
}
