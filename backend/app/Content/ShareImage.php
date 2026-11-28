<?php

namespace App\Content;

use App\Models\Post;
use GdImage;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * The 1200×630 link preview card of a blog post (Open Graph / X): brand, category, title,
 * author and reading time on the left, the cover on the right. Drawn once per version of the post
 * and kept on the public disk under share/.
 */
final class ShareImage
{
    public const WIDTH = 1200;

    public const HEIGHT = 630;

    private const VERSION = 2;

    private const PANEL = 700;

    private const PAD = 72;

    private const ACCENT = [31, 107, 255];

    public static function url(Post $post): string
    {
        return "/blog/{$post->slug}/share.png?v=".substr(self::hash($post), 0, 10);
    }

    /** Path on the public disk, drawing the image first when this version doesn't exist yet. */
    public static function path(Post $post): string
    {
        $disk = Storage::disk('public');
        $path = "share/{$post->slug}-".substr(self::hash($post), 0, 10).'.png';
        if (! $disk->exists($path)) {
            foreach ($disk->files('share') as $old) {
                if (str_starts_with(basename($old), "{$post->slug}-")) {
                    $disk->delete($old);
                }
            }
            $disk->makeDirectory('share');
            imagepng(self::draw($post), $disk->path($path), 6);
        }

        return $path;
    }

    private static function hash(Post $post): string
    {
        return md5(json_encode([
            self::VERSION, $post->title, $post->category?->name, $post->author?->name, $post->reading_minutes,
            $post->cover_image ?: $post->firstBodyImage(), SiteContent::settings('site')['brand_name'] ?? '',
        ]));
    }

    private static function draw(Post $post): GdImage
    {
        $img = imagecreatetruecolor(self::WIDTH, self::HEIGHT);
        imageantialias($img, true);
        $white = imagecolorallocate($img, 255, 255, 255);
        $ink = imagecolorallocate($img, 11, 11, 12);
        $muted = imagecolorallocate($img, 110, 110, 118);
        $line = imagecolorallocate($img, 228, 228, 231);
        $accent = imagecolorallocate($img, ...self::ACCENT);
        imagefilledrectangle($img, 0, 0, self::WIDTH, self::HEIGHT, $white);

        self::cover($img, $post);
        imageline($img, self::PANEL, 0, self::PANEL, self::HEIGHT, $line);

        $bold = resource_path('fonts/Barlow-Bold.ttf');
        $medium = resource_path('fonts/Barlow-Medium.ttf');
        $x = self::PAD;
        $maxWidth = self::PANEL - self::PAD * 2;

        // Brand mark: the ">_" tile and the brand name.
        imagefilledrectangle($img, $x, 64, $x + 40, 104, $ink);
        imagettftext($img, 17, 0, $x + 8, 92, $white, $bold, '>');
        imagefilledrectangle($img, $x + 22, 92, $x + 32, 95, $accent);
        $brand = (string) (SiteContent::settings('site')['brand_name'] ?? '');
        self::tracked($img, 13, $x + 56, 90, $ink, $medium, Str::upper($brand), 2.2);

        // Category eyebrow.
        $eyebrowY = 214;
        imagefilledrectangle($img, $x, $eyebrowY - 11, $x + 8, $eyebrowY - 3, $accent);
        self::tracked($img, 14, $x + 22, $eyebrowY, $accent, $medium, Str::upper($post->category?->name ?? 'Blog'), 2.6);

        // Title: the largest size that fits in four lines.
        $title = Str::upper($post->title);
        // Big type gets three lines at most, smaller type four, so it never crowds the footer.
        foreach ([60, 54, 46, 42, 38, 34] as $size) {
            $lines = self::wrap($title, $bold, $size, $maxWidth);
            if (count($lines) <= ($size >= 54 ? 3 : 4)) {
                break;
            }
        }
        $lines = array_slice($lines, 0, 4);
        if (count(self::wrap($title, $bold, $size, $maxWidth)) > 4) {
            $lines[3] = rtrim($lines[3], ' .,:;').'…';
        }
        $y = $eyebrowY + 30 + $size;
        foreach ($lines as $text) {
            imagettftext($img, $size, 0, $x - 2, (int) $y, $ink, $bold, $text);
            $y += $size * 1.08;
        }

        // Footer: author and reading time.
        imageline($img, $x, self::HEIGHT - 104, self::PANEL - self::PAD, self::HEIGHT - 104, $line);
        $meta = implode('  ·  ', array_filter([$post->author?->name, max(1, (int) $post->reading_minutes).' min read']));
        imagettftext($img, 19, 0, $x, self::HEIGHT - 60, $muted, $medium, $meta);

        return $img;
    }

