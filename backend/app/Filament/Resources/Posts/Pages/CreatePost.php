<?php

namespace App\Filament\Resources\Posts\Pages;

use App\Filament\Resources\Posts\PostResource;
use Filament\Resources\Pages\CreateRecord;
use Filament\Support\Enums\Width;

class CreatePost extends CreateRecord
{
    protected static string $resource = PostResource::class;

    protected static ?string $title = 'Write a post';

    protected Width|string|null $maxContentWidth = Width::Full;

    /** The Publish panel has Create and Cancel. */
    protected function getFormActions(): array
    {
        return [];
    }

    /** Stay in the editor after the first save. */
    protected function getRedirectUrl(): string
    {
        return static::getResource()::getUrl('edit', ['record' => $this->getRecord()]);
    }
}
