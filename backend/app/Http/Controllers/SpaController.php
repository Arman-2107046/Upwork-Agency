<?php

namespace App\Http\Controllers;

use App\Content\PageMeta;
use App\Content\PostPayload;
use App\Content\SiteContent;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Serves the React site. The built index.html gets the page's head tags and the full CMS
 * content (read synchronously by frontend/src/content/load.ts), so pages render without a loading state.
 * A blog post page also gets that post's body; a signed preview link (from the admin) shows drafts.
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
        $post = $this->post($request);
        $meta = PageMeta::for($request->path(), $content, $post);
        $site = $content['site'];

        $head = view('spa.head', [
            'meta' => $meta,
            'site' => $site,
            'url' => $site['siteUrl'].($meta['path'] === '/' ? '/' : $meta['path']),
            'image' => $meta['image'] ?? $site['siteUrl'].'/og-image.png',
            'organization' => PageMeta::organization($content),
        ])->render();

        $data = '<script id="site-content" type="application/json">'.self::json($content).'</script>';
        if ($post) {
            $data .= "\n".'<script id="post-content" type="application/json">'.self::json($post).'</script>';
        }
        // Signed in to the admin: the blog shows Edit buttons. Readers get nothing extra.
        if ($staff = $this->staff($request)) {
            $data .= "\n".'<script id="staff-content" type="application/json">'.self::json($staff).'</script>';
        }

        $html = str_replace(['<!--app:head-->', '<!--app:content-->'], [$head, $data], $shell);

        return response($html, $meta['status'])
            ->header('Content-Type', 'text/html; charset=UTF-8')
            ->header('Cache-Control', 'no-cache, private');
    }

    /** @return array<string, mixed>|null */
    private function post(Request $request): ?array
    {
        if (! preg_match('#^blog/([a-z0-9-]+)$#', trim($request->path(), '/'), $m)) {
            return null;
        }
        $post = PostPayload::find($m[1], includeDrafts: $request->hasValidSignature(absolute: false));

        return $post ? PostPayload::full($post) : null;
    }

    /**
     * Edit links for a team member signed in to the admin: editors and admins open the editor,
     * viewers the read-only page. "{slug}" is replaced by the website.
     *
     * @return array{access: string, editUrl: string}|null
     */
    private function staff(Request $request): ?array
    {
        $user = $request->user();
        if (! $user instanceof User || ! array_key_exists((string) $user->role, User::ROLES)) {
            return null;
        }

        return [
            'access' => $user->canWrite() ? 'edit' : 'view',
            'editUrl' => $user->canWrite() ? '/admin/posts/{slug}/edit' : '/admin/posts/{slug}',
        ];
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
