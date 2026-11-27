<?php

namespace App\Filament\Pages;

use App\Filament\Support\Fields;
use BackedEnum;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

class ManageAbout extends SettingsPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedUserGroup;

    protected static string|UnitEnum|null $navigationGroup = 'Pages';

    protected static ?string $navigationLabel = 'About page';

    protected static ?string $title = 'About page';

    protected static ?int $navigationSort = 2;

    protected static ?string $slug = 'pages/about';

    protected static function settingsKey(): string
    {
        return 'about';
    }

    protected function fields(): array
    {
        return [
            Section::make('Who we are')->schema([
                Textarea::make('statement')->required()->rows(4)->maxLength(800)
                    ->helperText('The large statement at the top of the About page.'),
                TextInput::make('closing_line')->required()->maxLength(120)
                    ->helperText('Shown in the footer on every page.'),
            ]),
            Section::make('How we work')->schema([
                Fields::titledList('how_we_work', 'Add item')->hiddenLabel(),
            ]),
            Section::make('Team')->schema([
                Fields::titledList('team_roles', 'Add role')->hiddenLabel(),
            ]),
        ];
    }
}
