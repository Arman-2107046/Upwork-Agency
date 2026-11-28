<?php

namespace App\Filament\Resources\TechnologyGroups\Pages;

use App\Filament\Resources\TechnologyGroups\TechnologyGroupResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

/** Read-only page for team members who can look but not change (the viewer role). */
class ViewTechnologyGroup extends ViewRecord
{
    protected static string $resource = TechnologyGroupResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
