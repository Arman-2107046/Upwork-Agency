<?php

namespace App\Filament\Resources\PostComments;

use App\Filament\Resources\PostComments\Pages\ListPostComments;
use App\Filament\Support\Access;
use App\Models\PostComment;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;
use UnitEnum;

/** Readers' comments on blog posts. They show on the website once approved; the team only moderates. */
class PostCommentResource extends Resource
{
    protected static ?string $model = PostComment::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedChatBubbleLeftEllipsis;

    protected static string|UnitEnum|null $navigationGroup = 'Inbox';

    protected static ?string $navigationLabel = 'Comments';

    protected static ?string $modelLabel = 'comment';

    protected static ?int $navigationSort = 2;

    protected static ?string $slug = 'comments';

    public static function getNavigationBadge(): ?string
    {
        $pending = PostComment::query()->where('status', PostComment::PENDING)->count();

        return $pending > 0 ? (string) $pending : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function getNavigationBadgeTooltip(): ?string
    {
        return 'Waiting for approval';
    }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn ($query) => $query->with('post'))
            ->defaultSort('created_at', 'desc')
            ->columns([
                TextColumn::make('name')
                    ->weight('medium')
                    ->description(fn (PostComment $record): string => $record->email)
                    ->searchable(['name', 'email']),
                TextColumn::make('body')
                    ->label('Comment')
                    ->formatStateUsing(fn (string $state): string => Str::limit($state, 160))
                    ->tooltip(fn (PostComment $record): ?string => Str::length($record->body) > 160 ? $record->body : null)
                    ->wrap()
                    ->searchable(),
                TextColumn::make('post.title')
                    ->label('On')
                    ->limit(48)
                    ->url(fn (PostComment $record): ?string => $record->post?->isLive() ? "/blog/{$record->post->slug}#comments" : null, shouldOpenInNewTab: true)
                    ->color('primary'),
                TextColumn::make('status')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => PostComment::STATUSES[$state] ?? $state)
                    ->color(fn (string $state): string => match ($state) {
                        PostComment::APPROVED => 'success',
                        PostComment::PENDING => 'warning',
                        default => 'gray',
                    }),
                TextColumn::make('created_at')
                    ->label('Posted')
                    ->since()
                    ->dateTimeTooltip('j M Y, H:i')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options(PostComment::STATUSES)
                    ->default(PostComment::PENDING),
                SelectFilter::make('post_id')
                    ->label('Post')
                    ->relationship('post', 'title')
                    ->searchable()
                    ->preload(),
            ])
            ->recordActions([
                self::moderate(Action::make('approve'), PostComment::APPROVED, 'Approve', Heroicon::OutlinedCheck, 'success'),
                self::moderate(Action::make('hide'), PostComment::HIDDEN, 'Hide', Heroicon::OutlinedEyeSlash, 'gray'),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    self::moderate(BulkAction::make('approveSelected'), PostComment::APPROVED, 'Approve', Heroicon::OutlinedCheck, 'success'),
                    self::moderate(BulkAction::make('hideSelected'), PostComment::HIDDEN, 'Hide', Heroicon::OutlinedEyeSlash, 'gray'),
                    DeleteBulkAction::make(),
                ]),
            ])
            ->emptyStateHeading('No comments here')
            ->emptyStateDescription('New comments wait here for approval before they appear on the blog.')
            ->emptyStateIcon(Heroicon::OutlinedChatBubbleLeftEllipsis);
    }

    private static function moderate(Action|BulkAction $action, string $status, string $label, Heroicon $icon, string $color): Action|BulkAction
    {
        $action->label($label)->icon($icon)->color($color)->visible(fn (): bool => Access::canWrite());

        if ($action instanceof BulkAction) {
            return $action
                ->action(fn (Collection $records) => $records->each->update(['status' => $status]))
                ->deselectRecordsAfterCompletion();
        }

        return $action
            ->hidden(fn (PostComment $record): bool => ! Access::canWrite() || $record->status === $status)
            ->action(fn (PostComment $record) => $record->update(['status' => $status]));
    }

    public static function getPages(): array
    {
        return [
            'index' => ListPostComments::route('/'),
        ];
    }
}
