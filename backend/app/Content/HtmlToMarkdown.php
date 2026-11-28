<?php

namespace App\Content;

use DOMDocument;
use DOMElement;
use DOMNode;
use DOMText;

/**
 * Converts article HTML (the tags the blog editor produces) to Markdown, for "Copy article" in
 * the admin. Anything without a Markdown form (colours, alignment, details) keeps its text.
 */
final class HtmlToMarkdown
{
    public static function convert(string $html): string
    {
        if (trim($html) === '') {
            return '';
        }
        $dom = new DOMDocument('1.0', 'UTF-8');
        $previous = libxml_use_internal_errors(true);
        $dom->loadHTML('<?xml encoding="UTF-8"?><div id="md-root">'.$html.'</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        $root = $dom->getElementById('md-root') ?? $dom->documentElement;
        $markdown = self::blocks($root);

        return trim(preg_replace("/\n{3,}/", "\n\n", $markdown) ?? $markdown)."\n";
    }

    private static function blocks(DOMNode $node, string $indent = ''): string
    {
        $out = '';
        foreach ($node->childNodes as $child) {
            $out .= self::block($child, $indent);
        }

        return $out;
    }

    private static function block(DOMNode $node, string $indent): string
    {
        if ($node instanceof DOMText) {
            $text = self::collapse($node->textContent);

            return trim($text) === '' ? '' : $text;
        }
        if (! $node instanceof DOMElement) {
            return '';
        }

        $tag = strtolower($node->nodeName);

        return match (true) {
            in_array($tag, ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'], true) => "\n\n".str_repeat('#', max(2, (int) $tag[1])).' '.trim(self::inline($node))."\n\n",
            $tag === 'p' => "\n\n".trim(self::inline($node))."\n\n",
            $tag === 'blockquote' => "\n\n".self::quote(trim(self::blocks($node)))."\n\n",
            $tag === 'pre' => "\n\n```\n".rtrim($node->textContent)."\n```\n\n",
            $tag === 'ul', $tag === 'ol' => "\n\n".self::listItems($node, $tag === 'ol', $indent)."\n",
            $tag === 'hr' => "\n\n---\n\n",
            $tag === 'img' => "\n\n".self::image($node)."\n\n",
            $tag === 'table' => "\n\n".self::table($node)."\n\n",
            $tag === 'details' => "\n\n".self::details($node)."\n\n",
            in_array($tag, ['div', 'section', 'figure', 'figcaption', 'aside', 'tbody', 'thead'], true) => self::blocks($node, $indent),
            default => self::inline($node),
        };
    }

    private static function inline(DOMNode $node): string
    {
        $out = '';
        foreach ($node->childNodes as $child) {
            if ($child instanceof DOMText) {
                $out .= self::escape(self::collapse($child->textContent));

                continue;
            }
            if (! $child instanceof DOMElement) {
                continue;
            }
            $inner = self::inline($child);
            $out .= match (strtolower($child->nodeName)) {
                'strong', 'b' => self::wrap($inner, '**'),
                'em', 'i' => self::wrap($inner, '_'),
                's', 'del', 'strike' => self::wrap($inner, '~~'),
                'code' => '`'.str_replace('`', '\\`', $child->textContent).'`',
                'a' => $child->getAttribute('href') !== '' ? "[{$inner}](".$child->getAttribute('href').')' : $inner,
                'br' => "  \n",
                'img' => self::image($child),
                default => $inner,
            };
        }

        return $out;
    }

    private static function listItems(DOMElement $list, bool $ordered, string $indent): string
    {
        $out = '';
        $n = (int) ($list->getAttribute('start') ?: 1);
        foreach ($list->childNodes as $item) {
            if (! $item instanceof DOMElement || strtolower($item->nodeName) !== 'li') {
                continue;
            }
            $marker = $ordered ? ($n++).'. ' : '- ';
            $text = '';
            $nested = '';
            foreach ($item->childNodes as $child) {
                $name = $child instanceof DOMElement ? strtolower($child->nodeName) : '';
                if ($name === 'ul' || $name === 'ol') {
                    $nested .= self::listItems($child, $name === 'ol', $indent.'   ');
                } elseif ($name === 'p') {
                    $text .= ($text === '' ? '' : ' ').trim(self::inline($child));
                } else {
                    $text .= $child instanceof DOMText ? self::escape(self::collapse($child->textContent)) : self::inline($child);
                }
            }
            $out .= $indent.$marker.trim($text)."\n".$nested;
        }

        return $out;
    }

    private static function table(DOMElement $table): string
    {
        $rows = [];
        foreach ($table->getElementsByTagName('tr') as $tr) {
            $cells = [];
            foreach ($tr->childNodes as $cell) {
                if ($cell instanceof DOMElement && in_array(strtolower($cell->nodeName), ['td', 'th'], true)) {
                    $cells[] = str_replace('|', '\\|', trim(self::inline($cell)) ?: trim(self::collapse($cell->textContent)));
                }
            }
            if ($cells !== []) {
                $rows[] = $cells;
            }
        }
        if ($rows === []) {
            return '';
        }
        $width = max(array_map('count', $rows));
        $line = fn (array $cells) => '| '.implode(' | ', array_pad($cells, $width, '')).' |';

        return implode("\n", [$line($rows[0]), '|'.str_repeat(' --- |', $width), ...array_map($line, array_slice($rows, 1))]);
    }

    private static function details(DOMElement $details): string
    {
        $summary = '';
        $body = '';
        foreach ($details->childNodes as $child) {
            if ($child instanceof DOMElement && strtolower($child->nodeName) === 'summary') {
                $summary = trim(self::inline($child));
            } else {
                $body .= self::block($child, '');
            }
        }

        return "**{$summary}**\n\n".trim($body);
    }

    private static function image(DOMElement $img): string
    {
        return '!['.str_replace(['[', ']'], '', $img->getAttribute('alt')).']('.$img->getAttribute('src').')';
    }

    private static function quote(string $text): string
    {
        return implode("\n", array_map(fn ($l) => rtrim('> '.$l), explode("\n", $text)));
    }

    private static function wrap(string $text, string $mark): string
    {
        $trimmed = trim($text);

        return $trimmed === '' ? $text : str_replace($trimmed, $mark.$trimmed.$mark, $text);
    }

    private static function collapse(string $text): string
    {
        return preg_replace('/\s+/u', ' ', $text) ?? $text;
    }

    private static function escape(string $text): string
    {
        return preg_replace('/([\\\\`*_\[\]])/', '\\\\$1', $text) ?? $text;
    }
}
