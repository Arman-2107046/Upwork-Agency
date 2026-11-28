<?php

namespace Tests\Feature;

use App\Filament\Resources\Categories\Pages\ManageCategories;
use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Livewire\Livewire;
use Tests\TestCase;

class BlogCategoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedContent();
    }

    private function makePost(Category $category, string $slug, array $attributes = []): Post
    {
        return Post::query()->create([
            'title' => ucfirst(str_replace('-', ' ', $slug)),
            'slug' => $slug,
            'excerpt' => 'A summary.',
            'body' => '<p>Text.</p>',
            'category_id' => $category->id,
            'is_published' => true,
            'published_at' => now()->subDay(),
            ...$attributes,
        ]);
    }

    public function test_a_category_gets_an_address_and_a_place_at_the_end_of_the_list(): void
    {
        $first = Category::query()->create(['name' => 'Engineering']);
        $second = Category::query()->create(['name' => 'Product & Design']);
        $clash = Category::query()->create(['name' => 'Engineering!']);

        $this->assertSame('engineering', $first->slug);
        $this->assertSame('product-design', $second->slug);
        $this->assertSame('engineering-2', $clash->slug);
        $this->assertGreaterThan($first->sort, $second->sort);
    }

    public function test_the_website_lists_categories_with_live_posts_in_the_admin_order(): void
    {
        $news = Category::query()->create(['name' => 'News', 'sort' => 2]);
        $engineering = Category::query()->create(['name' => 'Engineering', 'description' => 'How we build.', 'sort' => 1]);
        $empty = Category::query()->create(['name' => 'Empty', 'sort' => 0]);
        $this->makePost($news, 'launch');
        $this->makePost($engineering, 'configurator');
        $this->makePost($engineering, 'caching');
        $this->makePost($empty, 'draft', ['is_published' => false]);

        $this->getJson('/api/content')
            ->assertJsonCount(2, 'categories')
            ->assertJsonPath('categories.0', ['slug' => 'engineering', 'name' => 'Engineering', 'description' => 'How we build.', 'count' => 2])
            ->assertJsonPath('categories.1.slug', 'news')
            ->assertJsonPath('posts.0.category', 'Engineering');

        // Renaming a category updates every post on the website.
        $engineering->update(['name' => 'Build notes']);
        $this->getJson('/api/content')->assertJsonPath('posts.0.category', 'Build notes');
    }

    public function test_a_category_page_has_its_own_meta_and_is_in_the_sitemap(): void
    {
        $category = Category::query()->create(['name' => 'Engineering', 'description' => 'How we build software.']);
        $this->makePost($category, 'configurator');
        Category::query()->create(['name' => 'Empty']);

        $this->get('/blog/category/engineering')
            ->assertOk()
            ->assertSee('<title>Engineering articles | Kernel Cloud Labs</title>', false)
            ->assertSee('<meta name="description" data-rh="true" content="How we build software." />', false)
            ->assertSee('<link rel="canonical" data-rh="true" href="https://bytecode.test/blog/category/engineering" />', false)
            ->assertSee('"@type":"CollectionPage"', false)
            ->assertSee('"@type":"BreadcrumbList"', false);

        $category->update(['seo_title' => 'Software engineering notes']);
        $this->get('/blog/category/engineering')->assertSee('<title>Software engineering notes | Kernel Cloud Labs</title>', false);

        $this->get('/blog/category/empty')->assertNotFound();
        $this->get('/blog/category/nope')->assertNotFound();

        $this->get('/sitemap.xml')
            ->assertSee('<loc>https://bytecode.test/blog/category/engineering</loc>', false)
            ->assertDontSee('/blog/category/empty', false);
    }

    public function test_a_category_with_posts_cannot_be_deleted(): void
    {
        $category = Category::query()->create(['name' => 'Engineering']);
        $this->makePost($category, 'configurator');

        $this->expectException(QueryException::class);
        $category->delete();
    }

    public function test_categories_are_managed_in_the_admin(): void
    {
        $this->actingAs(User::factory()->create());
        $used = Category::query()->create(['name' => 'Engineering']);
        $this->makePost($used, 'configurator');
        $unused = Category::query()->create(['name' => 'Old']);

        Livewire::test(ManageCategories::class)
            ->assertCanSeeTableRecords([$used, $unused])
            ->assertTableActionDisabled('delete', $used)
            ->assertTableActionEnabled('delete', $unused)
            ->callAction('create', ['name' => 'Case studies', 'slug' => 'case-studies', 'description' => 'Projects, start to finish.'])
            ->assertHasNoActionErrors();

        $this->assertDatabaseHas('categories', ['slug' => 'case-studies', 'description' => 'Projects, start to finish.']);
    }

    public function test_existing_post_categories_move_to_category_records(): void
    {
        Post::query()->delete();
        Category::query()->delete();
        $migration = ['--path' => 'database/migrations/2026_11_28_000006_create_categories_table.php'];
        Artisan::call('migrate:rollback', $migration);

        $row = fn (string $slug, string $category) => [
            'slug' => $slug, 'title' => $slug, 'excerpt' => 'x', 'category' => $category,
            'is_published' => true, 'created_at' => now(), 'updated_at' => now(),
        ];
        DB::table('posts')->insert([$row('a', 'Engineering'), $row('b', 'engineering '), $row('c', 'News')]);

        Artisan::call('migrate', $migration);

        $this->assertSame(['Engineering', 'News'], Category::query()->ordered()->pluck('name')->all());
        $engineering = Category::query()->where('slug', 'engineering')->firstOrFail();
        $this->assertSame(2, $engineering->posts()->count());
        $this->assertSame('news', Post::query()->where('slug', 'c')->firstOrFail()->category->slug);
    }
}
