<?php

namespace App\Filament\Resources\ContactMessages\Tables;

use App\Models\ContactMessage;
use Filament\Actions\Action;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\ViewAction;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class ContactMessagesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->recordUrl(fn (ContactMessage $record): string => route('filament.admin.resources.contact-messages.view', $record))
            ->columns([
                IconColumn::make('read_at')
                    ->label('')
                    ->state(fn (ContactMessage $record): bool => $record->read_at === null)
                    ->icon(fn (bool $state) => $state ? Heroicon::Envelope : Heroicon::OutlinedEnvelopeOpen)
                    ->color(fn (bool $state): string => $state ? 'primary' : 'gray')
                    ->tooltip(fn (bool $state): string => $state ? 'Unread' : 'Read'),
                TextColumn::make('name')
                    ->searchable()
                    ->weight(fn (ContactMessage $record): string => $record->read_at ? 'normal' : 'bold')
                    ->description(fn (ContactMessage $record): string => $record->email),
                TextColumn::make('message')->limit(80)->color('gray')->searchable()->wrap(),
                TextColumn::make('service')->placeholder('Not specified')->toggleable(),
                TextColumn::make('budget')->placeholder('Not specified')->toggleable(),
                TextColumn::make('created_at')->label('Received')->since()->sortable()
                    ->dateTimeTooltip(),
            ])
            ->filters([
                TernaryFilter::make('read_at')
                    ->label('Status')
                    ->placeholder('All messages')
                    ->trueLabel('Read')
                    ->falseLabel('Unread')
                    ->queries(
                        true: fn (Builder $query) => $query->whereNotNull('read_at'),
                        false: fn (Builder $query) => $query->whereNull('read_at'),
                    ),
            ])
            ->recordActions([
                ViewAction::make(),
                Action::make('reply')
                    ->label('Reply')
                    ->icon(Heroicon::OutlinedArrowUturnLeft)
                    ->color('gray')
                    ->url(fn (ContactMessage $record): string => 'mailto:'.$record->email.'?subject='.rawurlencode('Re: your project enquiry')),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    BulkAction::make('markRead')
                        ->label('Mark as read')
                        ->icon(Heroicon::OutlinedEnvelopeOpen)
                        ->action(fn (Collection $records) => $records->each->markAsRead())
                        ->deselectRecordsAfterCompletion(),
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
