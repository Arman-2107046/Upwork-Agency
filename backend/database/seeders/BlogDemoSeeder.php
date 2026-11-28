<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Post;
use App\Models\PostComment;
use App\Models\PostLike;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Sample blog content for trying the blog locally: 10 posts in 6 categories, with tables, pull
 * quotes, FAQs, approved comments and likes. Not run on deploy. Safe to re-run (matched by slug):
 *   php artisan db:seed --class=BlogDemoSeeder
 */
class BlogDemoSeeder extends Seeder
{
    private const CATEGORIES = [
        'Engineering' => 'How we build fast, reliable web platforms: architecture, performance and the decisions behind them.',
        'E-commerce' => 'Stores, checkouts and product configurators that turn visitors into customers.',
        'Automation' => 'Workflows, integrations and AI assistants that take repetitive work off your team.',
        'Design' => 'Interfaces, brand systems and the details that make a product feel premium.',
        'Case studies' => 'Client projects from first brief to launch, with the numbers that mattered.',
        'Company' => 'News and notes from the team.',
    ];

    private const POSTS = [
        ['Shipping a live 3D product configurator', 'Engineering', true],
        ['Why your checkout loses a third of its buyers', 'E-commerce', false],
        ['Caching a Laravel CMS without stale pages', 'Engineering', false],
        ['From brief to launch: a tailoring platform', 'Case studies', false],
        ['Automating order emails without losing the personal touch', 'Automation', false],
        ['Product pages that answer every question', 'E-commerce', false],
        ['Image pipelines that keep phones fast', 'Engineering', false],
        ['A design system for a small team', 'Design', false],
        ['Connecting a CRM to your website in an afternoon', 'Automation', false],
        ['What we learned from our first hundred projects', 'Company', false],
    ];

    public function run(): void
    {
        $author = User::query()->orderBy('id')->first() ?? User::factory()->create(['name' => 'Demo Author']);
        $author->forceFill([
            'job_title' => $author->job_title ?: 'Founder & Lead Engineer',
            'bio' => $author->bio ?: 'Builds web platforms, online stores and product configurators for clients around the world.',
        ])->save();

        $categories = [];
        foreach (array_keys(self::CATEGORIES) as $sort => $name) {
            $categories[$name] = Category::query()->updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'description' => self::CATEGORIES[$name], 'sort' => $sort],
            );
        }

        foreach (self::POSTS as $i => [$title, $category, $featured]) {
            $post = Post::query()->updateOrCreate(['slug' => Str::slug($title)], [
                'title' => $title,
                'excerpt' => 'What we tried, what worked, and the details that made the difference for the client.',
                'body' => $this->body($title),
                'category_id' => $categories[$category]->id,
                'tags' => array_slice(['Laravel', 'React', 'Performance', 'UX', 'Conversion', 'Three.js'], $i % 4, 2),
                'author_id' => $author->id,
                'is_published' => true,
                'is_featured' => $featured,
                'published_at' => now()->subDays($i * 4 + 1)->setTime(9, 0),
            ]);
            $post->forceFill(['views' => 120 + $i * 37])->saveQuietly();

            if ($post->comments()->count() === 0) {
                foreach (array_slice([['Maya Chen', 'Really clear write-up. The section on caching saved me a weekend.'], ['Tom Becker', "Great read.\nWould love a follow-up on the deployment side."]], 0, $i % 3) as [$name, $body]) {
                    $post->comments()->create(['name' => $name, 'email' => Str::slug($name).'@example.com', 'body' => $body, 'status' => PostComment::APPROVED]);
                }
            }
            for ($n = PostLike::query()->where('post_id', $post->id)->count(); $n < 3 + $i; $n++) {
                PostLike::query()->create(['post_id' => $post->id, 'token' => 'reader:'.Str::random(40)]);
            }
        }
    }

    private function body(string $title): string
    {
        return <<<HTML
<p class="lead">{$title}: the short version is that small, careful decisions add up. Here is what we did and why.</p>
<h2>The problem</h2>
<p>Most projects start with a clear goal and a fuzzy path. We spent the first week measuring before changing anything, so every later decision had a number behind it.</p>
<blockquote><p>Measure first. The slowest part of a page is rarely the part you expect.</p></blockquote>
<h2>What we changed</h2>
<p>We worked in short loops: one change, one measurement, one decision. The table shows the before and after.</p>
<table><tbody><tr><th><p>Metric</p></th><th><p>Before</p></th><th><p>After</p></th></tr><tr><td><p>Largest contentful paint</p></td><td><p>3.8 s</p></td><td><p>1.4 s</p></td></tr><tr><td><p>Checkout completion</p></td><td><p>58%</p></td><td><p>71%</p></td></tr><tr><td><p>Support emails per week</p></td><td><p>40</p></td><td><p>12</p></td></tr></tbody></table>
<h3>The details that mattered</h3>
<ul><li><p>Images sized for the screen they are shown on.</p></li><li><p>One clear call to action per page.</p></li><li><p>Errors that say what to do next.</p></li></ul>
<h2>Frequently asked questions</h2>
<details><summary>How long did it take?</summary><p>About six weeks from the first call to launch, including two rounds of testing with real customers.</p></details>
<details><summary>Can this work for a smaller store?</summary><p>Yes. Most of these changes cost little and pay off at any size.</p></details>
<h2>What we would do again</h2>
<p>Start with measurement, keep the scope small, and ship something real every week. <a href="/contact">Tell us about your project</a> if you want the same for yours.</p>
HTML;
    }
}
