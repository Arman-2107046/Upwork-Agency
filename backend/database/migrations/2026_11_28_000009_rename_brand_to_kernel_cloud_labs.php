<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The agency is now Kernel Cloud Labs. Saved settings that still carry the old name (brand,
 * short name, prompt handle, page titles and texts) are updated; anything edited to something
 * else is left alone.
 */
return new class extends Migration
{
    private const NAMES = [
        'Bytecode Software Labs' => 'Kernel Cloud Labs',
        'bytecode@labs' => 'kernel@labs',
    ];

    public function up(): void
    {
        $this->rename(self::NAMES, ['short_name' => ['Bytecode', 'Kernel']]);
    }

    public function down(): void
    {
        $this->rename(array_flip(self::NAMES), ['short_name' => ['Kernel', 'Bytecode']]);
    }

    /**
     * @param  array<string, string>  $names
     * @param  array<string, array{string, string}>  $exact
     */
    private function rename(array $names, array $exact): void
    {
        foreach (DB::table('settings')->get(['id', 'value']) as $row) {
            $value = json_decode((string) $row->value, true);
            if (! is_array($value)) {
                continue;
            }
            array_walk_recursive($value, function (&$item, $key) use ($names, $exact): void {
                if (! is_string($item)) {
                    return;
                }
                if (isset($exact[$key]) && $item === $exact[$key][0]) {
                    $item = $exact[$key][1];

                    return;
                }
                $item = strtr($item, $names);
            });
            DB::table('settings')->where('id', $row->id)->update(['value' => json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
        }
        cache()->forget('site-content:v1');
    }
};
