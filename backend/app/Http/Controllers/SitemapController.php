<?php

namespace App\Http\Controllers;

use App\Content\SiteContent;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function sitemap(): Response
    {
        $content = SiteContent::get();
        $base = $content['site']['siteUrl'];
        $today = now()->toDateString();
        $paths = array_fill_keys([
            '/', '/services', '/work', '/blog', '/about', '/contact',
            ...array_map(fn ($s) => "/services/{$s['slug']}", $content['services']),
            ...array_map(fn ($p) => "/work/{$p['slug']}", $content['projects']),
        ], $today);
        foreach ($content['posts'] as $post) {
            $date = substr($post['updatedAt'] ?? $post['publishedAt'], 0, 10);
            $paths["/blog/{$post['slug']}"] = $date;
            // A category page changes when one of its posts does.
            $category = "/blog/category/{$post['categorySlug']}";
            if ($post['categorySlug'] !== '' && ($paths[$category] ?? '') < $date) {
                $paths[$category] = $date;
            }
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n"
            .'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n"
            .implode('', array_map(
                fn ($p, $date) => '  <url><loc>'.e($base.$p).'</loc><lastmod>'.$date."</lastmod></url>\n",
                array_keys($paths),
                $paths,
            ))
            ."</urlset>\n";

        return response($xml)->header('Content-Type', 'application/xml; charset=UTF-8');
    }

    public function robots(): Response
    {
        $base = SiteContent::siteUrl();

        return response("User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: {$base}/sitemap.xml\n")
            ->header('Content-Type', 'text/plain; charset=UTF-8');
    }
}
