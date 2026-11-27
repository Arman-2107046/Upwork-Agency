<?php

namespace App\Http\Controllers;

use App\Content\PageMeta;
use App\Content\SiteContent;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Serves the React site. The built index.html gets the page's head tags and the full CMS
 * content (read synchronously by frontend/src/content/load.ts), so pages render without a loading state.
 */
class SpaController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $shell = $this->shell();
        if ($shell === null) {
            return response('The website has not been built yet. Run "npm run build" in the project root, '
                .'or use the Vite dev server (npm run dev) during development.', 503)
                ->header('Content-Type', 'text/plain; charset=UTF-8');
        }

        $content = SiteContent::get();
        $meta = PageMeta::for($request->path(), $content);
        $site = $content['site'];

        $head = view('spa.head', [
            'meta' => $meta,
            'site' => $site,
            'url' => $site['siteUrl'].($meta['path'] === '/' ? '/' : $meta['path']),
            'image' => $site['siteUrl'].'/og-image.png',
            'organization' => PageMeta::organization($content),
        ])->render();

        $data = '<script id="site-content" type="application/json">'.self::json($content).'</script>';

        $html = str_replace(['<!--app:head-->', '<!--app:content-->'], [$head, $data], $shell);

        return response($html, $meta['status'])
            ->header('Content-Type', 'text/html; charset=UTF-8')
            ->header('Cache-Control', 'no-cache, private');
    }

    /** JSON that is safe inside a <script> element. */
    public static function json(mixed $value): string
    {
        return json_encode($value, JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    }

    /** The built index.html: resources/spa in the Docker image, ../frontend/dist when run from the repo. */
    private function shell(): ?string
    {
        $candidates = array_filter([config('app.spa_index'), resource_path('spa/index.html'), base_path('../frontend/dist/index.html')]);

        foreach ($candidates as $file) {
            if (is_file($file)) {
                return file_get_contents($file) ?: null;
            }
        }

        return null;
    }
}
