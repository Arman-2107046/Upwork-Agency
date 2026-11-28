<?php

namespace App\Http\Controllers\Api;

use App\Content\PostPayload;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class PostController extends Controller
{
    /** One live blog post with its body, loaded when the website navigates to it. */
    public function __invoke(string $slug): JsonResponse
    {
        $post = PostPayload::find($slug);
        abort_if($post === null, 404);

        return response()->json(PostPayload::full($post), options: JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }
}
