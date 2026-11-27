<?php

namespace App\Filament\Resources\TechnologyGroups\Schemas;

use App\Filament\Support\Fields;
use App\Models\TechnologyGroup;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class TechnologyGroupForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make()
                    ->columns(2)
                    ->columnSpanFull()
                    ->schema([
                        TextInput::make('label')
                            ->required()
                            ->maxLength(60)
                            ->unique(ignoreRecord: true)
                            ->helperText('Services refer to groups by this name ("Tools we use").'),
                        Select::make('slider_row')
                            ->label('Logo slider row')
                            ->options(TechnologyGroup::SLIDER_ROWS)
                            ->placeholder('Not in the slider')
                            ->helperText('Row of the scrolling logo slider under the home hero.'),
                        Fields::technologies('items')
                            ->label('Technologies')
                            ->required()
                            ->columnSpanFull(),
                    ]),
            ]);
    }
}
