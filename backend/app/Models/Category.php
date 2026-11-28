<?php

namespace App\Models;

use App\Models\Concerns\FlushesSiteContent;
use App\Models\Concerns\RecordsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * A blog category. Each post has one; the website filters by it and gives each category with
 * live posts its own page at /blog/category/{slug}.
 */
#[Fillable(['name', 'slug', 'description', 'seo_title', 'seo_description', 'sort'])]
class Category extends Model
{
    use FlushesSiteContent, RecordsActivity;

    protected function casts(): array
    {
        return ['sort' => 'integer'];
    }

    protected static function booted(): void
    {
        // Categories added from the post form only have a name.
        static::creating(function (Category $category): void {
            if (blank($category->slug)) {
                $category->slug = static::uniqueSlug((string) $category->name);
            }
            if ($category->sort === null) {
                $category->sort = (int) static::query()->max('sort') + 1;
            }
        });
    }

    /** @return HasMany<Post, $this> */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    /** In the order set in the admin. @param Builder<Category> $query */
    public function scopeOrdered(Builder $query): void
    {
        $query->orderBy('sort')->orderBy('name');
    }

    public static function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'category';
        $slug = $base;
        for ($i = 2; static::query()->where('slug', $slug)->exists(); $i++) {
            $slug = "{$base}-{$i}";
        }

        return $slug;
    }
}
