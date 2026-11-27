<?php

namespace App\Models\Concerns;

use App\Content\SiteContent;
use App\Media\MediaSync;

/**
 * Clears the cached public content payload whenever a CMS record changes, and copies new
 * media to Cloudflare after the response is sent.
 */
trait FlushesSiteContent
{
    public static function bootFlushesSiteContent(): void
    {
        static::saved(function (): void {
            SiteContent::flush();
            MediaSync::afterResponse();
        });
        static::deleted(fn () => SiteContent::flush());
    }
}
