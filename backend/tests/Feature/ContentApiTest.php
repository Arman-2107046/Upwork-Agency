<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Service;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContentApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_returns_the_seeded_content_in_the_shape_the_website_reads(): void
    {
        $this->seedContent();

        $this->getJson('/api/content')
            ->assertOk()
            ->assertJsonPath('site.brandName', 'Bytecode Software Labs')
            ->assertJsonPath('site.siteUrl', 'https://bytecode.test')
            ->assertJsonPath('site.claims.yearsExperience', '17+')
            ->assertJsonCount(7, 'projects')
            ->assertJsonCount(8, 'services')
            ->assertJsonCount(3, 'sliderRows')
            ->assertJsonPath('projects.0.slug', 'customtailor')
            ->assertJsonPath('projects.0.cover.src', '/storage/work/customtailor-home.webp')
            ->assertJsonPath('projects.0.cover.width', 1600)
            ->assertJsonPath('projects.0.cover.srcSet', '/storage/work/customtailor-home-800.webp 800w, /storage/work/customtailor-home.webp 1600w')
            ->assertJsonPath('services.0.example.projectSlug', 'customtailor')
            ->assertJsonPath('home.showcase.stages.0.image.width', 1200)
            ->assertJsonStructure([
                'site' => ['brandName', 'shortName', 'handle', 'tagline', 'description', 'email', 'upworkUrl', 'social', 'responseTime', 'claims', 'themeColor'],
                'pages' => ['home' => ['title', 'description'], 'services', 'work', 'about', 'contact'],
                'home' => ['hero' => ['eyebrow', 'headline', 'sub'], 'heroTech', 'intro', 'finalCta', 'processSteps', 'whyItems', 'showcase'],
                'about' => ['statement', 'closingLine', 'howWeWork', 'teamRoles'],
                'technologyGroups',
            ]);
    }

    public function test_edits_in_the_admin_reach_the_website_immediately(): void
    {
        $this->seedContent();
        $this->getJson('/api/content')->assertJsonPath('projects.0.title', 'CustomTailor.store');

        Project::query()->where('slug', 'customtailor')->first()->update(['title' => 'CustomTailor']);
        Setting::putGroup('site', [...Setting::group('site'), 'brand_name' => 'Bytecode Labs']);

        $this->getJson('/api/content')
            ->assertJsonPath('projects.0.title', 'CustomTailor')
            ->assertJsonPath('site.brandName', 'Bytecode Labs');
    }

    public function test_unpublished_records_and_disabled_claims_are_hidden(): void
    {
        $this->seedContent();
        Project::query()->where('slug', 'customtailor')->update(['is_published' => false]);
        Service::query()->where('slug', 'design')->first()->update(['is_published' => false]);
        Setting::putGroup('site', [...Setting::group('site'), 'upwork_badge' => false, 'years_experience' => null]);

        $content = $this->getJson('/api/content')->json();

        $this->assertNotContains('customtailor', array_column($content['projects'], 'slug'));
        $this->assertNotContains('design', array_column($content['services'], 'slug'));
        // The e-commerce example pointed at the hidden project, so it no longer links to it.
        $this->assertArrayNotHasKey('projectSlug', $content['services'][0]['example']);
        $this->assertFalse($content['site']['claims']['yearsExperience']);
        $this->assertNotContains('Established Upwork agency with extensive project experience', $content['home']['whyItems']);
    }
}
