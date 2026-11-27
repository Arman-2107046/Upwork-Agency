<?php

namespace App\Models;

use App\Models\Concerns\FlushesSiteContent;
use App\Models\Concerns\HasSortOrder;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['label', 'items', 'slider_row', 'sort'])]
class TechnologyGroup extends Model
{
    use FlushesSiteContent, HasSortOrder;

    /** Rows of the logo slider under the home hero. */
    public const SLIDER_ROWS = [
        1 => 'Applications',
        2 => 'Data and AI',
        3 => 'Infrastructure and design',
    ];

    protected function casts(): array
    {
        return [
            'items' => 'array',
            'slider_row' => 'integer',
            'sort' => 'integer',
        ];
    }
}
