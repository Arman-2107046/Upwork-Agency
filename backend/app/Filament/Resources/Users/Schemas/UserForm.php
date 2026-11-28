<?php

namespace App\Filament\Resources\Users\Schemas;

use App\Filament\Support\Fields;
use App\Models\User;
use Filament\Forms\Components\Radio;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make()
                    ->columns(2)
                    ->columnSpanFull()
                    ->schema([
                        TextInput::make('name')->required()->maxLength(120),
                        TextInput::make('email')->email()->required()->maxLength(254)->unique(ignoreRecord: true),
                        TextInput::make('password')
                            ->password()
                            ->revealable()
                            ->rule(Password::default())
                            ->required(fn (string $operation): bool => $operation === 'create')
                            ->dehydrated(fn (?string $state): bool => filled($state))
                            ->confirmed()
                            ->helperText(fn (string $operation): ?string => $operation === 'edit' ? 'Leave empty to keep the current password.' : null),
                        TextInput::make('password_confirmation')
                            ->label('Confirm password')
                            ->password()
                            ->revealable()
                            ->required(fn (string $operation): bool => $operation === 'create')
                            ->dehydrated(false),
                    ]),
                Section::make('Role')
                    ->columnSpanFull()
                    ->schema([
                        Radio::make('role')
                            ->hiddenLabel()
                            ->options(User::ROLES)
                            ->descriptions(User::ROLE_DESCRIPTIONS)
                            ->default(User::EDITOR)
                            ->required()
                            // Nobody changes their own role, so the admin always keeps an admin.
                            ->disabled(fn (?User $record): bool => $record?->is(Auth::user()) ?? false)
                            ->helperText(fn (?User $record): ?string => $record?->is(Auth::user()) ? 'You cannot change your own role.' : null),
                    ]),
                Section::make('Author profile')
                    ->description('Shown on the blog posts this person writes.')
                    ->columns(2)
                    ->columnSpanFull()
                    ->schema([
                        TextInput::make('job_title')
                            ->label('Role')
                            ->maxLength(80)
                            ->placeholder('e.g. Lead Backend Developer'),
                        Fields::image('avatar', 'authors')
                            ->label('Photo')
                            ->avatar()
                            ->imageEditor()
                            ->helperText('Square, at least 400 × 400 px. Initials are shown without a photo.'),
                        Textarea::make('bio')
                            ->rows(3)
                            ->maxLength(500)
                            ->columnSpanFull()
                            ->helperText('One or two sentences, shown at the end of each post.'),
                    ]),
            ]);
    }
}
