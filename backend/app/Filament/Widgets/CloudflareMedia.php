<?php

namespace App\Filament\Widgets;

use App\Media\Cloudflare;
use App\Media\MediaSync;
use App\Models\CloudMedia;
use Filament\Support\Icons\Heroicon;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

/** Shows how much of the website's media is served by Cloudflare. */
class CloudflareMedia extends StatsOverviewWidget
{
    protected static ?int $sort = 3;

    protected ?string $heading = 'Cloudflare media';

    protected function getStats(): array
    {
        $cloudflare = Cloudflare::fromConfig();
        $media = collect(app(MediaSync::class)->referencedMedia());
        $records = CloudMedia::query()->whereIn('path', $media->keys())->get()->keyBy('path');

        $stat = function (string $kind, string $label, bool $enabled, string $product) use ($media, $records) {
            $paths = $media->filter(fn ($k) => $k === $kind)->keys();
            $ready = $paths->filter(fn ($p) => $records->get($p)?->isReady())->count();
            $failed = $paths->filter(fn ($p) => $records->get($p)?->status === 'failed')->count();

            return Stat::make($label, $enabled ? "{$ready} / {$paths->count()}" : 'Off')
                ->description(match (true) {
                    ! $enabled => "Set the Cloudflare variables to use {$product}",
                    $paths->isEmpty() => $kind === 'image' ? 'No images in use yet' : 'No project videos yet',
                    $failed > 0 => "{$failed} failed, retried on the next save or restart",
                    $ready < $paths->count() => 'Uploading in the background',
                    default => "All served by {$product}",
                })
                ->descriptionColor($failed > 0 ? 'danger' : null)
                ->icon($kind === 'image' ? Heroicon::OutlinedPhoto : Heroicon::OutlinedFilm);
        };

        return [
            $stat('image', 'Images on Cloudflare', $cloudflare->imagesEnabled(), 'Cloudflare Images'),
            $stat('video', 'Videos on Cloudflare', $cloudflare->streamEnabled(), 'Cloudflare Stream'),
        ];
    }
}
