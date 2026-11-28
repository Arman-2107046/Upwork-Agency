<?php

namespace App\Filament\Resources\Posts;

use App\Content\SiteContent;
use App\Models\Post;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

/** Blog posts as a CSV or Excel download (Blog posts › Export). */
final class PostExport
{
    public const COLUMNS = [
        'ID', 'Title', 'Address', 'URL', 'Status', 'Publish date', 'Category', 'Tags', 'Author',
        'Featured', 'Views', 'Likes', 'Comments', 'Reading minutes', 'Excerpt', 'Created', 'Updated',
    ];

    /** @param Builder<Post>|Collection<int, Post> $posts */
    public static function download(Builder|Collection $posts, string $format): StreamedResponse|BinaryFileResponse
    {
        $ids = $posts instanceof Builder ? $posts->pluck('posts.id') : $posts->pluck('id');
        $rows = Post::query()->whereIn('id', $ids)
            ->with(['category', 'author'])
            ->withCount(['likes', 'comments' => fn ($q) => $q->approved()])
            ->orderByDesc('id')
            ->get()
            ->map(fn (Post $post) => self::row($post));
        $name = 'blog-posts-'.now()->format('Y-m-d');

        if ($format === 'xlsx') {
            $file = tempnam(sys_get_temp_dir(), 'posts').'.xlsx';
            $writer = new Writer;
            $writer->openToFile($file);
            $writer->addRow(Row::fromValues(self::COLUMNS));
            foreach ($rows as $row) {
                $writer->addRow(Row::fromValues($row));
            }
            $writer->close();

            return response()->download($file, "{$name}.xlsx")->deleteFileAfterSend();
        }

        return response()->streamDownload(function () use ($rows): void {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // UTF-8 BOM, so Excel reads accents correctly.
            fputcsv($out, self::COLUMNS, escape: '');
            foreach ($rows as $row) {
                fputcsv($out, $row, escape: '');
            }
            fclose($out);
        }, "{$name}.csv", ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /** @return list<string|int> */
    private static function row(Post $post): array
    {
        return [
            $post->id,
            $post->title,
            $post->slug,
            SiteContent::siteUrl()."/blog/{$post->slug}",
            ucfirst($post->status()),
            $post->published_at?->format('Y-m-d H:i') ?? '',
            $post->category?->name ?? '',
            implode(', ', $post->tags ?? []),
            $post->author?->name ?? '',
            $post->is_featured ? 'Yes' : 'No',
            $post->views,
            (int) $post->likes_count,
            (int) $post->comments_count,
            $post->reading_minutes,
            $post->excerpt,
            $post->created_at?->format('Y-m-d H:i') ?? '',
            $post->updated_at?->format('Y-m-d H:i') ?? '',
        ];
    }
}
