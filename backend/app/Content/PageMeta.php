<?php

namespace App\Content;

/**
 * Server-side head tags for a website path. Mirrors frontend/src/components/seo/Seo.tsx and
 * frontend/src/components/seo/jsonLd.ts so crawlers and link previews get the right tags before
 * JavaScript runs; react-helmet-async then takes over (tags carry data-rh="true").
 */
final class PageMeta
{
    /**
     * @param  array<string, mixed>  $content  SiteContent::get()
     * @param  array<string, mixed>|null  $post  PostPayload::full() of the post at /blog/{slug}, when there is one
     * @return array{status: int, title: string, description: string, path: string, type: string, noindex: bool, jsonLd: list<array<string, mixed>>, image: string|null, article: array<string, mixed>|null}
     */
    public static function for(string $path, array $content, ?array $post = null): array
    {
        $path = trim($path, '/');
        $pages = $content['pages'];
        $segments = $path === '' ? [] : explode('/', $path);

        $page = fn (string $key, string $route, array $jsonLd = []) => self::meta(
            $content, $pages[$key]['title'], $pages[$key]['description'], $route, jsonLd: $jsonLd,
        );

        return match (true) {
            $segments === [] => $page('home', '/'),
            $segments === ['services'] => $page('services', '/services', array_map(
                fn ($s) => self::serviceJsonLd($s, $content), $content['services'],
            )),
            $segments === ['work'] => $page('work', '/work'),
            $segments === ['blog'] => $page('blog', '/blog', [self::blogJsonLd($content)]),
            $segments === ['about'] => $page('about', '/about'),
            $segments === ['contact'] => $page('contact', '/contact'),
            count($segments) === 2 && $segments[0] === 'services' => self::service($segments[1], $content),
            count($segments) === 2 && $segments[0] === 'work' => self::project($segments[1], $content),
            count($segments) === 2 && $segments[0] === 'blog' && $post && $post['slug'] === $segments[1] => self::post($post, $content),
            default => self::notFound($content),
        };
    }

    /** @return array<string, mixed> */
    public static function organization(array $content): array
    {
        $site = $content['site'];

        return array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => $site['brandName'],
            'url' => $site['siteUrl'].'/',
            'logo' => $site['siteUrl'].'/apple-touch-icon.png',
            'description' => $site['description'],
            'email' => $site['email'] ?: null,
            'sameAs' => array_values(array_filter([$site['upworkUrl'], ...array_column($site['social'], 'href')])),
        ], fn ($v) => $v !== null);
    }

    private static function service(string $slug, array $content): array
    {
        $service = collect($content['services'])->firstWhere('slug', $slug);

        return $service
            ? self::meta($content, $service['title'], "{$service['summary']} {$service['outcome']}", "/services/{$slug}",
                jsonLd: [self::serviceJsonLd($service, $content)])
            : self::notFound($content);
    }

    private static function project(string $slug, array $content): array
    {
        $project = collect($content['projects'])->firstWhere('slug', $slug);
        if (! $project) {
            return self::notFound($content);
        }

        return self::meta($content, $project['title'], $project['overview'], "/work/{$slug}", type: 'article', jsonLd: [
            array_filter([
                '@context' => 'https://schema.org',
                '@type' => 'CreativeWork',
                'name' => $project['title'],
                'description' => $project['overview'],
                'url' => $content['site']['siteUrl']."/work/{$slug}",
                'sameAs' => $project['url'] ?? null,
                'keywords' => implode(', ', [...$project['scope'], ...$project['technologies']]),
                'creator' => self::provider($content),
            ], fn ($v) => $v !== null),
        ]);
    }

    /** @param array<string, mixed> $post */
    private static function post(array $post, array $content): array
    {
        $siteUrl = $content['site']['siteUrl'];
        $url = "{$siteUrl}/blog/{$post['slug']}";
        $image = isset($post['cover']['src']) ? $siteUrl.$post['cover']['src'] : null;

        $meta = self::meta($content, $post['seoTitle'], $post['seoDescription'], "/blog/{$post['slug']}",
            type: 'article', noindex: $post['draft'], jsonLd: [
                array_filter([
                    '@context' => 'https://schema.org',
                    '@type' => 'BlogPosting',
                    'headline' => $post['title'],
                    'description' => $post['excerpt'],
                    'url' => $url,
                    'mainEntityOfPage' => $url,
                    'image' => $image,
                    'datePublished' => $post['publishedAt'],
                    'dateModified' => $post['updatedAt'] ?? $post['publishedAt'],
                    'articleSection' => $post['category'],
                    'keywords' => $post['tags'] ? implode(', ', $post['tags']) : null,
                    'author' => isset($post['author'])
                        ? array_filter(['@type' => 'Person', 'name' => $post['author']['name'], 'jobTitle' => $post['author']['role'] ?? null])
                        : self::provider($content),
                    'publisher' => [...self::provider($content), 'logo' => ['@type' => 'ImageObject', 'url' => "{$siteUrl}/apple-touch-icon.png"]],
                ], fn ($v) => $v !== null),
            ]);

        return [
            ...$meta,
            'image' => $image,
            'article' => [
                'publishedTime' => $post['publishedAt'],
                'modifiedTime' => $post['updatedAt'] ?? $post['publishedAt'],
                'section' => $post['category'],
                'tags' => $post['tags'],
                'author' => $post['author']['name'] ?? null,
            ],
        ];
    }

    private static function blogJsonLd(array $content): array
    {
        $siteUrl = $content['site']['siteUrl'];

        return [
            '@context' => 'https://schema.org',
            '@type' => 'Blog',
            'name' => "{$content['site']['brandName']} Blog",
            'url' => "{$siteUrl}/blog",
            'publisher' => self::provider($content),
            'blogPost' => array_map(fn ($p) => [
                '@type' => 'BlogPosting',
                'headline' => $p['title'],
                'url' => "{$siteUrl}/blog/{$p['slug']}",
                'datePublished' => $p['publishedAt'],
            ], array_slice($content['posts'] ?? [], 0, 10)),
        ];
    }

    private static function notFound(array $content): array
    {
        return self::meta($content, 'Page not found', 'The page you are looking for does not exist or has moved.',
            '/404', noindex: true, status: 404);
    }

    private static function serviceJsonLd(array $service, array $content): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'Service',
            'name' => $service['title'],
            'serviceType' => $service['title'],
            'description' => $service['summary'],
            'url' => $content['site']['siteUrl']."/services/{$service['slug']}",
            'provider' => self::provider($content),
        ];
    }

    private static function provider(array $content): array
    {
        return ['@type' => 'Organization', 'name' => $content['site']['brandName'], 'url' => $content['site']['siteUrl'].'/'];
    }

    private static function meta(
        array $content,
        string $title,
        string $description,
        string $path,
        string $type = 'website',
        bool $noindex = false,
        array $jsonLd = [],
        int $status = 200,
    ): array {
        $brand = $content['site']['brandName'];

        return [
            'status' => $status,
            'title' => str_contains($title, $brand) ? $title : "{$title} | {$brand}",
            'description' => $description,
            'path' => $path,
            'type' => $type,
            'noindex' => $noindex,
            'jsonLd' => $jsonLd,
            'image' => null,
            'article' => null,
        ];
    }
}
