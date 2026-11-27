<?php

namespace App\Content;

/**
 * Default content, read from the seed file. Settings saved in the admin are merged over these,
 * so a missing key never breaks the website.
 */
final class Defaults
{
    /** @var array<string, mixed>|null */
    private static ?array $seed = null;

    /** @return array<string, mixed> */
    public static function seed(): array
    {
        return self::$seed ??= json_decode(
            file_get_contents(database_path('seeders/content/content.json')),
            true,
            flags: JSON_THROW_ON_ERROR,
        );
    }

    /** @return array<string, mixed> */
    public static function group(string $key): array
    {
        return self::seed()[$key] ?? [];
    }

    /** Folder that holds the seed images (copied to the public disk by the seeder). */
    public static function imagesPath(string $path = ''): string
    {
        return database_path('seeders/content/images'.($path ? '/'.ltrim($path, '/') : ''));
    }
}
