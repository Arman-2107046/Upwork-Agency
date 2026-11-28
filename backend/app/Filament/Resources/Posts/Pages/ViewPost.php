<?php

namespace App\Filament\Resources\Posts\Pages;

use App\Filament\Resources\Posts\PostResource;
use App\Models\Post;
use Filament\Actions\Action;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;
use Filament\Support\Enums\Width;
use Filament\Support\Icons\Heroicon;

/** Read-only page for team members who can look but not change (the viewer role). */
class ViewPost extends ViewRecord
{
    protected static string $resource = PostResource::class;

    protected Width|string|null $maxContentWidth = Width::Full;

    protected function getHeaderActions(): array
    {
        return [
            EditPost::copyArticleAction(),
            Action::make('website')
                ->label(fn (Post $record): string => $record->isLive() ? 'View on blog' : 'Preview')
                ->icon(Heroicon::OutlinedArrowTopRightOnSquare)
                ->color('gray')
                ->url(fn (Post $record): string => PostResource::websiteUrl($record), shouldOpenInNewTab: true),
            EditAction::make(),
        ];
    }
}
