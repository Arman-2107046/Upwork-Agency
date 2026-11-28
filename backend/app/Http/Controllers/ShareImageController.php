<?php

namespace App\Http\Controllers;

use App\Content\PostPayload;
use App\Content\ShareImage;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/** /blog/{slug}/share.png: the link preview card of a live post. */
class ShareImageController extends Controller
{
    public function __invoke(string $slug): BinaryFileResponse
    {
        $post = PostPayload::find($slug);
        abort_if($post === null, 404);

        return response()->file(Storage::disk('public')->path(ShareImage::path($post)), [
            'Content-Type' => 'image/png',
            // The URL carries a version, so a new title or cover gets a new address.
            'Cache-Control' => 'public, max-age=604800',
        ]);
    }
}
