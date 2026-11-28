<?php

namespace App\Models;

use App\Models\Concerns\FlushesSiteContent;
use App\Models\Concerns\RecordsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * One JSON document per key: "site", "home", "about", "pages".
 * Edited through the settings pages in the admin (app/Filament/Pages).
 */
#[Fillable(['key', 'value'])]
class Setting extends Model
{
    use FlushesSiteContent, RecordsActivity;

    public function activityLabel(): string
    {
        return ucfirst((string) $this->key).' settings';
    }

    protected function casts(): array
    {
        return ['value' => 'array'];
    }

    /** @return array<string, mixed> */
    public static function group(string $key): array
    {
        return static::query()->where('key', $key)->value('value') ?? [];
    }

    /** @param array<string, mixed> $value */
    public static function putGroup(string $key, array $value): void
    {
        static::query()->updateOrCreate(['key' => $key], ['value' => $value]);
    }
}
