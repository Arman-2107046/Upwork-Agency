<?php

namespace App\Filament\Resources\ContactMessages\Schemas;

use App\Models\ContactMessage;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class ContactMessageInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(3)
            ->components([
                Section::make('Message')
                    ->columnSpan(['lg' => 2])
                    ->schema([
                        TextEntry::make('message')
                            ->hiddenLabel()
                            ->prose()
                            ->formatStateUsing(fn (string $state): string => nl2br(e($state)))
                            ->html(),
                    ]),
                Section::make('From')
                    ->columnSpan(['lg' => 1])
                    ->schema([
                        TextEntry::make('name'),
                        TextEntry::make('email')
                            ->copyable()
                            ->url(fn (ContactMessage $record): string => "mailto:{$record->email}"),
                        TextEntry::make('company')->placeholder('Not given'),
                        TextEntry::make('service')->placeholder('Not sure / several'),
                        TextEntry::make('budget')->placeholder('Not given'),
                        TextEntry::make('created_at')->label('Received')->dateTime()->since(),
                        TextEntry::make('ip_address')->label('IP address')->placeholder('Unknown')->color('gray'),
                    ]),
            ]);
    }
}
