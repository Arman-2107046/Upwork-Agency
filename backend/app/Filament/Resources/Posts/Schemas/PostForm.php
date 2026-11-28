<?php

namespace App\Filament\Resources\Posts\Schemas;

use App\Filament\Support\Fields;
use App\Models\Post;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
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

class PostForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(3)
            ->components([
                Group::make()->columnSpan(['lg' => 2])->schema([
                    Section::make()
                        ->schema([
                            TextInput::make('title')
                                ->required()
                                ->maxLength(160)
                                ->live(onBlur: true)
                                ->afterStateUpdated(function (string $operation, ?string $state, Set $set): void {
                                    if ($operation === 'create') {
                                        $set('slug', Str::slug((string) $state));
                                    }
                                }),
                            TextInput::make('slug')
                                ->label('Address')
                                ->required()
                                ->maxLength(100)
                                ->regex('/^[a-z0-9]+(?:-[a-z0-9]+)*$/')
                                ->validationMessages(['regex' => 'Use lowercase letters, numbers and dashes only.'])
                                ->unique(ignoreRecord: true)
                                ->prefix('/blog/')
                                ->helperText('Filled from the title. Changing it after publishing breaks existing links.'),
                            Textarea::make('excerpt')
                                ->label('Summary')
                                ->required()
                                ->rows(3)
                                ->maxLength(320)
                                ->helperText('One or two sentences. Shown under the title, on post cards and in search results.'),
                            RichEditor::make('body')
                                ->label('Article')
                                ->placeholder('Start writing…')
                                ->toolbarButtons([
                                    ['bold', 'italic', 'underline', 'strike', 'highlight', 'code', 'link'],
                                    ['h2', 'h3', 'lead'],
                                    ['blockquote', 'codeBlock', 'bulletList', 'orderedList', 'horizontalRule'],
                                    ['table', 'attachFiles', 'details'],
                                    ['clearFormatting', 'undo', 'redo'],
                                ])
                                ->fileAttachmentsDisk('public')
                                ->fileAttachmentsDirectory('blog')
                                ->fileAttachmentsVisibility('public')
                                ->fileAttachmentsAcceptedFileTypes(['image/webp', 'image/jpeg', 'image/png', 'image/gif'])
                                ->fileAttachmentsMaxSize(10 * 1024)
                                ->extraInputAttributes(['style' => 'min-height: 28rem'])
                                ->helperText('Use Heading 2 for sections and Heading 3 inside them: they build the table of contents. Images are resized for phones automatically.'),
                        ]),
                    Section::make('Search and sharing')
                        ->description('Optional. Leave empty to use the title and summary.')
                        ->collapsible()
                        ->collapsed(fn (?Post $record): bool => blank($record?->seo_title) && blank($record?->seo_description))
                        ->schema([
                            TextInput::make('seo_title')
                                ->label('Search title')
                                ->maxLength(70)
                                ->placeholder(fn (Get $get): ?string => $get('title'))
                                ->helperText('Up to 60 characters reads best. The brand name is added automatically.'),
                            Textarea::make('seo_description')
                                ->label('Search description')
                                ->rows(2)
                                ->maxLength(160)
                                ->placeholder(fn (Get $get): ?string => $get('excerpt'))
                                ->helperText('Up to 160 characters. Shown in search results and link previews.'),
                        ]),
                ]),
                Group::make()->columnSpan(['lg' => 1])->schema([
                    Section::make('Publishing')
                        ->schema([
                            Text::make(fn (?Post $record): ?string => self::statusLine($record))
                                ->color('gray')
                                ->visible(fn (?Post $record): bool => $record !== null),
                            Toggle::make('is_published')
                                ->label('Published')
                                ->default(false)
                                ->live()
                                ->helperText('Off keeps the post as a draft. Use Preview to check it first.'),
                            DateTimePicker::make('published_at')
                                ->label('Publish date')
                                ->seconds(false)
                                ->native(false)
                                ->default(now())
                                ->required(fn (Get $get): bool => (bool) $get('is_published'))
                                ->helperText('A future date schedules the post. It goes live automatically.'),
                            Toggle::make('is_featured')
                                ->label('Featured')
                                ->helperText('The newest featured post leads the blog page.'),
                        ]),
                    Section::make('Organisation')
                        ->schema([
                            TextInput::make('category')
                                ->required()
                                ->maxLength(60)
                                ->datalist(fn () => Post::query()->distinct()->orderBy('category')->pluck('category')->all())
                                ->helperText('One per post, e.g. "Engineering". Visitors filter the blog by it.'),
                            TagsInput::make('tags')
                                ->reorderable()
                                ->suggestions(fn () => Post::query()->pluck('tags')->flatten()->filter()->unique()->sort()->values()->all())
                                ->helperText('Press Enter after each tag.'),
                            Select::make('author_id')
                                ->label('Author')
                                ->relationship('author', 'name')
                                ->default(fn () => auth()->id())
                                ->searchable()
                                ->preload()
                                ->helperText('Photo, role and bio come from the user\'s profile under Users.'),
                        ]),
                    Section::make('Cover image')
                        ->schema([
                            Fields::image('cover_image', 'blog')
                                ->hiddenLabel()
                                ->helperText('WebP, JPG or PNG, up to 10 MB. 1600 × 1000 px (16:10) works best. Also used for link previews.'),
                            Fields::alt('cover_alt'),
                        ]),
                ]),
            ]);
    }

    private static function statusLine(?Post $post): ?string
    {
        if (! $post) {
            return null;
        }
        $date = $post->published_at?->format('j M Y, H:i');
        $minutes = "{$post->reading_minutes} min read";

        return match ($post->status()) {
            Post::STATUS_PUBLISHED => "Live since {$date} · {$minutes}",
            Post::STATUS_SCHEDULED => "Scheduled for {$date} · {$minutes}",
            default => "Draft · {$minutes}",
        };
    }
}
