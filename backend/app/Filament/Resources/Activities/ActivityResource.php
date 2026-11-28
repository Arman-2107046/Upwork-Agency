<?php

namespace App\Filament\Resources\Activities;

use App\Filament\Resources\Activities\Pages\ListActivities;
use App\Models\Activity;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Support\Str;
use UnitEnum;

/** Every change made in the admin: who, when, which record and which fields. Read-only. */
class ActivityResource extends Resource
{
    protected static ?string $model = Activity::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedClock;

    protected static string|UnitEnum|null $navigationGroup = 'Settings';

    protected static ?string $navigationLabel = 'Activity log';

    protected static ?string $modelLabel = 'activity';

    protected static ?string $pluralModelLabel = 'activity log';

    protected static ?int $navigationSort = 4;

    protected static ?string $slug = 'activity';

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn ($query) => $query->with('user'))
            ->defaultSort('id', 'desc')
            ->columns([
                TextColumn::make('created_at')
                    ->label('When')
                    ->since()
                    ->dateTimeTooltip('j M Y, H:i:s')
                    ->sortable(),
                TextColumn::make('user.name')
                    ->label('Who')
                    ->placeholder('System'),
                TextColumn::make('event')
                    ->label('Action')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => ucfirst($state))
                    ->color(fn (string $state): string => match ($state) {
                        'created' => 'success',
                        'deleted' => 'danger',
                        default => 'gray',
                    }),
                TextColumn::make('subject_label')
                    ->label('What')
                    ->description(fn (Activity $record): string => Str::headline($record->subject_type))
                    ->wrap()
                    ->searchable(),
                TextColumn::make('changes')
                    ->label('Changes')
                    ->state(fn (Activity $record): ?string => self::describe($record->changes))
                    ->wrap()
                    ->placeholder('—'),
            ])
            ->filters([
                SelectFilter::make('user_id')->label('Who')->relationship('user', 'name'),
                SelectFilter::make('subject_type')
                    ->label('Type')
                    ->options(fn () => Activity::query()->distinct()->orderBy('subject_type')->pluck('subject_type')
                        ->mapWithKeys(fn ($t) => [$t => Str::headline($t)])->all()),
                SelectFilter::make('event')->label('Action')->options(['created' => 'Created', 'updated' => 'Updated', 'deleted' => 'Deleted']),
            ])
            ->emptyStateHeading('Nothing changed yet')
            ->emptyStateIcon(Heroicon::OutlinedClock);
    }

    /** "Title: Old → New · Body changed" @param array<string, mixed>|null $changes */
    public static function describe(?array $changes): ?string
    {
        if (! $changes) {
            return null;
        }

        return collect($changes)->map(function ($change, string $field): string {
            $label = Str::headline($field);
            if (isset($change['changed'])) {
                return is_array($change['changed']) && $change['changed'] !== []
                    ? "{$label}: ".implode(', ', array_map(Str::headline(...), $change['changed']))
                    : "{$label} changed";
            }
            $show = fn ($v) => match (true) {
                $v === null || $v === '' => '(empty)',
                is_bool($v) => $v ? 'on' : 'off',
                default => Str::limit((string) $v, 60),
            };

            return "{$label}: {$show($change['from'] ?? null)} → {$show($change['to'] ?? null)}";
        })->implode(' · ');
    }

    public static function getPages(): array
    {
        return [
            'index' => ListActivities::route('/'),
        ];
    }
}
