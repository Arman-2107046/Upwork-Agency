<?php

namespace Tests\Feature;

use App\Filament\Pages\ManageHome;
use App\Filament\Pages\ManageSite;
use App\Filament\Resources\ContactMessages\Pages\ViewContactMessage;
use App\Filament\Resources\Projects\Pages\CreateProject;
use App\Models\ContactMessage;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedContent();
        $this->actingAs(User::factory()->create());
    }

    public function test_guests_are_sent_to_the_login_page(): void
    {
        auth()->logout();

        $this->get('/admin')->assertRedirect('/admin/login');
    }

    public function test_every_admin_screen_loads(): void
    {
        $message = ContactMessage::query()->create(['name' => 'A', 'email' => 'a@example.com', 'message' => str_repeat('x', 30)]);

        foreach ([
            '/admin', '/admin/projects', '/admin/projects/create', '/admin/projects/1/edit',
            '/admin/services', '/admin/services/1/edit', '/admin/technology-groups', '/admin/technology-groups/1/edit',
            '/admin/pages/home', '/admin/pages/about', '/admin/settings/site', '/admin/settings/seo',
            '/admin/contact-messages', "/admin/contact-messages/{$message->id}", '/admin/users',
        ] as $url) {
            $this->get($url)->assertOk();
        }
    }

    public function test_site_settings_save_and_show_on_the_website(): void
    {
        Livewire::test(ManageSite::class)
            ->fillForm(['brand_name' => 'Kernel Labs', 'email' => 'hello@bytecode.test'])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->getJson('/api/content')
            ->assertJsonPath('site.brandName', 'Kernel Labs')
            ->assertJsonPath('site.email', 'hello@bytecode.test')
            ->assertJsonPath('site.handle', 'kernel@labs');
    }

    public function test_home_page_settings_keep_their_lists(): void
    {
        Livewire::test(ManageHome::class)
            ->fillForm(['hero_headline' => 'Software, shipped.'])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->getJson('/api/content')
            ->assertJsonPath('home.hero.headline', 'Software, shipped.')
            ->assertJsonCount(5, 'home.processSteps')
            ->assertJsonCount(5, 'home.showcase.stages')
            ->assertJsonPath('home.showcase.stages.0.image.src', '/storage/showcase/fabric.webp');
    }

    public function test_a_project_can_be_created(): void
    {
        Livewire::test(CreateProject::class)
            ->fillForm([
                'title' => 'New Store',
                'slug' => 'new-store',
                'category' => 'Online store',
                'overview' => 'A new store.',
                'scope' => ['Checkout'],
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        $this->assertTrue(Project::query()->where('slug', 'new-store')->exists());
        $this->getJson('/api/content')->assertJsonPath('projects.7.slug', 'new-store');
    }

    public function test_opening_a_message_marks_it_as_read(): void
    {
        $message = ContactMessage::query()->create(['name' => 'A', 'email' => 'a@example.com', 'message' => str_repeat('x', 30)]);

        Livewire::test(ViewContactMessage::class, ['record' => $message->getRouteKey()]);

        $this->assertNotNull($message->fresh()->read_at);
    }
}
