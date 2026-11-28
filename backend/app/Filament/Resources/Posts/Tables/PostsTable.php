<?php

namespace App\Filament\Resources\Posts\Tables;

use App\Filament\Resources\Posts\PostResource;
use App\Models\Post;
use Filament\Actions\Action;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Collection;

class PostsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('published_at', 'desc')
            ->columns([
                ImageColumn::make('cover_image')
                    ->label('')
                    ->disk('public')
                    ->imageHeight(44),
                TextColumn::make('title')
                    ->searchable(['title', 'excerpt'])
                    ->sortable()
                    ->weight('medium')
                    ->wrap()
                    ->description(fn (Post $record): string => $record->category),
                TextColumn::make('status')
                    ->state(fn (Post $record): string => $record->status())
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => ucfirst($state))
                    ->color(fn (string $state): string => match ($state) {
                        Post::STATUS_PUBLISHED => 'success',
                        Post::STATUS_SCHEDULED => 'warning',
                        default => 'gray',
                    }),
                TextColumn::make('published_at')
                    ->label('Publish date')
                    ->date('j M Y')
                    ->sortable(),
                TextColumn::make('author.name')
                    ->label('Author')
                    ->toggleable(),
                TextColumn::make('reading_minutes')
                    ->label('Read')
                    ->suffix(' min')
                    ->alignEnd()
                    ->toggleable(isToggledHiddenByDefault: true),
                ToggleColumn::make('is_featured')->label('Featured'),
                TextColumn::make('updated_at')->label('Updated')->since()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('category')
                    ->options(fn () => Post::query()->distinct()->orderBy('category')->pluck('category', 'category')->all()),
                SelectFilter::make('author_id')
                    ->label('Author')
                    ->relationship('author', 'name'),
            ])
            ->recordActions([
                Action::make('website')
                    ->label(fn (Post $record): string => $record->isLive() ? 'View' : 'Preview')
                    ->icon(Heroicon::OutlinedArrowTopRightOnSquare)
                    ->color('gray')
                    ->url(fn (Post $record): string => PostResource::websiteUrl($record), shouldOpenInNewTab: true),
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    BulkAction::make('publish')
                        ->label('Publish')
                        ->icon(Heroicon::OutlinedCheckCircle)
                        ->requiresConfirmation()
                        ->modalDescription('Posts without a publish date go live now; posts with a future date stay scheduled.')
                        ->action(fn (Collection $records) => $records->each->update(['is_published' => true]))
                        ->deselectRecordsAfterCompletion(),
                    BulkAction::make('unpublish')
                        ->label('Move to drafts')
                        ->icon(Heroicon::OutlinedEyeSlash)
                        ->requiresConfirmation()
                        ->action(fn (Collection $records) => $records->each->update(['is_published' => false]))
                        ->deselectRecordsAfterCompletion(),
                    DeleteBulkAction::make(),
                ]),
            ])
            ->emptyStateHeading('No blog posts yet')
            ->emptyStateDescription('Write your first post. It stays a draft until you publish it.')
            ->emptyStateIcon(Heroicon::OutlinedNewspaper);
    }
}
