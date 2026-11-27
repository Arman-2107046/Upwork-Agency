<?php

namespace App\Console\Commands;

use App\Content\SiteContent;
use App\Media\Cloudflare;
use App\Media\MediaSync;
use App\Models\CloudMedia;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Throwable;

#[Signature('media:sync {--prune : Also delete Cloudflare copies of media the website no longer uses}')]
#[Description('Upload website images to Cloudflare Images and project videos to Cloudflare Stream')]
class SyncMedia extends Command
{
    public function handle(MediaSync $sync): int
    {
        $cloudflare = Cloudflare::fromConfig();
        if (! $cloudflare->streamEnabled()) {
            $this->components->info('Cloudflare is not configured (CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN). Media is served from the server.');

            return self::SUCCESS;
        }

        $stats = $sync->sync(fn (string $path) => $this->components->twoColumnDetail('Uploading', $path));
        $this->components->info("Uploaded {$stats['uploaded']}, failed {$stats['failed']}, videos still processing {$stats['processing']}.");

        if ($this->option('prune')) {
            $this->prune($sync, $cloudflare);
        }

        return $stats['failed'] > 0 ? self::FAILURE : self::SUCCESS;
    }

    private function prune(MediaSync $sync, Cloudflare $cloudflare): void
    {
        $used = array_keys($sync->referencedMedia());
        $stale = CloudMedia::query()->whereNotIn('path', $used)->get();

        foreach ($stale as $record) {
            try {
                if ($record->remote_id !== '') {
                    $record->kind === 'image' ? $cloudflare->deleteImage($record->remote_id) : $cloudflare->deleteVideo($record->remote_id);
                }
                $record->delete();
                $this->components->twoColumnDetail('Deleted', $record->path);
            } catch (Throwable $e) {
                $this->components->warn("Could not delete {$record->path}: {$e->getMessage()}");
            }
        }

        SiteContent::flush();
        $this->components->info("Pruned {$stale->count()} unused file(s).");
    }
}
