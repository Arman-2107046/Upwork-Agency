<?php

namespace App\Filament\Pages;

use BackedEnum;
use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

class ManageSite extends SettingsPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCog6Tooth;

    protected static string|UnitEnum|null $navigationGroup = 'Settings';

    protected static ?string $navigationLabel = 'Site settings';

    protected static ?string $title = 'Site settings';

    protected static ?int $navigationSort = 1;

    protected static ?string $slug = 'settings/site';

    protected static function settingsKey(): string
    {
        return 'site';
    }

    protected function fields(): array
    {
        return [
            Section::make('Brand')
                ->columns(2)
                ->schema([
                    TextInput::make('brand_name')->required()->maxLength(80),
                    TextInput::make('short_name')->required()->maxLength(40)
                        ->helperText('Used where space is tight.'),
                    TextInput::make('handle')->required()->maxLength(40)
                        ->helperText('Terminal-style prompt above page headings, e.g. kernel@labs.'),
                    ColorPicker::make('theme_color')->required()
                        ->helperText('Browser bar color on mobile.'),
                    TextInput::make('tagline')->required()->maxLength(160)->columnSpanFull(),
                    Textarea::make('description')->required()->rows(3)->maxLength(500)->columnSpanFull()
                        ->helperText('Used in search results and structured data for the organization.'),
                ]),
            Section::make('Contact')
                ->columns(2)
                ->schema([
                    TextInput::make('email')->label('Public email')->email()->maxLength(254)
                        ->helperText('Shown in the footer and on the contact page. Leave empty to hide.'),
                    TextInput::make('notify_email')->label('Notification email')->email()->maxLength(254)
                        ->helperText('Contact form messages are emailed here. Defaults to the public email.'),
                    TextInput::make('upwork_url')->label('Upwork profile URL')->url()->maxLength(255)
                        ->helperText('Leave empty to hide Upwork links.'),
                    TextInput::make('response_time')->required()->maxLength(60)
                        ->helperText('Completes "We reply …", e.g. "within 24 hours".'),
                    Repeater::make('social')
                        ->label('Social links')
                        ->schema([
                            TextInput::make('label')->required()->maxLength(40),
                            TextInput::make('href')->label('URL')->url()->required()->maxLength(255),
                        ])
                        ->columns(2)
                        ->defaultItems(0)
                        ->reorderableWithButtons()
                        ->addActionLabel('Add social link')
                        ->columnSpanFull(),
                ]),
            Section::make('Claims')
                ->description('Claims appear in the hero, the About page and "Why us". Turn one off to hide it everywhere.')
                ->columns(2)
                ->schema([
                    TextInput::make('years_experience')->label('Years of experience')->maxLength(10)
                        ->helperText('For example 17+. Leave empty to hide.'),
                    Toggle::make('upwork_badge')->label('Show "Established Upwork agency"')->inline(false),
                ]),
        ];
    }
}
