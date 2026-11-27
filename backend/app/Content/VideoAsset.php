<?php

namespace App\Content;

use Illuminate\Support\Facades\Storage;

/**
 * The VideoAsset shape the website expects. Videos synced to Cloudflare Stream play in the
 * Stream player (adaptive quality); others play from the server until the upload finishes.
 */
final class VideoAsset
{
    /**
     * @param  array<string, mixed>|null  $poster  ImageAsset shown before playback (server files only)
     * @return array<string, mixed>|null
     */
    public static function make(?string $path, string $title, ?array $poster = null): ?array
    {
        if (! $path) {
            return null;
        }

        if (($record = ImageAsset::cloudRecord($path, 'video')) && filled($record->data['iframe'] ?? null)) {
            return array_filter([
                'provider' => 'stream',
                'src' => $record->data['iframe'],
                'poster' => $record->data['thumbnail'] ?? null,
                'title' => $title,
                'width' => $record->width ?: 1920,
                'height' => $record->height ?: 1080,
            ], fn ($v) => $v !== null);
        }

        if (! Storage::disk('public')->exists($path)) {
            return null;
        }

        return array_filter([
            'provider' => 'file',
            'src' => ImageAsset::url($path),
            'poster' => $poster['src'] ?? null,
            'title' => $title,
            'width' => 1920,
            'height' => 1080,
        ], fn ($v) => $v !== null);
    }
}
