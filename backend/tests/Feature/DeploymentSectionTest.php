<?php

namespace Tests\Feature;

use App\Models\Setting;
use Database\Seeders\ContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeploymentSectionTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_home_page_lists_deployment_platforms_and_maintenance(): void
    {
        $this->seed(ContentSeeder::class);

        $this->getJson('/api/content')
            ->assertJsonPath('home.deployment.eyebrow', 'Deployment & Maintenance')
            ->assertJsonPath('home.deployment.platformGroups.0', ['label' => 'Cloud', 'items' => ['AWS', 'Microsoft Azure']])
            ->assertJsonCount(5, 'home.deployment.maintenance');
    }

    public function test_a_home_page_saved_before_the_section_existed_gets_the_defaults(): void
    {
        $this->seed(ContentSeeder::class);
        $home = Setting::group('home');
        unset($home['deployment']);
        Setting::putGroup('home', $home);

        $this->getJson('/api/content')->assertJsonCount(4, 'home.deployment.platformGroups');
    }

    public function test_empty_groups_are_dropped(): void
    {
        $this->seed(ContentSeeder::class);
        $home = Setting::group('home');
        $home['deployment']['platform_groups'] = [
            ['label' => 'Cloud', 'items' => [' AWS ', '']],
            ['label' => 'Empty', 'items' => []],
        ];
        Setting::putGroup('home', $home);

        $this->getJson('/api/content')->assertJsonPath('home.deployment.platformGroups', [['label' => 'Cloud', 'items' => ['AWS']]]);
    }
}
