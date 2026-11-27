<?php

namespace App\Models;

use App\Models\Concerns\FlushesSiteContent;
use App\Models\Concerns\HasSortOrder;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'slug', 'title', 'url', 'category', 'overview', 'scope', 'technologies',
    'cover_image', 'cover_alt', 'gallery', 'video', 'is_featured', 'is_published', 'sort',
])]
class Project extends Model
{
    use FlushesSiteContent, HasSortOrder;

    protected function casts(): array
    {
        return [
            'scope' => 'array',
            'technologies' => 'array',
            'gallery' => 'array',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
            'sort' => 'integer',
        ];
    }

    /** @param Builder<Project> $query */
    public function scopePublished(Builder $query): void
    {
        $query->where('is_published', true)->orderBy('sort')->orderBy('id');
    }

    /** @return HasMany<Service, $this> */
    public function exampleFor(): HasMany
    {
        return $this->hasMany(Service::class, 'example_project_id');
    }
}
