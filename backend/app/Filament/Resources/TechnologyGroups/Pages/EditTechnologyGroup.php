<?php

namespace App\Filament\Resources\TechnologyGroups\Pages;

use App\Filament\Resources\TechnologyGroups\TechnologyGroupResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditTechnologyGroup extends EditRecord
{
    protected static string $resource = TechnologyGroupResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
