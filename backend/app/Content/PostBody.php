<?php

namespace App\Content;

use DOMDocument;
use DOMElement;
use DOMXPath;
use Filament\Forms\Components\RichEditor\RichContentRenderer;
use Filament\Forms\Components\RichEditor\TextColor;
use Illuminate\Support\Str;

/**
 * Turns the rich editor HTML of a blog post into what the website renders:
 * sanitized HTML whose h2/h3 headings carry ids (the table of contents links to them),
 * responsive images served from the server, safe external links, and the reading time.
 */
final class PostBody
{
    private const WORDS_PER_MINUTE = 225;

    /**
     * Text colours offered in the editor, in the brand palette. The website styles them with the
     * --color / --dark-color variables the renderer writes.
     *
     * @return array<string, TextColor>
     */
    public static function textColors(): array
    {
        return [
            'brand' => TextColor::make('Brand blue', '#1F6BFF', '#6EA0FF'),
            'ink' => TextColor::make('Ink', '#0B0B0C', '#F4F4F5'),
            'muted' => TextColor::make('Muted', '#6B6B73', '#A1A1AA'),
            'green' => TextColor::make('Green', '#15803D', '#4ADE80'),
            'amber' => TextColor::make('Amber', '#B45309', '#FBBF24'),
            'red' => TextColor::make('Red', '#B91C1C', '#F87171'),
        ];
    }

    /**
     * @param  string|array<string, mixed>|null  $body  editor HTML, or the editor's live document
     * @return array{html: string, toc: list<array{id: string, text: string, level: int}>, minutes: int}
     */
    public static function render(string|array|null $body): array
    {
        if (blank($body)) {
            return ['html' => '', 'toc' => [], 'minutes' => 1];
        }

        $html = RichContentRenderer::make($body)
            ->fileAttachmentsDisk('public')
            ->fileAttachmentsVisibility('public')
            ->textColors(self::textColors())
            ->toHtml();

        $dom = new DOMDocument('1.0', 'UTF-8');
        $previous = libxml_use_internal_errors(true);
        $dom->loadHTML('<?xml encoding="UTF-8"?><div id="post-root">'.$html.'</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        $xpath = new DOMXPath($dom);
        $root = $dom->getElementById('post-root') ?? $dom->documentElement;

        $toc = self::anchorHeadings($xpath, $root);
        self::responsiveImages($xpath, $root);
        self::safeLinks($xpath, $root);
        self::wrapTables($dom, $xpath, $root);

        $out = '';
        foreach (iterator_to_array($root->childNodes) as $child) {
            $out .= $dom->saveHTML($child);
        }

        $words = str_word_count(strip_tags(str_replace('<', ' <', $out)));

        return [
            'html' => trim($out),
            'toc' => $toc,
            'minutes' => max(1, (int) ceil($words / self::WORDS_PER_MINUTE)),
        ];
    }

    /** @return list<array{id: string, text: string, level: int}> */
    private static function anchorHeadings(DOMXPath $xpath, DOMElement $root): array
    {
        $toc = [];
        $used = [];

        foreach ($xpath->query('.//h1|.//h2|.//h3|.//h4', $root) as $heading) {
            /** @var DOMElement $heading */
            $text = trim(preg_replace('/\s+/u', ' ', $heading->textContent) ?? '');
            if ($text === '') {
                continue;
            }

            // The page title is the only h1; a heading 1 in the editor becomes a section heading.
            $level = max(2, (int) substr($heading->nodeName, 1));
            if ($heading->nodeName === 'h1') {
                $heading = self::rename($heading, 'h2');
            }

            $base = Str::slug($text) ?: 'section';
            $id = $base;
            for ($n = 2; isset($used[$id]); $n++) {
                $id = "{$base}-{$n}";
            }
            $used[$id] = true;
            $heading->setAttribute('id', $id);

            if ($level <= 3) {
                $toc[] = ['id' => $id, 'text' => $text, 'level' => $level];
            }
        }

        return $toc;
    }

    /** Images uploaded in the editor get their size, a small-screen variant and lazy loading. */
    private static function responsiveImages(DOMXPath $xpath, DOMElement $root): void
    {
        foreach ($xpath->query('.//img', $root) as $img) {
            /** @var DOMElement $img */
            $path = self::storagePath($img->getAttribute('data-id') ?: $img->getAttribute('src'));
            $img->removeAttribute('data-id');

            if ($path !== null) {
                $asset = ImageAsset::make($path, $img->getAttribute('alt'));
                if (isset($asset['src'])) {
                    $img->setAttribute('src', $asset['src']);
                    $img->setAttribute('width', (string) $asset['width']);
                    $img->setAttribute('height', (string) $asset['height']);
                    if (isset($asset['srcSet'])) {
                        $img->setAttribute('srcset', $asset['srcSet']);
                        $img->setAttribute('sizes', '(min-width: 1024px) 760px, 100vw');
                    }
                }
            }

            $img->setAttribute('loading', 'lazy');
            $img->setAttribute('decoding', 'async');
            if (! $img->hasAttribute('alt')) {
                $img->setAttribute('alt', '');
            }
        }
    }

    /** "blog/a.png", "/storage/blog/a.png" or "https://host/storage/blog/a.png" → "blog/a.png". */
    private static function storagePath(string $value): ?string
    {
        $value = trim($value);
        if ($value === '') {
            return null;
        }
        if (preg_match('#^(?:https?://[^/]+)?/storage/(.+)$#', $value, $m)) {
            return rawurldecode($m[1]);
        }

        return str_contains($value, '://') || str_starts_with($value, '/') ? null : $value;
    }

    private static function safeLinks(DOMXPath $xpath, DOMElement $root): void
    {
        $siteHost = parse_url(SiteContent::siteUrl(), PHP_URL_HOST);

        foreach ($xpath->query('.//a[@href]', $root) as $link) {
            /** @var DOMElement $link */
            if (preg_match('/^\s*(?:javascript|vbscript|data):/i', $link->getAttribute('href'))) {
                $link->removeAttribute('href');

                continue;
            }
            $host = parse_url($link->getAttribute('href'), PHP_URL_HOST);
            if ($host && $host !== $siteHost) {
                $link->setAttribute('target', '_blank');
                $link->setAttribute('rel', 'noopener noreferrer');
            } else {
                $link->removeAttribute('target');
            }
        }
    }

    /** Wide tables scroll inside their own box instead of widening the page. */
    private static function wrapTables(DOMDocument $dom, DOMXPath $xpath, DOMElement $root): void
    {
        foreach (iterator_to_array($xpath->query('.//table', $root)) as $table) {
            $wrap = $dom->createElement('div');
            $wrap->setAttribute('class', 'table-wrap');
            $table->parentNode->replaceChild($wrap, $table);
            $wrap->appendChild($table);
        }
    }

    private static function rename(DOMElement $el, string $tag): DOMElement
    {
        $new = $el->ownerDocument->createElement($tag);
        foreach (iterator_to_array($el->childNodes) as $child) {
            $new->appendChild($child);
        }
        $el->parentNode->replaceChild($new, $el);

        return $new;
    }
}
