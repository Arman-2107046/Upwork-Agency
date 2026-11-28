<?php

namespace App\Content;

use Illuminate\Support\Facades\Storage;

/**
 * The VideoAsset shape the website expects: a video file uploaded in the admin, played from the server.
 */
final class VideoAsset
{
    /**
     * @param  array<string, mixed>|null  $poster  ImageAsset shown before playback
     * @return array<string, mixed>|null
     */
    public static function make(?string $path, string $title, ?array $poster = null): ?array
    {
        if (! $path || ! Storage::disk('public')->exists($path)) {
            return null;
        }

        return array_filter([
            'src' => ImageAsset::url($path),
            'poster' => $poster['src'] ?? null,
            'title' => $title,
            'width' => 1920,
            'height' => 1080,
        ], fn ($v) => $v !== null);
    }
}
