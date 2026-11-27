<?php

namespace App\Http\Controllers\Api;

use App\Content\SiteContent;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ContentController extends Controller
{
    /** Everything the website shows, in one document (shape: frontend/src/content/types.ts). */
    public function __invoke(): JsonResponse
    {
        return response()->json(SiteContent::get(), options: JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }
}
