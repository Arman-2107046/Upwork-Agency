<?php

namespace App\Filament\Pages;

use App\Filament\Support\Fields;
use App\Models\Project;
use BackedEnum;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

class ManageHome extends SettingsPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedHome;

    protected static string|UnitEnum|null $navigationGroup = 'Pages';

    protected static ?string $navigationLabel = 'Home page';

    protected static ?string $title = 'Home page';

    protected static ?int $navigationSort = 1;

    protected static ?string $slug = 'pages/home';

    protected static function settingsKey(): string
    {
        return 'home';
    }

    protected function fields(): array
    {
        return [
            Tabs::make('Home')->persistTabInQueryString()->tabs([
                Tab::make('Hero')->schema([
                    TextInput::make('hero_eyebrow')->label('Eyebrow')->required()->maxLength(120),
                    Textarea::make('hero_headline')->label('Headline')->required()->rows(2)->maxLength(160),
                    Textarea::make('hero_sub')->label('Intro paragraph')->required()->rows(3)->maxLength(500),
                    TagsInput::make('hero_tech')->label('Technology chips')->reorderable()
                        ->suggestions(Fields::BRAND_LOGOS)
                        ->helperText('Short list shown in the hero. Press Enter after each name.'),
                ]),
                Tab::make('Statement and call to action')->schema([
                    Textarea::make('intro')->label('Statement')->required()->rows(4)->maxLength(600)
                        ->helperText('The large text that fills in as visitors scroll.'),
                    Textarea::make('final_cta')->label('Final call to action')->required()->rows(3)->maxLength(300),
                ]),
                Tab::make('Process')->schema([
                    Fields::titledList('process_steps', 'Add step')->label('Process steps'),
                ]),
                Tab::make('Why us')->schema([
                    Repeater::make('why_items')
                        ->label('Reasons')
                        ->schema([
                            TextInput::make('text')->required()->maxLength(160)->columnSpan(2),
                            Select::make('claim')
                                ->label('Show only when')
                                ->placeholder('Always shown')
                                ->options([
                                    'upwork_badge' => 'The Upwork claim is on',
                                    'years_experience' => 'Years of experience is set',
                                ]),
                        ])
                        ->columns(3)
                        ->itemLabel(fn (array $state): ?string => $state['text'] ?? null)
                        ->reorderableWithButtons()
                        ->collapsible()
                        ->defaultItems(0)
                        ->addActionLabel('Add reason'),
                ]),
                Tab::make('Configurator showcase')->schema([
                    Grid::make(2)->schema([
                        Select::make('showcase.project_slug')
                            ->label('Project')
                            ->options(fn () => Project::query()->orderBy('sort')->pluck('title', 'slug'))
                            ->required()
                            ->helperText('The "View project" button links here.'),
                        TextInput::make('showcase.eyebrow')->label('Eyebrow')->required()->maxLength(60),
                        TextInput::make('showcase.title')->label('Title')->required()->maxLength(80),
                        Textarea::make('showcase.intro')->label('Intro')->required()->rows(3)->maxLength(400)->columnSpanFull(),
                    ]),
                    Section::make('Stages')
                        ->description('Each stage pins a screenshot while visitors scroll. 1200 × 900 px images work best.')
                        ->schema([
                            Repeater::make('showcase.stages')
                                ->hiddenLabel()
                                ->schema([
                                    TextInput::make('title')->required()->maxLength(60),
                                    Select::make('sketch')
                                        ->label('Placeholder drawing')
                                        ->options([
                                            'fabric' => 'Fabric',
                                            'customize' => 'Customize',
                                            'preview' => 'Preview',
                                            'pricing' => 'Pricing',
                                            'order' => 'Order',
                                        ])
                                        ->required()
                                        ->helperText('Drawn while no screenshot is uploaded.'),
                                    Textarea::make('text')->required()->rows(2)->maxLength(300)->columnSpanFull(),
                                    Fields::image('image', 'showcase')->columnSpanFull(),
                                    Fields::alt()->columnSpanFull(),
                                ])
                                ->columns(2)
                                ->itemLabel(fn (array $state): ?string => $state['title'] ?? null)
                                ->reorderableWithButtons()
                                ->collapsible()
                                ->collapsed()
                                ->minItems(1)
                                ->addActionLabel('Add stage'),
                        ]),
                ]),
            ])->columnSpanFull(),
        ];
    }
}
