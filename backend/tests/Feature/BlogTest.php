<?php

namespace Tests\Feature;

use App\Content\PostBody;
use App\Filament\Resources\Posts\Pages\CreatePost;
use App\Filament\Resources\Posts\PostResource;
use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;
use Tests\TestCase;

class BlogTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedContent();
    }

    /** @param array<string, mixed> $attributes `category` is a category name */
    private function makePost(array $attributes = []): Post
    {
        $category = Category::query()->firstOrCreate(['name' => $attributes['category'] ?? 'Engineering']);
        unset($attributes['category']);

        return Post::query()->create([
            'title' => 'Shipping a product configurator',
            'slug' => 'shipping-a-configurator',
            'excerpt' => 'What we learned building a live 3D configurator.',
            'body' => '<h2>Why it matters</h2><p>'.str_repeat('word ', 450).'</p><h3>Details</h3><p>More.</p>',
            'category_id' => $category->id,
            'tags' => ['Three.js', 'E-commerce'],
            'is_published' => true,
            'published_at' => now()->subDay(),
            ...$attributes,
        ]);
    }

    public function test_the_body_gets_heading_anchors_a_table_of_contents_and_a_reading_time(): void
    {
        $post = $this->makePost();

        $this->assertStringContainsString('<h2 id="why-it-matters">Why it matters</h2>', $post->body_html);
        $this->assertSame([
            ['id' => 'why-it-matters', 'text' => 'Why it matters', 'level' => 2],
            ['id' => 'details', 'text' => 'Details', 'level' => 3],
        ], $post->toc);
        $this->assertSame(3, $post->reading_minutes);
    }

    public function test_the_body_is_sanitized_and_external_links_open_safely(): void
    {
        $rendered = PostBody::render(
            '<p onclick="alert(1)">Hi <a href="https://example.com">out</a> <a href="/work">in</a></p>'
            .'<script>alert(1)</script><h2>Same</h2><h2>Same</h2><table><tr><td>1</td></tr></table>'
        );

        $this->assertStringNotContainsString('onclick', $rendered['html']);
        $this->assertStringNotContainsString('<script', $rendered['html']);
        $this->assertStringContainsString('href="https://example.com" target="_blank" rel="noopener noreferrer"', $rendered['html']);
        $this->assertStringContainsString('<a href="/work">in</a>', $rendered['html']);
        $this->assertStringContainsString('id="same-2"', $rendered['html']);
        $this->assertStringContainsString('<div class="table-wrap"><table>', $rendered['html']);
    }

    public function test_images_in_the_body_are_served_from_the_server_with_a_small_screen_variant(): void
    {
        Storage::disk('public')->putFileAs('blog', UploadedFile::fake()->image('shot.png', 1600, 1000), 'shot.png');

        $rendered = PostBody::render('<p>Look:</p><img data-id="blog/shot.png" src="http://localhost/storage/blog/shot.png" alt="A screenshot">');

        $this->assertStringContainsString('src="/storage/blog/shot.png"', $rendered['html']);
        $this->assertStringContainsString('srcset="/storage/blog/shot-800.webp 800w, /storage/blog/shot.png 1600w"', $rendered['html']);
        $this->assertStringContainsString('width="1600" height="1000"', $rendered['html']);
        $this->assertStringContainsString('loading="lazy"', $rendered['html']);
    }

    public function test_only_live_posts_reach_the_website(): void
    {
        $author = User::factory()->create(['name' => 'Arman', 'job_title' => 'Founder']);
        $this->makePost(['author_id' => $author->id]);
        $this->makePost(['slug' => 'draft', 'is_published' => false]);
        $this->makePost(['slug' => 'later', 'published_at' => now()->addDay()]);

        $this->getJson('/api/content')
            ->assertJsonCount(1, 'posts')
            ->assertJsonPath('posts.0.slug', 'shipping-a-configurator')
            ->assertJsonPath('posts.0.categorySlug', 'engineering')
            ->assertJsonPath('posts.0.readingMinutes', 3)
            ->assertJsonPath('posts.0.author.name', 'Arman')
            ->assertJsonPath('posts.0.author.role', 'Founder')
            ->assertJsonMissingPath('posts.0.html');

        $this->getJson('/api/posts/shipping-a-configurator')
            ->assertOk()
            ->assertJsonPath('toc.0.id', 'why-it-matters')
            ->assertJsonPath('draft', false);
        $this->getJson('/api/posts/draft')->assertNotFound();
        $this->getJson('/api/posts/later')->assertNotFound();
        $this->get('/blog/draft')->assertNotFound();
    }

    public function test_a_scheduled_post_goes_live_on_its_date_without_a_save(): void
    {
        $this->makePost(['slug' => 'later', 'published_at' => now()->addHour()]);
        $this->getJson('/api/content')->assertJsonCount(0, 'posts');

        $this->travel(61)->minutes();

        $this->getJson('/api/content')->assertJsonCount(1, 'posts');
    }

    public function test_post_pages_get_article_meta_and_the_post_in_the_html(): void
    {
        Storage::disk('public')->putFileAs('blog', UploadedFile::fake()->image('cover.png', 1600, 1000), 'cover.png');
        $this->makePost(['cover_image' => 'blog/cover.png', 'seo_title' => 'Configurators that sell']);

        $this->get('/blog/shipping-a-configurator')
            ->assertOk()
            ->assertSee('<title>Configurators that sell | Kernel Cloud Labs</title>', false)
            ->assertSee('<meta property="og:type" data-rh="true" content="article" />', false)
            ->assertSee('<meta property="og:image" data-rh="true" content="https://bytecode.test/blog/shipping-a-configurator/share.png?v=', false)
            ->assertSee('<meta property="og:image:width" data-rh="true" content="1200" />', false)
            ->assertSee('<meta property="article:tag" data-rh="true" content="Three.js" />', false)
            ->assertSee('"@type":"BlogPosting"', false)
            ->assertSee('<script id="post-content" type="application/json">', false);

        $this->get('/blog')->assertOk()->assertSee('<title>Blog | Kernel Cloud Labs</title>', false)->assertSee('"@type":"Blog"', false);
        $this->get('/blog/nope')->assertNotFound();
    }

    public function test_drafts_open_with_a_signed_preview_link_only(): void
    {
        $draft = $this->makePost(['slug' => 'draft', 'is_published' => false]);

        $this->get('/blog/draft')->assertNotFound();
        $this->get(PostResource::websiteUrl($draft))
            ->assertOk()
            ->assertSee('noindex, nofollow', false)
            ->assertSee('"draft":true', false);
    }

    public function test_sitemap_and_feed_list_live_posts(): void
    {
        $this->makePost();
        $this->makePost(['slug' => 'draft', 'is_published' => false]);

        $this->get('/sitemap.xml')
            ->assertSee('<loc>https://bytecode.test/blog</loc>', false)
            ->assertSee('<loc>https://bytecode.test/blog/shipping-a-configurator</loc>', false)
            ->assertDontSee('/blog/draft', false);

        $this->get('/blog/rss.xml')
            ->assertOk()
            ->assertHeader('Content-Type', 'application/rss+xml; charset=UTF-8')
            ->assertSee('<title>Shipping a product configurator</title>', false)
            ->assertSee('<category>Engineering</category>', false)
            ->assertDontSee('/blog/draft', false);
    }

    public function test_posts_are_written_in_the_admin(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        foreach (['/admin/posts', '/admin/posts/create', '/admin/categories', '/admin/users/'.$user->id.'/edit'] as $url) {
            $this->get($url)->assertOk();
        }

        Livewire::test(CreatePost::class)
            ->fillForm([
                'title' => 'Hello world',
                'slug' => 'hello-world',
                'excerpt' => 'A first post.',
                'body' => '<h2>Intro</h2><p>Text.</p>',
                'category_id' => Category::query()->create(['name' => 'News'])->id,
                'is_published' => true,
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        $post = Post::query()->where('slug', 'hello-world')->firstOrFail();
        $this->assertSame($user->id, $post->author_id);
        $this->assertTrue($post->isLive());
        $this->get("/admin/posts/{$post->slug}/edit")->assertOk();
        $this->getJson('/api/content')->assertJsonPath('posts.0.title', 'Hello world');
    }
}
