<?php

namespace App\Filament\Resources\Users\Tables;

use App\Models\User;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class UsersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->searchable()->weight('medium'),
                TextColumn::make('email')->searchable()->copyable(),
                TextColumn::make('role')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => User::ROLES[$state] ?? $state)
                    ->color(fn (string $state): string => match ($state) {
                        User::ADMIN => 'primary',
                        User::EDITOR => 'success',
                        default => 'gray',
                    }),
                TextColumn::make('created_at')->label('Added')->date()->sortable(),
            ])
            ->recordActions([
                EditAction::make(),
                // Nobody can delete their own account (UserPolicy), so the admin is never left without a user.
                DeleteAction::make(),
            ]);
    }
}
