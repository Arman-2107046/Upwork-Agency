<?php

namespace App\Filament\Resources\Posts\Pages;

use App\Filament\Resources\Posts\PostResource;
use App\Models\Post;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Builder;

class ListPosts extends ListRecords
{
    protected static string $resource = PostResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()->label('Write a post'),
        ];
    }

    public function getTabs(): array
    {
        $published = fn (Builder $q) => $q->where('is_published', true)->where('published_at', '<=', now());
        $scheduled = fn (Builder $q) => $q->where('is_published', true)->where('published_at', '>', now());
        $drafts = fn (Builder $q) => $q->where('is_published', false);

        return [
            'all' => Tab::make('All'),
            'published' => Tab::make('Published')
                ->modifyQueryUsing($published)
                ->badge(fn () => $published(Post::query())->count() ?: null),
            'scheduled' => Tab::make('Scheduled')
                ->modifyQueryUsing($scheduled)
                ->badge(fn () => $scheduled(Post::query())->count() ?: null)
                ->badgeColor('warning'),
            'drafts' => Tab::make('Drafts')
                ->modifyQueryUsing($drafts)
                ->badge(fn () => $drafts(Post::query())->count() ?: null)
                ->badgeColor('gray'),
        ];
    }
}
