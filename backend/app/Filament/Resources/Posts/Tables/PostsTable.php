<?php

namespace App\Filament\Resources\Posts\Tables;

use App\Content\PostPayload;
use App\Filament\Resources\Posts\PostExport;
use App\Filament\Resources\Posts\PostResource;
use App\Filament\Support\Access;
use App\Models\Post;
use Filament\Actions\Action;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Radio;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class PostsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query) => $query
                ->with(['category', 'author'])
                ->withCount(['likes', 'comments' => fn ($q) => $q->approved()]))
            ->defaultSort('created_at', 'desc')
            ->persistSearchInSession()
            ->persistFiltersInSession()
            ->persistSortInSession()
            ->searchPlaceholder('Search title, address or ID')
            ->columns([
                TextColumn::make('id')
                    ->label('ID')
                    ->sortable()
                    ->color('gray')
                    ->searchable(query: fn (Builder $query, string $search) => ctype_digit($search) ? $query->orWhere('posts.id', (int) $search) : $query),
                ImageColumn::make('thumbnail')
                    ->label('')
                    ->state(fn (Post $record): ?string => PostPayload::cover($record)['src'] ?? null)
                    ->imageHeight(40)
                    ->imageWidth(64)
                    ->extraImgAttributes(['style' => 'object-fit: cover; border-radius: .375rem']),
                TextColumn::make('title')
                    ->searchable(['title', 'slug'])
                    ->sortable()
                    ->weight('medium')
                    ->wrap()
                    ->color(fn (Post $record): ?string => $record->isLive() ? 'success' : null)
                    ->url(fn (Post $record): string => Access::canWrite() ? PostResource::getUrl('edit', ['record' => $record]) : PostResource::getUrl('view', ['record' => $record])),
                TextColumn::make('category.name')
                    ->label('Category')
                    ->badge()
                    ->color('gray'),
                TextColumn::make('author.name')
                    ->label('Author')
                    ->toggleable(),
                TextColumn::make('created_at')
                    ->label('Created')
                    ->date('Y-m-d')
                    ->sortable(),
                TextColumn::make('status')
                    ->state(fn (Post $record): string => $record->status())
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => ucfirst($state))
                    ->color(fn (string $state): string => match ($state) {
                        Post::STATUS_PUBLISHED => 'success',
                        Post::STATUS_SCHEDULED => 'warning',
                        default => 'gray',
                    }),
                IconColumn::make('is_featured')
                    ->label('Featured')
                    ->alignCenter()
                    ->icon(fn (bool $state) => $state ? Heroicon::Star : Heroicon::OutlinedStar)
                    ->color(fn (bool $state): string => $state ? 'warning' : 'gray')
                    ->tooltip(fn (Post $record): string => $record->is_featured ? 'Featured. Click to unfeature.' : 'Click to feature')
                    ->action(fn (Post $record) => Access::canWrite() ? $record->update(['is_featured' => ! $record->is_featured]) : null),
                TextColumn::make('published_at')
                    ->label('Published at')
                    ->dateTime('Y-m-d H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('views')
                    ->numeric()
                    ->alignEnd()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('likes_count')
                    ->label('Likes')
                    ->numeric()
                    ->alignEnd()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('comments_count')
                    ->label('Comments')
                    ->numeric()
                    ->alignEnd()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        Post::STATUS_PUBLISHED => 'Published',
                        Post::STATUS_SCHEDULED => 'Scheduled',
                        Post::STATUS_DRAFT => 'Draft',
                    ])
                    ->query(fn (Builder $query, array $data) => match ($data['value'] ?? null) {
                        Post::STATUS_PUBLISHED => $query->where('is_published', true)->where('published_at', '<=', now()),
                        Post::STATUS_SCHEDULED => $query->where('is_published', true)->where('published_at', '>', now()),
                        Post::STATUS_DRAFT => $query->where('is_published', false),
                        default => $query,
                    }),
                SelectFilter::make('category_id')
                    ->label('Category')
                    ->relationship('category', 'name', fn ($query) => $query->ordered())
                    ->preload(),
                SelectFilter::make('author_id')
                    ->label('Author')
                    ->relationship('author', 'name'),
            ])
            ->recordActions([
                Action::make('website')
                    ->label('View on blog')
                    ->icon(Heroicon::OutlinedArrowTopRightOnSquare)
                    ->color('gray')
                    ->visible(fn (Post $record): bool => $record->isLive())
                    ->url(fn (Post $record): string => PostResource::websiteUrl($record), shouldOpenInNewTab: true),
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    BulkAction::make('publish')
                        ->label('Publish')
                        ->icon(Heroicon::OutlinedCheckCircle)
                        ->visible(fn (): bool => Access::canWrite())
                        ->requiresConfirmation()
                        ->modalDescription('Posts without a publish date go live now; posts with a future date stay scheduled.')
                        ->action(fn (Collection $records) => $records->each->update(['is_published' => true]))
                        ->deselectRecordsAfterCompletion(),
                    BulkAction::make('unpublish')
                        ->label('Move to drafts')
                        ->icon(Heroicon::OutlinedEyeSlash)
                        ->visible(fn (): bool => Access::canWrite())
                        ->requiresConfirmation()
                        ->action(fn (Collection $records) => $records->each->update(['is_published' => false]))
                        ->deselectRecordsAfterCompletion(),
                    BulkAction::make('export')
                        ->label('Export selected')
                        ->icon(Heroicon::OutlinedArrowDownTray)
                        ->schema([self::formatField()])
                        ->modalSubmitActionLabel('Download')
                        ->action(fn (Collection $records, array $data) => PostExport::download($records, $data['format']))
                        ->deselectRecordsAfterCompletion(),
                    DeleteBulkAction::make(),
                ]),
            ])
            ->emptyStateHeading('No posts yet')
            ->emptyStateDescription('Write your first post. It stays a draft until you publish it.')
            ->emptyStateIcon(Heroicon::OutlinedNewspaper);
    }

    public static function formatField(): Radio
    {
        return Radio::make('format')
            ->label('Format')
            ->options(['xlsx' => 'Excel (.xlsx)', 'csv' => 'CSV'])
            ->default('xlsx')
            ->required();
    }
}
