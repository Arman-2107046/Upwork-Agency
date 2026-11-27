<?php

namespace App\Filament\Resources\TechnologyGroups\Tables;

use App\Models\TechnologyGroup;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class TechnologyGroupsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('sort')
            ->reorderable('sort')
            ->columns([
                TextColumn::make('label')->weight('medium')->searchable(),
                TextColumn::make('items')->label('Technologies')->badge()->color('gray'),
                TextColumn::make('slider_row')
                    ->label('Slider row')
                    ->formatStateUsing(fn (?int $state): string => TechnologyGroup::SLIDER_ROWS[$state] ?? '')
                    ->placeholder('Not shown'),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
