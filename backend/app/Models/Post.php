<?php

namespace App\Models;

use App\Content\PostBody;
use App\Models\Concerns\FlushesSiteContent;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * A blog post. It is live once "Published" is on and its publish date has passed, so a future
 * date schedules it (the website's content cache expires at that moment).
 *
 * @property Carbon|null $published_at
 */
#[Fillable([
    'slug', 'title', 'excerpt', 'body', 'category', 'tags', 'cover_image', 'cover_alt', 'author_id',
    'is_published', 'is_featured', 'published_at', 'seo_title', 'seo_description',
])]
class Post extends Model
{
    use FlushesSiteContent;

    public const STATUS_DRAFT = 'draft';

    public const STATUS_SCHEDULED = 'scheduled';

    public const STATUS_PUBLISHED = 'published';

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'toc' => 'array',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'published_at' => 'datetime',
            'reading_minutes' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Post $post): void {
            if ($post->is_published && ! $post->published_at) {
                $post->published_at = now();
            }
            if ($post->isDirty('body') || $post->body_html === null) {
                $rendered = PostBody::render($post->body);
                $post->body_html = $rendered['html'];
                $post->toc = $rendered['toc'];
                $post->reading_minutes = $rendered['minutes'];
            }
        });
    }

    /** @return BelongsTo<User, $this> */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /** Posts visible on the website, newest first. @param Builder<Post> $query */
    public function scopeLive(Builder $query): void
    {
        $query->where('is_published', true)
            ->where('published_at', '<=', now())
            ->orderByDesc('published_at')
            ->orderByDesc('id');
    }

    public function status(): string
    {
        return match (true) {
            ! $this->is_published => self::STATUS_DRAFT,
            $this->published_at?->isFuture() => self::STATUS_SCHEDULED,
            default => self::STATUS_PUBLISHED,
        };
    }

    public function isLive(): bool
    {
        return $this->status() === self::STATUS_PUBLISHED;
    }

    /** When the next scheduled post goes live, so cached content can expire right then. */
    public static function nextScheduledAt(): ?Carbon
    {
        $next = static::query()->where('is_published', true)->where('published_at', '>', now())->min('published_at');

        return $next ? Carbon::parse($next) : null;
    }
}
