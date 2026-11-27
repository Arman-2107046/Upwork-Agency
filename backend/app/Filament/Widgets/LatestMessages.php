<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\ContactMessages\ContactMessageResource;
use App\Models\ContactMessage;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;

class LatestMessages extends TableWidget
{
    protected static ?int $sort = 2;

    protected int|string|array $columnSpan = 'full';

    protected static ?string $heading = 'Latest messages';

    public function table(Table $table): Table
    {
        return $table
            ->query(ContactMessage::query()->latest()->limit(5))
            ->paginated(false)
            ->recordUrl(fn (ContactMessage $record): string => ContactMessageResource::getUrl('view', ['record' => $record]))
            ->emptyStateHeading('No messages yet')
            ->emptyStateDescription('Enquiries from the website contact form appear here.')
            ->columns([
                TextColumn::make('name')
                    ->weight(fn (ContactMessage $record): string => $record->read_at ? 'normal' : 'bold')
                    ->description(fn (ContactMessage $record): string => $record->email),
                TextColumn::make('message')->limit(90)->color('gray'),
                TextColumn::make('created_at')->label('Received')->since(),
            ]);
    }
}
