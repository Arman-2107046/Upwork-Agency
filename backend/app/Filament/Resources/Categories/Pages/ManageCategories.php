<?php

namespace App\Filament\Resources\Categories\Pages;

use App\Filament\Resources\Categories\CategoryResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;

class ManageCategories extends ManageRecords
{
    protected static string $resource = CategoryResource::class;

    protected ?string $subheading = 'Drag to set the order of the filters on the blog page. Each category with published posts gets its own page.';

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()->label('Add category'),
        ];
    }
}
