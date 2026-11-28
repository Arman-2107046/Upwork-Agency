<?php

namespace App\Models;

use App\Models\Concerns\FlushesSiteContent;
use App\Models\Concerns\HasSortOrder;
use App\Models\Concerns\RecordsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'slug', 'title', 'summary', 'bullets', 'outcome', 'icon', 'stack_groups',
    'example_image', 'example_alt', 'example_project_id', 'is_published', 'sort',
])]
class Service extends Model
{
    use FlushesSiteContent, HasSortOrder, RecordsActivity;

    /** Icons the website can draw (see frontend/src/components/ui/ServiceIcon.tsx). */
    public const ICONS = [
        'shopping-bag' => 'Shopping bag',
        'layout-dashboard' => 'Dashboard',
        'monitor' => 'Monitor',
        'bot' => 'Bot',
        'workflow' => 'Workflow',
        'database' => 'Database',
        'cloud' => 'Cloud',
        'palette' => 'Palette',
    ];

    protected function casts(): array
    {
        return [
            'bullets' => 'array',
            'stack_groups' => 'array',
            'is_published' => 'boolean',
            'sort' => 'integer',
        ];
    }

    /** @param Builder<Service> $query */
    public function scopePublished(Builder $query): void
    {
        $query->where('is_published', true)->orderBy('sort')->orderBy('id');
    }

    /** @return BelongsTo<Project, $this> */
    public function exampleProject(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'example_project_id');
    }
}
