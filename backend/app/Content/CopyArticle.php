<?php

namespace App\Content;

use App\Models\Post;
use Illuminate\Support\Str;

/** The parts of a post offered by "Copy article" in the admin, built from the form as it is now. */
final class CopyArticle
{
    /**
     * @param  array<string, mixed>  $data  the edit form's state
     * @return array<string, mixed>
     */
    public static function from(array $data): array
    {
        $base = SiteContent::siteUrl();
        $title = trim(preg_replace('/\s+/', ' ', (string) ($data['title'] ?? '')));
        $excerpt = trim((string) ($data['excerpt'] ?? ''));
        $slug = Str::slug((string) (($data['slug'] ?? '') ?: $title));
        $html = self::absolute(PostBody::render($data['body'] ?? null)['html'], $base);
        $plain = trim(html_entity_decode(strip_tags(preg_replace('#</(p|h[1-6]|li|blockquote|pre|tr)>#i', "$0\n\n", $html) ?? $html)));

        return [
            'title' => $title,
            'seoTitle' => trim((string) ($data['seo_title'] ?? '')) ?: $title,
            'seoDescription' => trim((string) ($data['seo_description'] ?? '')) ?: Str::limit($excerpt, 157),
            'slug' => $slug,
            'url' => $slug !== '' ? "{$base}/blog/{$slug}" : '',
            'html' => $html,
            'plain' => preg_replace("/\n{3,}/", "\n\n", $plain) ?? $plain,
            'markdown' => HtmlToMarkdown::convert($html),
            'words' => str_word_count($plain),
        ];
    }

    public static function fromPost(Post $post): array
    {
        return self::from($post->only(['title', 'excerpt', 'slug', 'body', 'seo_title', 'seo_description']));
    }

    /** Pasted somewhere else, images and links need this site's full address. */
    private static function absolute(string $html, string $base): string
    {
        $html = preg_replace('#(\s(?:src|href)=")/(?!/)#', '$1'.$base.'/', $html) ?? $html;

        return preg_replace_callback(
            '#\ssrcset="([^"]*)"#',
            fn ($m) => ' srcset="'.preg_replace('#(^|,\s*)/(?!/)#', '$1'.$base.'/', $m[1]).'"',
            $html,
        ) ?? $html;
    }
}
