<?php

namespace App\Filament\Resources\Posts\Pages;

use App\Filament\Resources\Posts\PostExport;
use App\Filament\Resources\Posts\PostResource;
use App\Filament\Resources\Posts\Tables\PostsTable;
use App\Models\Post;
use Filament\Actions\Action;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Builder;

class ListPosts extends ListRecords
{
    protected static string $resource = PostResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('reload')
                ->label('Reload')
                ->icon(Heroicon::OutlinedArrowPath)
                ->color('gray')
                ->action(fn () => $this->resetTable()),
            Action::make('export')
                ->label('Export')
                ->icon(Heroicon::OutlinedArrowDownTray)
                ->color('gray')
                ->modalHeading('Export posts')
                ->modalDescription('Every post matching the current tab, search and filters.')
                ->schema([PostsTable::formatField()])
                ->modalSubmitActionLabel('Download')
                ->action(fn (array $data) => PostExport::download($this->getFilteredTableQuery()->clone(), $data['format'])),
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
