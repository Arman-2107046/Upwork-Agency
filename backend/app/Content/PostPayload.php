<?php

namespace App\Content;

use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Str;

/**
 * The Post shapes the website reads (frontend/src/content/types.ts): a summary for lists, which
 * ships with every page, and the full post with its body, which only the post page loads.
 */
final class PostPayload
{
    /** @return array<string, mixed> */
    public static function summary(Post $post): array
    {
        return array_filter([
            'slug' => $post->slug,
            'title' => $post->title,
            'excerpt' => $post->excerpt,
            'category' => $post->category,
            'categorySlug' => Str::slug($post->category),
            'tags' => array_values($post->tags ?? []),
            'cover' => ImageAsset::make($post->cover_image, $post->cover_alt ?: $post->title, $post->category),
            'publishedAt' => $post->published_at?->toIso8601String() ?? now()->toIso8601String(),
            'updatedAt' => $post->updated_at?->toIso8601String(),
            'readingMinutes' => $post->reading_minutes ?: 1,
            'featured' => $post->is_featured,
            'author' => $post->author ? self::author($post->author) : null,
        ], fn ($v) => $v !== null);
    }

    /** @return array<string, mixed> */
    public static function full(Post $post): array
    {
        return [
            ...self::summary($post),
            'html' => (string) $post->body_html,
            'toc' => array_values($post->toc ?? []),
            'seoTitle' => $post->seo_title ?: $post->title,
            'seoDescription' => $post->seo_description ?: Str::limit($post->excerpt, 157),
            'draft' => ! $post->isLive(),
        ];
    }

    /** A live post by slug, or with $includeDrafts any post (signed preview links). */
    public static function find(string $slug, bool $includeDrafts = false): ?Post
    {
        $query = Post::query()->with('author')->where('slug', $slug);

        return ($includeDrafts ? $query : $query->live())->first();
    }

    /** @return array<string, mixed> */
    private static function author(User $user): array
    {
        return array_filter([
            'name' => $user->name,
            'role' => $user->job_title ?: null,
            'bio' => $user->bio ?: null,
            'avatar' => $user->avatar ? ImageAsset::make($user->avatar, $user->name) : null,
        ], fn ($v) => $v !== null);
    }
}
