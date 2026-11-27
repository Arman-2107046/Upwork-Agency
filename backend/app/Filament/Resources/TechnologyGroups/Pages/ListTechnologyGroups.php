<?php

namespace App\Filament\Resources\TechnologyGroups\Pages;

use App\Filament\Resources\TechnologyGroups\TechnologyGroupResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListTechnologyGroups extends ListRecords
{
    protected static string $resource = TechnologyGroupResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
