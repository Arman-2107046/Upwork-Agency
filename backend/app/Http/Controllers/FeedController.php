<?php

namespace App\Http\Controllers;

use App\Content\SiteContent;
use App\Models\Post;
use Illuminate\Http\Response;

/** RSS 2.0 feed of the latest blog posts, for feed readers and newsletter tools. */
class FeedController extends Controller
{
    public function __invoke(): Response
    {
        $content = SiteContent::get();
        $site = $content['site'];
        $base = $site['siteUrl'];
        $posts = Post::query()->live()->with(['author', 'category'])->limit(30)->get();

        $items = $posts->map(function (Post $post) use ($base): string {
            $url = e("{$base}/blog/{$post->slug}");
            $image = $post->cover_image ? '<enclosure url="'.e($base.'/storage/'.$post->cover_image).'" type="'.e(self::mime($post->cover_image)).'" length="0" />' : '';
            $categories = collect([$post->category?->name, ...($post->tags ?? [])])
                ->filter()
                ->unique()
                ->map(fn ($c) => '<category>'.e($c).'</category>')
                ->implode('');

            return '<item>'
                .'<title>'.e($post->title).'</title>'
                ."<link>{$url}</link>"
                ."<guid isPermaLink=\"true\">{$url}</guid>"
                .'<pubDate>'.$post->published_at->toRssString().'</pubDate>'
                .($post->author ? '<dc:creator>'.e($post->author->name).'</dc:creator>' : '')
                .'<description>'.e($post->excerpt).'</description>'
                .'<content:encoded><![CDATA['.str_replace(']]>', ']]]]><![CDATA[>', self::absolute((string) $post->body_html, $base)).']]></content:encoded>'
                .$categories
                .$image
                .'</item>';
        })->implode("\n");

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n"
            .'<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">'
            .'<channel>'
            .'<title>'.e("{$site['brandName']} Blog").'</title>'
            .'<link>'.e("{$base}/blog").'</link>'
            .'<atom:link href="'.e("{$base}/blog/rss.xml").'" rel="self" type="application/rss+xml" />'
            .'<description>'.e($content['pages']['blog']['description'] ?? $site['description']).'</description>'
            .'<language>en</language>'
            .($posts->isNotEmpty() ? '<lastBuildDate>'.$posts->first()->published_at->toRssString().'</lastBuildDate>' : '')
            ."\n{$items}\n"
            .'</channel></rss>'."\n";

        return response($xml)
            ->header('Content-Type', 'application/rss+xml; charset=UTF-8')
            ->header('Cache-Control', 'public, max-age=300');
    }

    /** Feed readers need absolute URLs for images and links inside the post. */
    private static function absolute(string $html, string $base): string
    {
        return preg_replace('#(\s(?:src|href)=")/(?!/)#', '$1'.$base.'/', preg_replace_callback(
            '#\ssrcset="([^"]*)"#',
            fn ($m) => ' srcset="'.preg_replace('#(^|,\s*)/(?!/)#', '$1'.$base.'/', $m[1]).'"',
            $html,
        ));
    }

    private static function mime(string $path): string
    {
        return match (strtolower(pathinfo($path, PATHINFO_EXTENSION))) {
            'png' => 'image/png',
            'webp' => 'image/webp',
            default => 'image/jpeg',
        };
    }
}
