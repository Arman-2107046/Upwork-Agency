<?php

namespace App\Content;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;
use Throwable;

/**
 * Turns a path on the "public" disk into the ImageAsset shape the website expects
 * (src, srcSet, alt, width, height). Images are served from the server, with an 800px WebP
 * variant for small screens.
 */
final class ImageAsset
{
    public const VARIANT_WIDTH = 800;

    /** @return array<string, mixed> */
    public static function make(?string $path, ?string $alt, ?string $placeholderLabel = null): array
    {
        $alt = trim((string) $alt);
        $disk = Storage::disk('public');

        if (! $path || ! $disk->exists($path)) {
            // The website draws a designed placeholder block for images without a src.
            return [
                'alt' => $alt,
                'width' => 1600,
                'height' => 1000,
                'placeholderLabel' => $placeholderLabel ?: $alt,
            ];
        }

        $size = @getimagesize($disk->path($path));
        [$width, $height] = $size ? [$size[0], $size[1]] : [1600, 1000];
        $src = self::url($path);
        $asset = ['src' => $src, 'alt' => $alt, 'width' => $width, 'height' => $height];

        if ($size && $width > self::VARIANT_WIDTH && ($variant = self::variant($path))) {
            $asset['srcSet'] = self::url($variant).' '.self::VARIANT_WIDTH."w, {$src} {$width}w";
        }

        return $asset;
    }

    /** Root-relative URL, so cached content works on any domain. */
    public static function url(string $path): string
    {
        return '/storage/'.implode('/', array_map(rawurlencode(...), explode('/', ltrim($path, '/'))));
    }

    /** Path of the small-screen variant, generated on first use. Null when it cannot be made. */
    private static function variant(string $path): ?string
    {
        $disk = Storage::disk('public');
        $info = pathinfo($path);
        $dir = ($info['dirname'] ?? '.') === '.' ? '' : $info['dirname'].'/';
        $variant = $dir.$info['filename'].'-'.self::VARIANT_WIDTH.'.webp';

        if ($disk->exists($variant)) {
            return $variant;
        }

        try {
            ImageManager::usingDriver(Driver::class)
                ->decodePath($disk->path($path))
                ->scaleDown(width: self::VARIANT_WIDTH)
                ->encode(new WebpEncoder(quality: 80))
                ->save($disk->path($variant));

            return $variant;
        } catch (Throwable $e) {
            Log::warning('Could not create image variant', ['path' => $path, 'error' => $e->getMessage()]);

            return null;
        }
    }
}
