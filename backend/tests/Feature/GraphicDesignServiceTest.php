<?php

namespace Tests\Feature;

use App\Models\Service;
use Database\Seeders\ContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class GraphicDesignServiceTest extends TestCase
{
    use RefreshDatabase;

    private const MIGRATION = ['--path' => 'database/migrations/2026_11_28_000011_add_graphic_design_service.php'];

    public function test_a_fresh_site_lists_graphic_design_as_its_own_last_service(): void
    {
        $this->seed(ContentSeeder::class);

        $slugs = array_column($this->getJson('/api/content')->json('services'), 'slug');
        $this->assertSame('e-commerce', $slugs[0]);
        $this->assertSame(['design', 'graphic-design'], array_slice($slugs, -2));
        $this->getJson('/api/content')
            ->assertJsonPath('services.8.title', 'Graphic Design: Photoshop & Illustrator')
            ->assertJsonPath('services.8.icon', 'pen-tool');
        $this->get('/services/graphic-design')->assertOk();
    }

    public function test_an_existing_site_gets_the_new_service_after_its_own_services(): void
    {
        $this->seed(ContentSeeder::class);
        Artisan::call('migrate:rollback', self::MIGRATION);
        $this->assertNull(Service::query()->where('slug', 'graphic-design')->first());
        Service::query()->where('slug', 'design')->update(['title' => 'Graphic Design & Product Visualization']);
        Service::query()->where('slug', 'cloud')->update(['sort' => 50]);

        Artisan::call('migrate', self::MIGRATION);

        $this->assertSame('Product Mockups & Visualization', Service::query()->where('slug', 'design')->value('title'));
        $this->assertSame(51, Service::query()->where('slug', 'graphic-design')->value('sort'));
        $this->assertSame(['Design'], Service::query()->where('slug', 'graphic-design')->first()->stack_groups);
    }

    public function test_an_edited_mockups_title_is_kept(): void
    {
        $this->seed(ContentSeeder::class);
        Artisan::call('migrate:rollback', self::MIGRATION);
        Service::query()->where('slug', 'design')->update(['title' => 'Our own title']);

        Artisan::call('migrate', self::MIGRATION);

        $this->assertSame('Our own title', Service::query()->where('slug', 'design')->value('title'));
    }
}
