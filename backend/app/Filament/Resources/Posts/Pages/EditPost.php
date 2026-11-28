<?php

namespace App\Filament\Resources\Posts\Pages;

use App\Content\CopyArticle;
use App\Filament\Resources\Posts\PostResource;
use App\Models\Post;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;
use Filament\Support\Enums\Width;
use Filament\Support\Icons\Heroicon;

class EditPost extends EditRecord
{
    protected static string $resource = PostResource::class;

    protected Width|string|null $maxContentWidth = Width::Full;

    protected function getHeaderActions(): array
    {
        return [
            self::copyArticleAction(),
            Action::make('website')
                ->label(fn (Post $record): string => $record->isLive() ? 'View on blog' : 'Preview')
                ->icon(Heroicon::OutlinedArrowTopRightOnSquare)
                ->color('gray')
                ->url(fn (Post $record): string => PostResource::websiteUrl($record), shouldOpenInNewTab: true),
            $this->getSaveFormAction()->formId('form')->keyBindings(['mod+s']),
            DeleteAction::make(),
        ];
    }

    /** The Publish panel has the save buttons. */
    protected function getFormActions(): array
    {
        return [];
    }

    public static function copyArticleAction(): Action
    {
        return Action::make('copyArticle')
            ->label('Copy article')
            ->icon(Heroicon::OutlinedClipboardDocument)
            ->color('gray')
            ->modalHeading('Copy article')
            ->modalDescription('Paste this post into another site or tool.')
            ->modalWidth(Width::TwoExtraLarge)
            ->modalContent(fn ($livewire) => view('admin.posts.copy-article', isset($livewire->data) && is_array($livewire->data)
                ? CopyArticle::from($livewire->data)
                : CopyArticle::fromPost($livewire->getRecord())))
            ->modalSubmitAction(false)
            ->modalCancelActionLabel('Close');
    }
}
