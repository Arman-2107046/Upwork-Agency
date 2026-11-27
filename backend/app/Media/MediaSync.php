<?php

namespace App\Media;

use App\Content\SiteContent;
use App\Models\CloudMedia;
use App\Models\Project;
use App\Models\Service;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * Copies the website's images to Cloudflare Images and project videos to Cloudflare Stream.
 * Files stay on the server too, so the site falls back to them if Cloudflare is unavailable.
 */
class MediaSync
{
    private static bool $scheduled = false;

    public function __construct(private readonly Cloudflare $cloudflare) {}

    /** Runs a sync once, after the current response has been sent (saving stays fast). */
    public static function afterResponse(): void
    {
        if (self::$scheduled || ! Cloudflare::fromConfig()->streamEnabled()) {
            return;
        }
        self::$scheduled = true;

        app()->terminating(function (): void {
            self::$scheduled = false;
            app(self::class)->sync();
        });
    }

    /**
     * Uploads every referenced file that is not on Cloudflare yet and refreshes videos still
     * processing. Clears the content cache when anything changed.
     *
     * @return array{uploaded: int, failed: int, processing: int}
     */
    public function sync(?callable $progress = null): array
    {
        @set_time_limit(0);
        $stats = ['uploaded' => 0, 'failed' => 0, 'processing' => 0];
        $changed = false;
        $known = CloudMedia::query()->get()->keyBy('path');
        $disk = Storage::disk('public');

        foreach ($this->referencedMedia() as $path => $kind) {
            $record = $known->get($path);
            if (! $disk->exists($path) || ! $this->enabled($kind)) {
                continue;
            }

            try {
                if ($record?->isReady()) {
                    continue;
                }
                if ($record && $kind === 'video' && $record->status === 'processing') {
                    $changed = $this->refreshVideo($record) || $changed;
                    $stats['processing'] += $record->status === 'processing' ? 1 : 0;

                    continue;
                }

                $progress && $progress($path);
                $kind === 'image' ? $this->uploadImage($path) : $this->uploadVideo($path);
                $stats['uploaded']++;
                $changed = true;
            } catch (Throwable $e) {
                $stats['failed']++;
                Log::warning('Cloudflare media sync failed', ['path' => $path, 'error' => $e->getMessage()]);
                // Kept so the admin can see the reason; retried on the next sync.
                CloudMedia::query()->updateOrCreate(['path' => $path], [
                    'kind' => $kind,
                    'remote_id' => $record->remote_id ?? '',
                    'status' => 'failed',
                    'data' => ['error' => mb_substr($e->getMessage(), 0, 500)],
                ]);
            }
        }

        if ($changed) {
            SiteContent::flush();
        }

        return $stats;
    }

    /**
     * Every media path the website uses, mapped to its kind.
     *
     * @return array<string, 'image'|'video'>
     */
    public function referencedMedia(): array
    {
        $media = [];
        $add = function (?string $path, string $kind) use (&$media): void {
            if (filled($path)) {
                $media[$path] = $kind;
            }
        };

        foreach (Project::query()->get() as $project) {
            $add($project->cover_image, 'image');
            foreach ($project->gallery ?? [] as $item) {
                $add($item['image'] ?? null, 'image');
            }
            $add($project->video, 'video');
        }
        foreach (Service::query()->pluck('example_image') as $path) {
            $add($path, 'image');
        }
        foreach (SiteContent::settings('home')['showcase']['stages'] ?? [] as $stage) {
            $add($stage['image'] ?? null, 'image');
        }

        return $media;
    }

    private function enabled(string $kind): bool
    {
        return $kind === 'image' ? $this->cloudflare->imagesEnabled() : $this->cloudflare->streamEnabled();
    }

    private function uploadImage(string $path): void
    {
        $absolute = Storage::disk('public')->path($path);
        $remoteId = $this->cloudflare->remoteId($path);
        $this->cloudflare->uploadImage($absolute, $remoteId);
        $size = @getimagesize($absolute) ?: [null, null];

        CloudMedia::query()->updateOrCreate(['path' => $path], [
            'kind' => 'image',
            'remote_id' => $remoteId,
            'status' => 'ready',
            'width' => $size[0],
            'height' => $size[1],
            'data' => null,
        ]);
    }

    private function uploadVideo(string $path): void
    {
        $video = $this->cloudflare->uploadVideo(Storage::disk('public')->path($path), $this->cloudflare->remoteId($path));
        $record = CloudMedia::query()->updateOrCreate(['path' => $path], [
            'kind' => 'video',
            'remote_id' => $video['uid'],
            'status' => 'processing',
        ]);
        $this->applyVideo($record, $video);
    }

    /** @return bool Whether the video became ready */
    private function refreshVideo(CloudMedia $record): bool
    {
        $this->applyVideo($record, $this->cloudflare->video($record->remote_id));

        return $record->isReady();
    }

    /** @param array<string, mixed> $video */
    private function applyVideo(CloudMedia $record, array $video): void
    {
        $state = $video['status']['state'] ?? null;
        $preview = (string) ($video['preview'] ?? '');

        $record->fill([
            'status' => ($video['readyToStream'] ?? false) ? 'ready' : ($state === 'error' ? 'failed' : 'processing'),
            'width' => ($video['input']['width'] ?? 0) > 0 ? $video['input']['width'] : null,
            'height' => ($video['input']['height'] ?? 0) > 0 ? $video['input']['height'] : null,
            'data' => [
                'iframe' => $preview ? preg_replace('#/watch$#', '/iframe', $preview) : null,
                'hls' => $video['playback']['hls'] ?? null,
                'thumbnail' => $video['thumbnail'] ?? null,
                'error' => $state === 'error' ? ($video['status']['errReasonText'] ?? 'Processing failed') : null,
            ],
        ])->save();
    }
}