    /** The cover (or first article image) cropped to fill the right side; a brand panel without one. */
    private static function cover(GdImage $img, Post $post): void
    {
        $w = self::WIDTH - self::PANEL;
        $source = null;
        $path = $post->cover_image;
        if (! $path && ($src = $post->firstBodyImage()) && str_starts_with($src, '/storage/')) {
            $path = rawurldecode(substr(strtok($src, '?'), strlen('/storage/')));
        }
        if ($path && Storage::disk('public')->exists($path)) {
            $bytes = Storage::disk('public')->get($path);
            $source = $bytes ? @imagecreatefromstring($bytes) : null;
        }

        if (! $source) {
            $panel = imagecolorallocate($img, 11, 11, 12);
            imagefilledrectangle($img, self::PANEL, 0, self::WIDTH, self::HEIGHT, $panel);
            $grid = imagecolorallocate($img, 34, 34, 38);
            for ($gx = self::PANEL + 60; $gx < self::WIDTH; $gx += 60) {
                imageline($img, $gx, 0, $gx, self::HEIGHT, $grid);
            }
            for ($gy = 45; $gy < self::HEIGHT; $gy += 60) {
                imageline($img, self::PANEL, $gy, self::WIDTH, $gy, $grid);
            }
            $white = imagecolorallocate($img, 255, 255, 255);
            imagettftext($img, 150, 0, self::PANEL + 120, 380, $white, resource_path('fonts/Barlow-Bold.ttf'), '>');
            imagefilledrectangle($img, self::PANEL + 240, 362, self::PANEL + 330, 380, imagecolorallocate($img, ...self::ACCENT));

            return;
        }

        $sw = imagesx($source);
        $sh = imagesy($source);
        $scale = max($w / $sw, self::HEIGHT / $sh);
        $cw = (int) round($w / $scale);
        $ch = (int) round(self::HEIGHT / $scale);
        // Screenshots: keep the top of the page in view.
        imagecopyresampled($img, $source, self::PANEL, 0, (int) (($sw - $cw) / 2), 0, $w, self::HEIGHT, $cw, $ch);
    }

    /** @return list<string> */
    private static function wrap(string $text, string $font, int $size, int $maxWidth): array
    {
        $lines = [];
        $current = '';
        foreach (preg_split('/\s+/', trim($text)) ?: [] as $word) {
            $try = $current === '' ? $word : "{$current} {$word}";
            if ($current !== '' && self::width($try, $font, $size) > $maxWidth) {
                $lines[] = $current;
                $current = $word;
            } else {
                $current = $try;
            }
        }

        return $current === '' ? $lines : [...$lines, $current];
    }

    private static function width(string $text, string $font, int $size): int
    {
        $box = imagettfbbox($size, 0, $font, $text);

        return $box ? $box[2] - $box[0] : 0;
    }

    /** Letter-spaced text, like the site's mono eyebrows. */
    private static function tracked(GdImage $img, int $size, int $x, int $y, int $color, string $font, string $text, float $spacing): void
    {
        foreach (mb_str_split($text) as $char) {
            imagettftext($img, $size, 0, $x, $y, $color, $font, $char);
            $x += self::width($char === ' ' ? 'n' : $char, $font, $size) + (int) round($spacing);
        }
    }
}
