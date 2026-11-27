<?php

namespace App\Filament\Resources\Services\Schemas;

use App\Filament\Support\Fields;
use App\Models\Service;
use App\Models\TechnologyGroup;
use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Group;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class ServiceForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(3)
            ->components([
                Group::make()->columnSpan(['lg' => 2])->schema([
                    Section::make('Service')
                        ->columns(2)
                        ->schema([
                            TextInput::make('title')
                                ->required()
                                ->maxLength(120)
                                ->live(onBlur: true)
                                ->afterStateUpdated(function (string $operation, ?string $state, Set $set): void {
                                    if ($operation === 'create') {
                                        $set('slug', Str::slug((string) $state));
                                    }
                                }),
                            TextInput::make('slug')
                                ->required()
                                ->maxLength(80)
                                ->alphaDash()
                                ->unique(ignoreRecord: true)
                                ->prefix('/services/')
                                ->helperText('Part of the page address. Changing it breaks existing links.'),
                            Textarea::make('summary')
                                ->required()
                                ->rows(2)
                                ->maxLength(300)
                                ->columnSpanFull()
                                ->helperText('One line for cards and the footer.'),
                            Textarea::make('outcome')
                                ->label('What you get')
                                ->required()
                                ->rows(2)
                                ->maxLength(300)
                                ->columnSpanFull(),
                        ]),
                    Section::make('What we offer')
                        ->schema([
                            Repeater::make('bullets')
                                ->hiddenLabel()
                                ->simple(TextInput::make('bullet')->required()->maxLength(120))
                                ->reorderableWithButtons()
                                ->defaultItems(1)
                                ->addActionLabel('Add item'),
                        ]),
                    Section::make('Example screenshot')
                        ->description('A screenshot from a real project that shows this service. Without one, the page shows the icon panel.')
                        ->columns(2)
                        ->schema([
                            Fields::image('example_image', 'services')->hiddenLabel()->columnSpanFull(),
                            Fields::alt('example_alt'),
                            Select::make('example_project_id')
                                ->label('From project')
                                ->relationship('exampleProject', 'title')
                                ->searchable()
                                ->preload()
                                ->helperText('Links the screenshot to that project.'),
                        ]),
                ]),
                Group::make()->columnSpan(['lg' => 1])->schema([
                    Section::make('Visibility')
                        ->schema([
                            Toggle::make('is_published')
                                ->label('Published')
                                ->default(true),
                        ]),
                    Section::make('Display')
                        ->schema([
                            Select::make('icon')
                                ->options(Service::ICONS)
                                ->required()
                                ->native(false),
                            CheckboxList::make('stack_groups')
                                ->label('Tools we use')
                                ->options(fn () => TechnologyGroup::query()->orderBy('sort')->pluck('label', 'label'))
                                ->helperText('Technology groups listed on the service page.'),
                        ]),
                ]),
            ]);
    }
}
