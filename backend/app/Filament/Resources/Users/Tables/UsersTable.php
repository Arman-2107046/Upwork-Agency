<?php

namespace App\Filament\Resources\Users\Tables;

use App\Models\User;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;

class UsersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->searchable()->weight('medium'),
                TextColumn::make('email')->searchable()->copyable(),
                TextColumn::make('created_at')->label('Added')->date()->sortable(),
            ])
            ->recordActions([
                EditAction::make(),
                // Nobody can delete their own account, so the admin can never be left without a user.
                DeleteAction::make()->hidden(fn (User $record): bool => $record->is(Auth::user())),
            ]);
    }
}
