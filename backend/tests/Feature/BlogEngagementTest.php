<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\Category;
use App\Models\Post;
use App\Models\PostComment;
use App\Models\User;
use Database\Seeders\BlogDemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BlogEngagementTest extends TestCase
{
    use RefreshDatabase;

    private Post $post;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedContent();
        $this->post = $this->makePost();
    }

    private function makePost(array $attributes = []): Post
    {
        return Post::query()->create([
            'title' => 'Shipping a configurator',
            'slug' => 'shipping',
            'excerpt' => 'Lessons.',
            'body' => '<p>Text.</p>',
            'category_id' => Category::query()->firstOrCreate(['name' => 'Engineering'])->id,
            'is_published' => true,
            'published_at' => now()->subDay(),
            ...$attributes,
        ]);
    }

    public function test_a_view_is_counted_without_touching_the_post(): void
    {
        $updated = $this->post->updated_at;
        $this->travel(5)->minutes();

        $this->postJson('/api/posts/shipping/view')->assertOk()->assertJson(['views' => 1, 'likes' => 0, 'liked' => false, 'comments' => 0]);
        $this->postJson('/api/posts/shipping/view')->assertJson(['views' => 2]);

        $this->post->refresh();
        $this->assertSame(2, $this->post->views);
        $this->assertTrue($this->post->updated_at->equalTo($updated));
        $this->assertSame(0, Activity::query()->where('event', 'updated')->count());
    }

    public function test_each_reader_likes_a_post_once_and_can_take_it_back(): void
    {
        $first = $this->postJson('/api/posts/shipping/like')->assertOk()->assertJson(['liked' => true, 'likes' => 1]);
        $cookie = $first->getCookie('reader', false);
        $this->assertNotNull($cookie);
        $this->assertMatchesRegularExpression('/^reader:[A-Za-z0-9]{40}$/', $cookie->getValue());
        $this->assertTrue($cookie->isHttpOnly());

        // Another reader.
        $this->postJson('/api/posts/shipping/like')->assertJson(['liked' => true, 'likes' => 2]);

        // The first reader again: the view call knows their like, a second like takes it back.
        $this->withCredentials()->withUnencryptedCookie('reader', $cookie->getValue())->postJson('/api/posts/shipping/view')->assertJson(['liked' => true, 'likes' => 2]);
        $this->withCredentials()->withUnencryptedCookie('reader', $cookie->getValue())->postJson('/api/posts/shipping/like')->assertJson(['liked' => false, 'likes' => 1]);
    }

    public function test_a_comment_waits_for_approval_and_the_team_is_notified(): void
    {
        $editor = User::factory()->create(['role' => User::EDITOR]);
        $viewer = User::factory()->create(['role' => User::VIEWER]);

        $this->postJson('/api/posts/shipping/comments', ['name' => 'Ada', 'email' => 'ada@example.com', 'body' => "Great read.\r\nThanks!", 'website' => ''])
            ->assertCreated()
            ->assertJson(['comment_sent' => true]);

        $comment = PostComment::query()->sole();
        $this->assertSame(PostComment::PENDING, $comment->status);
        $this->assertSame("Great read.\nThanks!", $comment->body);
        $this->assertSame(1, DatabaseNotification::query()->where('notifiable_id', $editor->id)->count());
        $this->assertSame(0, DatabaseNotification::query()->where('notifiable_id', $viewer->id)->count());
        $this->assertStringContainsString('New comment to approve', DatabaseNotification::query()->first()->data['title']);

        $this->getJson('/api/posts/shipping')->assertJsonCount(0, 'comments');
        $comment->update(['status' => PostComment::APPROVED]);
        $this->getJson('/api/posts/shipping')
            ->assertJsonPath('comments.0.name', 'Ada')
            ->assertJsonPath('comments.0.body', "Great read.\nThanks!")
            ->assertJsonMissingPath('comments.0.email');
        $this->postJson('/api/posts/shipping/view')->assertJson(['comments' => 1]);
    }

    public function test_comments_are_validated_and_bots_are_ignored(): void
    {
        $this->postJson('/api/posts/shipping/comments', ['name' => '', 'email' => 'nope', 'body' => 'x'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'body']);

        $this->postJson('/api/posts/shipping/comments', ['name' => 'Bot', 'email' => 'bot@example.com', 'body' => 'Buy now', 'website' => 'https://spam.example'])
            ->assertCreated();
        $this->assertSame(0, PostComment::query()->count());
    }

    public function test_comments_are_rate_limited(): void
    {
        $comment = ['name' => 'Ada', 'email' => 'ada@example.com', 'body' => 'Nice post.'];
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/posts/shipping/comments', $comment)->assertCreated();
        }
        $this->postJson('/api/posts/shipping/comments', $comment)->assertTooManyRequests();
    }

    public function test_posts_that_are_not_live_take_no_views_likes_or_comments(): void
    {
        $this->makePost(['slug' => 'draft', 'is_published' => false]);
        $this->makePost(['slug' => 'later', 'published_at' => now()->addDay()]);

        foreach (['draft', 'later', 'missing'] as $slug) {
            $this->postJson("/api/posts/{$slug}/view")->assertNotFound();
            $this->postJson("/api/posts/{$slug}/like")->assertNotFound();
            $this->postJson("/api/posts/{$slug}/comments", ['name' => 'A', 'email' => 'a@example.com', 'body' => 'Hello'])->assertNotFound();
            $this->get("/blog/{$slug}/share.png")->assertNotFound();
        }
    }

    public function test_each_post_has_a_generated_share_image(): void
    {
        Storage::disk('public')->putFileAs('blog', UploadedFile::fake()->image('cover.png', 1600, 1000), 'cover.png');
        $this->post->update(['cover_image' => 'blog/cover.png']);

        $url = $this->getJson('/api/posts/shipping')->json('shareImage');
        $this->assertStringStartsWith('/blog/shipping/share.png?v=', $url);

        $response = $this->get($url)->assertOk()->assertHeader('Content-Type', 'image/png');
        [$width, $height] = getimagesizefromstring(file_get_contents($response->baseResponse->getFile()->getPathname()));
        $this->assertSame([1200, 630], [$width, $height]);

        // A new title is a new image at a new address.
        $this->post->update(['title' => 'A new title']);
        $this->assertNotSame($url, $this->getJson('/api/posts/shipping')->json('shareImage'));
    }

    public function test_without_a_cover_the_first_article_image_is_used(): void
    {
        Storage::disk('public')->putFileAs('blog', UploadedFile::fake()->image('inside.png', 1200, 800), 'inside.png');
        $this->post->update(['body' => '<p>Intro</p><img src="/storage/blog/inside.png" alt="Inside"><img src="/storage/blog/other.png">', 'cover_caption' => 'Photo: the team']);

        $this->getJson('/api/content')
            ->assertJsonPath('posts.0.cover.src', '/storage/blog/inside.png')
            ->assertJsonPath('posts.0.coverCaption', 'Photo: the team');

        $this->post->update(['body' => '<p>No images.</p>']);
        $this->getJson('/api/content')
            ->assertJsonMissingPath('posts.0.cover.src')
            ->assertJsonPath('posts.0.cover.placeholderLabel', 'Engineering');
    }

    public function test_addresses_used_by_the_blog_are_refused(): void
    {
        $this->expectExceptionMessage('used by the blog itself');
        $this->makePost(['slug' => 'category']);
    }

    public function test_the_demo_content_can_be_seeded_more_than_once(): void
    {
        $this->seed(BlogDemoSeeder::class);
        $this->seed(BlogDemoSeeder::class);

        $this->assertSame(11, Post::query()->count());
        $this->assertSame(6, Category::query()->count());
        $this->getJson('/api/content')->assertJsonCount(11, 'posts')->assertJsonCount(6, 'categories');
    }
}
