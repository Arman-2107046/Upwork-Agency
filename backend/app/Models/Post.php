<?php

namespace App\Models;

use App\Content\PostBody;
use App\Models\Concerns\FlushesSiteContent;
use App\Models\Concerns\RecordsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * A blog post. It is live once "Published" is on and its publish date has passed, so a future
 * date schedules it (the website's content cache expires at that moment).
 *
 * @property Carbon|null $published_at
 */
#[Fillable([
    'slug', 'title', 'excerpt', 'body', 'category_id', 'tags', 'cover_image', 'cover_alt', 'cover_caption', 'author_id',
    'is_published', 'is_featured', 'published_at', 'seo_title', 'seo_description',
])]
class Post extends Model
{
    use FlushesSiteContent, RecordsActivity;

    public const STATUS_DRAFT = 'draft';

    public const STATUS_SCHEDULED = 'scheduled';

    public const STATUS_PUBLISHED = 'published';

    /** Addresses taken by blog routes (/blog/rss.xml, /blog/category/…) and the admin (/admin/posts/create). */
    public const RESERVED_SLUGS = ['category', 'feed', 'rss', 'rss-xml', 'page', 'search', 'tag', 'create'];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'toc' => 'array',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'published_at' => 'datetime',
            'reading_minutes' => 'integer',
            'views' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Post $post): void {
            $post->title = trim(preg_replace('/\s+/', ' ', (string) $post->title));
            $post->slug = Str::slug((string) ($post->slug ?: $post->title));
            if (in_array($post->slug, self::RESERVED_SLUGS, true)) {
                throw ValidationException::withMessages(['slug' => "The address \"{$post->slug}\" is used by the blog itself. Choose another."]);
            }
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

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** @return HasMany<PostLike, $this> */
    public function likes(): HasMany
    {
        return $this->hasMany(PostLike::class);
    }

    /** @return HasMany<PostComment, $this> */
    public function comments(): HasMany
    {
        return $this->hasMany(PostComment::class);
    }

    /** The first image in the article, used as the cover when none is uploaded. */
    public function firstBodyImage(): ?string
    {
        if (! preg_match('/<img\b[^>]*\bsrc="([^"]+)"/i', (string) $this->body_html, $m)) {
            return null;
        }
        $src = html_entity_decode($m[1]);

        return preg_match('#^(/storage/|https?://)#i', $src) ? $src : null;
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
