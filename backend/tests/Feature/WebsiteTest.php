<?php

namespace Tests\Feature;

use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WebsiteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedContent();
    }

    public function test_pages_get_their_meta_tags_and_the_content_in_the_html(): void
    {
        $this->get('/work/customtailor')
            ->assertOk()
            ->assertSee('<title>CustomTailor.store | Bytecode Software Labs</title>', false)
            ->assertSee('<link rel="canonical" data-rh="true" href="https://bytecode.test/work/customtailor" />', false)
            ->assertSee('<meta property="og:type" data-rh="true" content="article" />', false)
            ->assertSee('"@type":"CreativeWork"', false)
            ->assertSee('<script id="site-content" type="application/json">{"site":', false);

        $this->get('/')->assertOk()->assertSee('<title>Bytecode Software Labs | Web, E-commerce &amp; AI Automation</title>', false);
        $this->get('/services/e-commerce')->assertOk()->assertSee('"@type":"Service"', false);
        $this->get('/contact')->assertOk()->assertSee('<title>Contact | Bytecode Software Labs</title>', false);
    }

    public function test_unknown_pages_return_404_with_noindex(): void
    {
        $this->get('/nope')->assertNotFound()->assertSee('noindex, nofollow', false);
        $this->get('/work/nope')->assertNotFound();
        $this->get('/services/nope')->assertNotFound();
    }

    public function test_embedded_content_cannot_break_out_of_the_script_tag(): void
    {
        Setting::putGroup('site', [...Setting::group('site'), 'tagline' => '</script><script>alert(1)</script>']);

        $this->get('/')->assertOk()->assertDontSee('</script><script>alert(1)', false);
    }

    public function test_sitemap_and_robots_list_published_pages(): void
    {
        $this->get('/sitemap.xml')
            ->assertOk()
            ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
            ->assertSee('<loc>https://bytecode.test/work/customtailor</loc>', false)
            ->assertSee('<loc>https://bytecode.test/services/cloud</loc>', false);

        $this->get('/robots.txt')->assertOk()->assertSee('Sitemap: https://bytecode.test/sitemap.xml');
    }
}
