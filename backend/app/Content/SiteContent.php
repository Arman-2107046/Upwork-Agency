<?php

namespace App\Content;

use App\Models\Post;
use App\Models\Project;
use App\Models\Service;
use App\Models\Setting;
use App\Models\TechnologyGroup;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;

/**
 * Builds the content payload the React site reads (see frontend/src/content/types.ts).
 * Cached until any CMS record changes (models use the FlushesSiteContent trait), or until the
 * next scheduled blog post goes live.
 */
final class SiteContent
{
    public const CACHE_KEY = 'site-content:v1';

    /** @return array<string, mixed> */
    public static function get(): array
    {
        $content = Cache::get(self::CACHE_KEY);
        if (! is_array($content)) {
            $content = (new self)->build();
            $next = Post::nextScheduledAt();
            $next ? Cache::put(self::CACHE_KEY, $content, $next) : Cache::forever(self::CACHE_KEY, $content);
        }
        // Kept out of the cache so a domain change applies without a cache flush.
        $content['site']['siteUrl'] = self::siteUrl();

        return $content;
    }

    public static function flush(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /** APP_URL, or the address the site is being visited on when APP_URL is not set. */
    public static function siteUrl(): string
    {
        $url = rtrim((string) config('app.url'), '/');

        if (in_array($url, ['', 'http://localhost'], true) && (! app()->runningInConsole() || app()->runningUnitTests())) {
            return request()->getSchemeAndHttpHost();
        }

        return $url;
    }

    /**
     * A settings group with defaults for keys never saved. A key saved as empty stays empty
     * (clearing "Years of experience" hides that claim).
     *
     * @return array<string, mixed>
     */
    public static function settings(string $key): array
    {
        return array_replace(Defaults::group($key), Setting::group($key));
    }

    /** @return array<string, mixed> */
    public function build(): array
    {
        return $this->payload();
    }

    /** @return array<string, mixed> */
    private function payload(): array
    {
        $site = self::settings('site');
        $home = self::settings('home');
        $about = self::settings('about');
        $pages = array_replace_recursive(Defaults::group('pages'), Setting::group('pages'));

        $years = trim((string) ($site['years_experience'] ?? ''));
        $upworkBadge = (bool) ($site['upwork_badge'] ?? false);

        $projects = Project::query()->published()->get();
        $publishedSlugs = $projects->pluck('slug')->all();

        return [
            'site' => [
                'brandName' => $site['brand_name'],
                'shortName' => $site['short_name'],
                'handle' => $site['handle'],
                'tagline' => $site['tagline'],
                'description' => $site['description'],
                'siteUrl' => self::siteUrl(),
                'email' => (string) ($site['email'] ?? ''),
                'upworkUrl' => (string) ($site['upwork_url'] ?? ''),
                'social' => self::pairs($site['social'] ?? [], ['label', 'href']),
                'responseTime' => (string) $site['response_time'],
                'claims' => [
                    'yearsExperience' => $years !== '' ? $years : false,
                    'upworkBadge' => $upworkBadge,
                ],
                'themeColor' => ($site['theme_color'] ?? null) ?: '#FFFFFF',
            ],
            'pages' => Arr::map(
                Arr::only($pages, ['home', 'services', 'work', 'blog', 'about', 'contact']),
                fn ($p) => ['title' => (string) ($p['title'] ?? ''), 'description' => (string) ($p['description'] ?? '')],
            ),
            'home' => [
                'hero' => [
                    'eyebrow' => $home['hero_eyebrow'],
                    'headline' => $home['hero_headline'],
                    'sub' => $home['hero_sub'],
                ],
                'heroTech' => array_values($home['hero_tech'] ?? []),
                'intro' => $home['intro'],
                'finalCta' => $home['final_cta'],
                'processSteps' => self::pairs($home['process_steps'] ?? [], ['title', 'text']),
                'whyItems' => collect($home['why_items'] ?? [])
                    ->reject(fn ($item) => match ($item['claim'] ?? null) {
                        'upwork_badge' => ! $upworkBadge,
                        'years_experience' => $years === '',
                        default => false,
                    })
                    ->pluck('text')
                    ->filter()
                    ->values()
                    ->all(),
                'showcase' => $this->showcase($home['showcase'] ?? [], $publishedSlugs),
            ],
            'about' => [
                'statement' => $about['statement'],
                'closingLine' => $about['closing_line'],
                'howWeWork' => self::pairs($about['how_we_work'] ?? [], ['title', 'text']),
                'teamRoles' => self::pairs($about['team_roles'] ?? [], ['title', 'text']),
            ],
            'projects' => $projects->map(fn (Project $p) => array_filter([
                ...$this->projectMedia($p),
                'slug' => $p->slug,
                'title' => $p->title,
                'url' => $p->url ?: null,
                'overview' => $p->overview,
                'category' => $p->category,
                'scope' => array_values($p->scope ?? []),
                'technologies' => array_values($p->technologies ?? []),
                'featured' => $p->is_featured,
            ], fn ($v) => $v !== null))->values()->all(),
            'services' => Service::query()->published()->with('exampleProject')->get()
                ->map(fn (Service $s) => array_filter([
                    'slug' => $s->slug,
                    'title' => $s->title,
                    'summary' => $s->summary,
                    'bullets' => array_values($s->bullets ?? []),
                    'outcome' => $s->outcome,
                    'icon' => $s->icon,
                    'stackGroups' => array_values($s->stack_groups ?? []),
                    'example' => $s->example_image ? array_filter([
                        'image' => ImageAsset::make($s->example_image, $s->example_alt ?: $s->title),
                        'projectSlug' => in_array($s->exampleProject?->slug, $publishedSlugs, true)
                            ? $s->exampleProject->slug
                            : null,
                    ], fn ($v) => $v !== null) : null,
                ], fn ($v) => $v !== null))->values()->all(),
            ...$this->technologies(),
            ...$this->blog(),
        ];
    }

    /** @return array{posts: list<array<string, mixed>>, categories: list<array<string, mixed>>} */
    private function blog(): array
    {
        $posts = Post::query()->live()->with(['author', 'category'])->get();

        return [
            'posts' => $posts->map(fn (Post $post) => PostPayload::summary($post))->values()->all(),
            'categories' => PostPayload::categories($posts),
        ];
    }

    /** @return array<string, mixed> cover, gallery and video of a project */
    private function projectMedia(Project $p): array
    {
        $cover = ImageAsset::make($p->cover_image, $p->cover_alt ?: $p->title, $p->title);

        return [
            'cover' => $cover,
            'gallery' => collect($p->gallery ?? [])
                ->map(fn ($g) => ImageAsset::make($g['image'] ?? null, $g['alt'] ?? $p->title))
                ->values()
                ->all(),
            'video' => VideoAsset::make($p->video, "{$p->title} walkthrough", $cover),
        ];
    }

    /**
     * @param  array<string, mixed>  $showcase
     * @param  list<string>  $publishedSlugs
     * @return array<string, mixed>
     */
    private function showcase(array $showcase, array $publishedSlugs): array
    {
        $slug = $showcase['project_slug'] ?? null;

        return [
            'projectSlug' => in_array($slug, $publishedSlugs, true) ? $slug : ($publishedSlugs[0] ?? ''),
            'eyebrow' => (string) ($showcase['eyebrow'] ?? ''),
            'title' => (string) ($showcase['title'] ?? ''),
            'intro' => (string) ($showcase['intro'] ?? ''),
            'stages' => collect($showcase['stages'] ?? [])->map(fn ($s) => [
                'title' => (string) ($s['title'] ?? ''),
                'text' => (string) ($s['text'] ?? ''),
                'image' => ImageAsset::make($s['image'] ?? null, $s['alt'] ?? ($s['title'] ?? ''), $s['title'] ?? null),
                'sketch' => $s['sketch'] ?? 'preview',
            ])->values()->all(),
        ];
    }

    /** @return array{technologyGroups: list<array<string, mixed>>, sliderRows: list<array<string, mixed>>} */
    private function technologies(): array
    {
        $groups = TechnologyGroup::query()->orderBy('sort')->orderBy('id')->get();

        return [
            'technologyGroups' => $groups->map(fn (TechnologyGroup $g) => [
                'label' => $g->label,
                'items' => array_values($g->items ?? []),
            ])->values()->all(),
            'sliderRows' => collect(TechnologyGroup::SLIDER_ROWS)
                ->map(fn (string $label, int $row) => [
                    'label' => $label,
                    'items' => $groups->where('slider_row', $row)->flatMap(fn ($g) => $g->items ?? [])->values()->all(),
                ])
                ->filter(fn ($row) => $row['items'] !== [])
                ->values()
                ->all(),
        ];
    }

    /**
     * Keeps only the given keys of each repeater row, dropping rows whose values are all empty.
     *
     * @param  array<int, mixed>  $rows
     * @param  list<string>  $keys
     * @return list<array<string, string>>
     */
    private static function pairs(array $rows, array $keys): array
    {
        return collect($rows)
            ->map(fn ($row) => collect($keys)->mapWithKeys(fn ($k) => [$k => trim((string) ($row[$k] ?? ''))])->all())
            ->filter(fn ($row) => implode('', $row) !== '')
            ->values()
            ->all();
    }
}
