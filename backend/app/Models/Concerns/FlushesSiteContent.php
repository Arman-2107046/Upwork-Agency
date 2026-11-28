<?php

namespace App\Models\Concerns;

use App\Content\SiteContent;

/**
 * Clears the cached public content payload whenever a CMS record changes.
 */
trait FlushesSiteContent
{
    public static function bootFlushesSiteContent(): void
    {
        static::saved(fn () => SiteContent::flush());
        static::deleted(fn () => SiteContent::flush());
    }
}
