<?php

namespace Tests\Feature;

use App\Content\CopyArticle;
use App\Filament\Pages\ManageSite;
use App\Filament\Resources\Categories\Pages\ManageCategories;
use App\Filament\Resources\PostComments\Pages\ListPostComments;
use App\Filament\Resources\Posts\Pages\EditPost;
use App\Filament\Resources\Posts\Pages\ListPosts;
use App\Models\Activity;
use App\Models\Category;
use App\Models\Post;
use App\Models\PostComment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class AdminRolesTest extends TestCase
{
    use RefreshDatabase;

    private Post $post;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedContent();
        $this->post = Post::query()->create([
            'title' => 'Shipping a configurator',
            'slug' => 'shipping',
            'excerpt' => 'Lessons.',
            'body' => '<h2>Why</h2><p>It <strong>sells</strong>. See <a href="/work">our work</a>.</p><ul><li>One</li><li>Two</li></ul>',
            'category_id' => Category::query()->create(['name' => 'Engineering'])->id,
            'is_published' => false,
        ]);
    }

    private function as(string $role): User
    {
        $user = User::factory()->create(['role' => $role]);
        $this->actingAs($user);

        return $user;
    }

    public function test_a_viewer_opens_every_screen_but_changes_nothing(): void
    {
        $this->as(User::VIEWER);

        foreach (['/admin', '/admin/posts', '/admin/posts/shipping', '/admin/categories', '/admin/comments', '/admin/activity', '/admin/projects', '/admin/users', '/admin/settings/site'] as $url) {
            $this->get($url)->assertOk();
        }
        $this->get('/admin/posts/shipping/edit')->assertForbidden();
        $this->get('/admin/posts/create')->assertForbidden();

        Livewire::test(ListPosts::class)
            ->assertActionHidden('create')
            ->assertTableActionHidden('edit', $this->post)
            ->assertTableActionHidden('delete', $this->post);
        Livewire::test(ManageSite::class)->call('save')->assertForbidden();
    }

    public function test_editors_write_and_moderate_but_only_admins_delete_categories_and_manage_users(): void
    {
        $editor = $this->as(User::EDITOR);
        $unused = Category::query()->create(['name' => 'Old']);

        $this->get('/admin/posts/shipping/edit')->assertOk();
        $this->get('/admin/users/create')->assertForbidden();
        Livewire::test(ManageCategories::class)->assertTableActionHidden('delete', $unused);

        $this->actingAs(User::factory()->create(['role' => User::ADMIN]));
        Livewire::test(ManageCategories::class)->assertTableActionVisible('delete', $unused);
        $this->get('/admin/users/'.$editor->id.'/edit')->assertOk();
    }

    public function test_comments_are_approved_or_hidden_from_the_queue(): void
    {
        $this->as(User::EDITOR);
        $this->post->update(['is_published' => true]);
        $comment = $this->post->comments()->create(['name' => 'Ada', 'email' => 'ada@example.com', 'body' => 'Nice.']);

        Livewire::test(ListPostComments::class)
            ->assertCanSeeTableRecords([$comment])
            ->callTableAction('approve', $comment);
        $this->assertSame(PostComment::APPROVED, $comment->refresh()->status);

        // Approved comments leave the default (pending) view.
        Livewire::test(ListPostComments::class)->assertCanNotSeeTableRecords([$comment]);
        $this->assertSame(1, Activity::query()->where('subject_type', 'PostComment')->count());
    }

    public function test_changes_are_logged_with_who_and_which_fields(): void
    {
        $user = $this->as(User::EDITOR);

        $this->post->update(['title' => 'A better title', 'body' => '<p>New text.</p>']);

        $entry = Activity::query()->where('event', 'updated')->latest('id')->firstOrFail();
        $this->assertSame($user->id, $entry->user_id);
        $this->assertSame('Post', $entry->subject_type);
        $this->assertSame(['from' => 'Shipping a configurator', 'to' => 'A better title'], $entry->changes['title']);
        $this->assertSame(['changed' => true], $entry->changes['body']);
        $this->get('/admin/activity')->assertOk()->assertSee('A better title');
    }

    public function test_bulk_publish_and_export(): void
    {
        $this->as(User::EDITOR);

        Livewire::test(ListPosts::class)->callTableBulkAction('publish', [$this->post]);
        $this->assertTrue($this->post->refresh()->isLive());

        Livewire::test(ListPosts::class)
            ->callAction('export', ['format' => 'csv'])
            ->assertFileDownloaded('blog-posts-'.now()->format('Y-m-d').'.csv');
    }

    public function test_copy_article_gives_html_markdown_and_the_public_url(): void
    {
        $copy = CopyArticle::fromPost($this->post);

        $this->assertSame('https://bytecode.test/blog/shipping', $copy['url']);
        $this->assertStringContainsString('<a href="https://bytecode.test/work">our work</a>', $copy['html']);
        $this->assertStringContainsString("## Why\n\nIt **sells**. See [our work](https://bytecode.test/work).\n\n- One\n- Two", $copy['markdown']);
        $this->assertSame('Shipping a configurator', $copy['seoTitle']);

        $this->as(User::EDITOR);
        Livewire::test(EditPost::class, ['record' => 'shipping'])
            ->fillForm(['title' => 'Unsaved title'])
            ->mountAction('copyArticle')
            ->assertSee('Unsaved title');
    }

    public function test_signed_in_staff_get_edit_links_on_the_blog_and_readers_do_not(): void
    {
        $this->post->update(['is_published' => true]);

        $this->get('/blog/shipping')->assertOk()->assertDontSee('staff-content', false);

        $this->as(User::EDITOR);
        $this->get('/blog/shipping')->assertSee('<script id="staff-content" type="application/json">{"access":"edit","editUrl":"/admin/posts/{slug}/edit"}</script>', false);

        $this->as(User::VIEWER);
        $this->get('/blog')->assertSee('{"access":"view","editUrl":"/admin/posts/{slug}"}', false);
    }
}
