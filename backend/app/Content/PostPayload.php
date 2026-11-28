<?php

namespace App\Content;

use App\Models\Category;
use App\Models\Post;
use App\Models\PostComment;
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
            'category' => $post->category?->name ?? 'Articles',
            'categorySlug' => $post->category?->slug ?? '',
            'tags' => array_values($post->tags ?? []),
            'cover' => self::cover($post),
            'coverCaption' => $post->cover_caption ?: null,
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
            'shareImage' => ShareImage::url($post),
            'draft' => ! $post->isLive(),
            'comments' => $post->comments()->approved()->oldest()->get()
                ->map(fn (PostComment $c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'body' => $c->body,
                    'date' => $c->created_at?->toIso8601String(),
                ])
                ->values()
                ->all(),
        ];
    }

    /**
     * The uploaded cover, else the first image in the article, else nothing (the website then
     * draws a branded placeholder with the category and title).
     *
     * @return array<string, mixed>
     */
    public static function cover(Post $post): array
    {
        $alt = $post->cover_alt ?: $post->title;
        if ($post->cover_image || ! ($src = $post->firstBodyImage())) {
            return ImageAsset::make($post->cover_image, $alt, $post->category?->name);
        }
        if (str_starts_with($src, '/storage/')) {
            return ImageAsset::make(rawurldecode(substr(strtok($src, '?'), strlen('/storage/'))), $alt, $post->category?->name);
        }

        return ['src' => $src, 'alt' => $alt, 'width' => 1600, 'height' => 1000];
    }

    /** A live post by slug, or with $includeDrafts any post (signed preview links). */
    public static function find(string $slug, bool $includeDrafts = false): ?Post
    {
        $query = Post::query()->with(['author', 'category'])->where('slug', $slug);

        return ($includeDrafts ? $query : $query->live())->first();
    }

    /**
     * Categories with live posts, in the admin's order, with how many posts each has.
     *
     * @param  iterable<Post>  $livePosts
     * @return list<array<string, mixed>>
     */
    public static function categories(iterable $livePosts): array
    {
        $counts = collect($livePosts)->countBy('category_id');

        return Category::query()->ordered()->whereIn('id', $counts->keys()->filter())->get()
            ->map(fn (Category $c) => array_filter([
                'slug' => $c->slug,
                'name' => $c->name,
                'description' => $c->description ?: null,
                'seoTitle' => $c->seo_title ?: null,
                'seoDescription' => $c->seo_description ?: null,
                'count' => $counts[$c->id],
            ], fn ($v) => $v !== null))
            ->values()
            ->all();
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
