<?php

namespace App\Filament\Resources\Projects\Schemas;

use App\Filament\Support\Fields;
use App\Media\Cloudflare;
use App\Models\CloudMedia;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Group;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Text;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class ProjectForm
{
    /** Where the saved video plays from, so editors know when Stream has taken over. */
    private static function videoStatus(mixed $state): ?string
    {
        $path = is_array($state) ? (array_values($state)[0] ?? null) : $state;
        if (! is_string($path) || $path === '') {
            return null;
        }
        if (! Cloudflare::fromConfig()->streamEnabled()) {
            return 'Plays from this server (Cloudflare Stream is not configured).';
        }

        $record = CloudMedia::query()->where('path', $path)->first();

        return match ($record?->status) {
            'ready' => 'Streaming from Cloudflare Stream.',
            'processing' => 'Uploaded to Cloudflare Stream and processing. Plays from this server until it is ready.',
            'failed' => 'Cloudflare Stream upload failed: '.($record->data['error'] ?? 'unknown error').'. Plays from this server; retried on the next save.',
            default => 'Uploads to Cloudflare Stream after you save. Plays from this server until then.',
        };
    }

    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(3)
            ->components([
                Group::make()->columnSpan(['lg' => 2])->schema([
                    Section::make('Project')
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
                                ->prefix('/work/')
                                ->helperText('Part of the page address. Changing it breaks existing links.'),
                            TextInput::make('category')
                                ->required()
                                ->maxLength(80)
                                ->helperText('Short label on project cards, e.g. "Digital product store".'),
                            TextInput::make('url')
                                ->label('Live URL')
                                ->url()
                                ->maxLength(255)
                                ->helperText('Adds a "Visit" button. Leave empty for private projects.'),
                            Textarea::make('overview')
                                ->required()
                                ->rows(4)
                                ->maxLength(1000)
                                ->columnSpanFull()
                                ->helperText('One paragraph. Also used as the search result description.'),
                        ]),
                    Section::make('Details')
                        ->schema([
                            TagsInput::make('scope')
                                ->reorderable()
                                ->helperText('What was delivered. Press Enter after each item.'),
                            Fields::technologies('technologies')
                                ->label('Technologies'),
                        ]),
                    Section::make('Gallery')
                        ->description('Shown on the project page. The first image spans the full width.')
                        ->schema([
                            Repeater::make('gallery')
                                ->hiddenLabel()
                                ->schema([
                                    Fields::image('image', 'projects')->required(),
                                    Fields::alt()->required(),
                                ])
                                ->itemLabel(fn (array $state): ?string => $state['alt'] ?? null)
                                ->reorderableWithButtons()
                                ->collapsible()
                                ->defaultItems(0)
                                ->addActionLabel('Add image'),
                        ]),
                ]),
                Group::make()->columnSpan(['lg' => 1])->schema([
                    Section::make('Visibility')
                        ->schema([
                            Toggle::make('is_published')
                                ->label('Published')
                                ->default(true)
                                ->helperText('Hidden projects disappear from the website and the sitemap.'),
                            Toggle::make('is_featured')
                                ->label('Show on the home page')
                                ->default(true),
                        ]),
                    Section::make('Cover image')
                        ->schema([
                            Fields::image('cover_image', 'projects')->hiddenLabel(),
                            Fields::alt('cover_alt'),
                        ]),
                    Section::make('Video')
                        ->description('Optional walkthrough, shown on the project page.')
                        ->schema([
                            FileUpload::make('video')
                                ->hiddenLabel()
                                ->disk('public')
                                ->visibility('public')
                                ->directory('videos')
                                ->acceptedFileTypes(['video/mp4', 'video/webm', 'video/quicktime'])
                                ->maxSize(200 * 1024)
                                ->helperText('MP4, WebM or MOV, up to 200 MB.'),
                            Text::make(fn (Get $get): ?string => self::videoStatus($get('video')))
                                ->color('gray'),
                        ]),
                ]),
            ]);
    }
}
