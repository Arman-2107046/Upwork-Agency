<?php

namespace App\Models\Concerns;

/** New records go to the end of the list; drag rows in the admin table to reorder. */
trait HasSortOrder
{
    public static function bootHasSortOrder(): void
    {
        static::creating(function ($model): void {
            if (! $model->sort) {
                $model->sort = (int) static::query()->max('sort') + 1;
            }
        });
    }
}
