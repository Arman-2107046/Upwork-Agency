<?php

namespace App\Filament\Resources\TechnologyGroups;

use App\Filament\Resources\TechnologyGroups\Pages\CreateTechnologyGroup;
use App\Filament\Resources\TechnologyGroups\Pages\EditTechnologyGroup;
use App\Filament\Resources\TechnologyGroups\Pages\ListTechnologyGroups;
use App\Filament\Resources\TechnologyGroups\Schemas\TechnologyGroupForm;
use App\Filament\Resources\TechnologyGroups\Tables\TechnologyGroupsTable;
use App\Models\TechnologyGroup;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class TechnologyGroupResource extends Resource
{
    protected static ?string $model = TechnologyGroup::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCpuChip;

    protected static string|UnitEnum|null $navigationGroup = 'Content';

    protected static ?int $navigationSort = 3;

    protected static ?string $recordTitleAttribute = 'label';

    protected static ?string $navigationLabel = 'Technologies';

    protected static ?string $modelLabel = 'technology group';

    public static function form(Schema $schema): Schema
    {
        return TechnologyGroupForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return TechnologyGroupsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListTechnologyGroups::route('/'),
            'create' => CreateTechnologyGroup::route('/create'),
            'edit' => EditTechnologyGroup::route('/{record}/edit'),
        ];
    }
}
