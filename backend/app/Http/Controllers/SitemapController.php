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
        $paths = [
            '/', '/services', '/work', '/about', '/contact',
            ...array_map(fn ($s) => "/services/{$s['slug']}", $content['services']),
            ...array_map(fn ($p) => "/work/{$p['slug']}", $content['projects']),
        ];
        $today = now()->toDateString();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n"
            .'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n"
            .implode('', array_map(
                fn ($p) => '  <url><loc>'.e($base.$p).'</loc><lastmod>'.$today."</lastmod></url>\n",
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
