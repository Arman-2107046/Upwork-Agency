<?php

namespace App\Filament\Resources\Posts\Schemas;

use App\Content\PostBody;
use App\Content\SiteContent;
use App\Filament\Resources\Categories\CategoryResource;
use App\Filament\Support\Access;
use App\Models\Category;
use App\Models\Post;
use App\Models\PostComment;
use Filament\Actions\Action;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Radio;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\ToggleButtons;
use Filament\Schemas\Components\Actions;
use Filament\Schemas\Components\Group;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Text;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Components\View;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\HtmlString;
use Illuminate\Support\Str;

/**
 * The write page: the story on the left (about three quarters), publishing settings on the right.
 * Counters, the Google preview, the permalink and the editor stats update in the browser as you
 * type (resources/views/admin/posts), without a round trip.
 */
class PostForm
{
    public const EXCERPT_MAX = 300;

    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(['default' => 1, 'lg' => 4])
            ->components([
                Group::make()->columnSpan(['lg' => 3])->schema([
                    Section::make()->schema([
                        Textarea::make('title')
                            ->required()
                            ->maxLength(160)
                            ->rows(1)
                            ->autosize()
                            ->placeholder('Write a clear, specific title')
                            ->extraInputAttributes(['x-on:keydown.enter.prevent' => '', 'class' => 'bp-title-input'])
                            ->dehydrateStateUsing(fn (?string $state): string => trim(preg_replace('/\s+/', ' ', (string) $state)))
                            ->live(onBlur: true)
                            ->afterStateUpdated(function (?string $state, Get $get, Set $set): void {
                                if (blank($get('slug'))) {
                                    $set('slug', Str::slug((string) $state));
                                }
                            }),
                        TextInput::make('slug')
                            ->label('Address')
                            ->required()
                            ->maxLength(160)
                            ->regex('/^[a-z0-9]+(?:-[a-z0-9]+)*$/')
                            ->notIn(Post::RESERVED_SLUGS)
                            ->validationMessages([
                                'regex' => 'Use lowercase letters, numbers and dashes only.',
                                'not_in' => 'This address is used by the blog itself. Choose another.',
                            ])
                            ->unique(ignoreRecord: true)
                            ->prefix('/blog/')
                            ->helperText('Filled from the title while empty. Changing it after publishing breaks existing links.'),
                        View::make('admin.posts.permalink')->viewData(['base' => SiteContent::siteUrl()]),
                        Textarea::make('excerpt')
                            ->label('Excerpt')
                            ->required()
                            ->rows(3)
                            ->maxLength(self::EXCERPT_MAX)
                            ->hint(self::counter('excerpt', self::EXCERPT_MAX))
                            ->helperText('Shown on cards, in search results and the RSS feed.'),
                    ]),

                    Section::make('Search & sharing')
                        ->description('How the post appears in Google and in link previews.')
                        ->schema([
                            View::make('admin.posts.serp-preview')->viewData(['base' => SiteContent::siteUrl()]),
                            Section::make('Edit SEO meta')
                                ->collapsible()
                                ->collapsed(fn (?Post $record): bool => blank($record?->seo_title) && blank($record?->seo_description))
                                ->compact()
                                ->schema([
                                    TextInput::make('seo_title')
                                        ->label('Meta title')
                                        ->maxLength(70)
                                        ->hint(self::counter('seo_title', 70))
                                        ->placeholder(fn (Get $get): ?string => $get('title'))
                                        ->helperText('Up to 60 characters reads best. The brand name is added automatically.'),
                                    Textarea::make('seo_description')
                                        ->label('Meta description')
                                        ->rows(2)
                                        ->maxLength(160)
                                        ->hint(self::counter('seo_description', 160))
                                        ->placeholder(fn (Get $get): ?string => $get('excerpt')),
                                ]),
                        ]),

                    Section::make('Richtext content')
                        ->schema([
                            RichEditor::make('body')
                                ->hiddenLabel()
                                ->placeholder('Start writing…')
                                ->toolbarButtons([
                                    ['h2', 'h3', 'lead', 'small'],
                                    ['bold', 'italic', 'underline', 'strike', 'subscript', 'superscript', 'highlight', 'textColor'],
                                    ['alignStart', 'alignCenter', 'alignEnd'],
                                    ['link', 'blockquote', 'code', 'codeBlock', 'bulletList', 'orderedList', 'horizontalRule'],
                                    ['table', 'details', 'attachFiles'],
                                    ['clearFormatting', 'undo', 'redo'],
                                ])
                                ->textColors(PostBody::textColors())
                                ->resizableImages()
                                ->fileAttachmentsDisk('public')
                                ->fileAttachmentsDirectory('blog')
                                ->fileAttachmentsVisibility('public')
                                ->fileAttachmentsAcceptedFileTypes(['image/webp', 'image/jpeg', 'image/png', 'image/gif'])
                                ->fileAttachmentsMaxSize(10 * 1024)
                                ->extraAttributes(['class' => 'bp-editor'])
                                ->helperText('Use Heading 2 for sections and Heading 3 inside them: they build the table of contents. Images are resized for phones automatically.'),
                            View::make('admin.posts.editor-stats'),
                        ]),
                ]),

                Group::make()->columnSpan(['lg' => 1])->schema([
                    Section::make('Publish')
                        ->schema([
                            Text::make(fn (?Post $record): ?string => self::statusLine($record))
                                ->color('gray')
                                ->visible(fn (?Post $record): bool => $record !== null),
                            ToggleButtons::make('is_published')
                                ->hiddenLabel()
                                ->boolean('Published', 'Draft')
                                ->colors([1 => 'success', 0 => 'gray'])
                                ->icons([1 => Heroicon::OutlinedGlobeAlt, 0 => Heroicon::OutlinedPencilSquare])
                                ->grouped()
                                ->default(false)
                                ->live(),
                            DateTimePicker::make('published_at')
                                ->label('Publish at')
                                ->seconds(false)
                                ->native(false)
                                ->default(now())
                                ->required(fn (Get $get): bool => (bool) $get('is_published'))
                                ->helperText('A later date schedules the post. It goes live by itself.'),
                            Select::make('author_id')
                                ->label('Author')
                                ->relationship('author', 'name')
                                ->default(fn () => auth()->id())
                                // Editors always write as themselves; admins can credit a colleague.
                                ->disabled(fn (): bool => ! Access::isAdmin())
                                ->dehydrated(fn (string $operation): bool => Access::isAdmin() || $operation === 'create')
                                ->dehydrateStateUsing(fn ($state) => Access::isAdmin() ? $state : auth()->id())
                                ->helperText('Photo, role and bio come from the author\'s profile under Users.'),
                            Toggle::make('is_featured')
                                ->label('Featured')
                                ->helperText('Shown large at the top of the blog.'),
                            Actions::make([
                                Action::make('saveFromPanel')
                                    ->label(fn (string $operation): string => $operation === 'create' ? 'Create' : 'Save')
                                    ->action(fn ($livewire, string $operation) => $operation === 'create' ? $livewire->create() : $livewire->save()),
                                Action::make('saveAndExit')
                                    ->label('Save & exit')
                                    ->color('gray')
                                    ->visible(fn (string $operation): bool => $operation === 'edit')
                                    ->action(function ($livewire): void {
                                        $livewire->save(shouldRedirect: false);
                                        $livewire->redirect($livewire::getResource()::getUrl('index'));
                                    }),
                                Action::make('cancel')
                                    ->label('Cancel')
                                    ->color('gray')
                                    ->visible(fn (string $operation): bool => $operation === 'create')
                                    ->url(fn ($livewire): string => $livewire::getResource()::getUrl('index')),
                            ])->fullWidth()->visible(fn (string $operation): bool => $operation !== 'view'),
                        ]),

                    Section::make('Category')
                        ->schema([
                            Radio::make('category_id')
                                ->hiddenLabel()
                                ->options(fn (): array => Category::query()->ordered()->pluck('name', 'id')->all())
                                ->required()
                                ->validationMessages(['required' => 'Choose a category.'])
                                ->hintActions([
                                    Action::make('addCategory')
                                        ->label('Add')
                                        ->icon(Heroicon::OutlinedPlus)
                                        ->visible(fn (): bool => Access::canWrite())
                                        ->modalHeading('Add category')
                                        ->modalWidth('lg')
                                        ->schema(CategoryResource::fields())
                                        ->action(fn (array $data, Set $set) => $set('category_id', Category::query()->create($data)->id)),
                                    Action::make('manageCategories')
                                        ->label('Manage')
                                        ->url(fn (): string => CategoryResource::getUrl(), shouldOpenInNewTab: true),
                                ]),
                        ]),

                    Section::make('Cover')
                        ->schema([
                            FileUpload::make('cover_image')
                                ->hiddenLabel()
                                ->image()
                                ->disk('public')
                                ->visibility('public')
                                ->directory('blog')
                                ->acceptedFileTypes(['image/webp', 'image/jpeg', 'image/png'])
                                ->maxSize(10 * 1024)
                                ->imageEditor()
                                ->imageEditorAspectRatioOptions(['16:9', '3:2', '4:5'])
                                ->helperText('Landscape, at least 2000 px wide. WebP, JPG or PNG, up to 10 MB. Without one, the first image in the article is used.'),
                            TextInput::make('cover_caption')
                                ->label('Caption / credit')
                                ->maxLength(160),
                            TextInput::make('cover_alt')
                                ->label('Alt text')
                                ->maxLength(255)
                                ->helperText('What the image shows, for screen readers.'),
                        ]),

                    Section::make('Tags')
                        ->schema([
                            TagsInput::make('tags')
                                ->hiddenLabel()
                                ->reorderable()
                                ->placeholder('Add a tag')
                                ->suggestions(fn () => Post::query()->pluck('tags')->flatten()->filter()->unique()->sort()->values()->all())
                                ->helperText('Press Enter after each tag.'),
                        ]),

                    Section::make('Story details')
                        ->visible(fn (string $operation): bool => $operation !== 'create')
                        ->schema([
                            Text::make(fn (Post $record): HtmlString => self::details($record)),
                        ]),
                ]),
            ]);
    }

    /** "12 / 300", counted in the browser as you type. */
    private static function counter(string $field, int $max): HtmlString
    {
        return new HtmlString(sprintf(
            '<span x-data class="bp-counter" x-bind:class="{ \'bp-counter-over\': (($wire.data.%1$s ?? \'\').length > %2$d) }" x-text="(($wire.data.%1$s ?? \'\').length) + \' / %2$d\'"></span>',
            $field,
            $max,
        ));
    }

    private static function statusLine(?Post $post): ?string
    {
        if (! $post) {
            return null;
        }
        $date = $post->published_at?->format('j M Y, H:i');

        return match ($post->status()) {
            Post::STATUS_PUBLISHED => "Live since {$date}",
            Post::STATUS_SCHEDULED => "Scheduled for {$date}",
            default => 'Draft. Only the team can see it.',
        };
    }

    private static function details(Post $post): HtmlString
    {
        $pending = $post->comments()->where('status', PostComment::PENDING)->count();
        $rows = [
            'Views' => number_format($post->views),
            'Likes' => number_format($post->likes()->count()),
            'Comments' => number_format($post->comments()->approved()->count()).($pending ? " ({$pending} waiting)" : ''),
            'Reading time' => "{$post->reading_minutes} min",
            'Written by' => $post->author?->name ?? 'Nobody yet',
            'Last edited' => $post->updated_at?->diffForHumans() ?? '',
        ];

        return new HtmlString('<dl class="bp-details">'.collect($rows)
            ->map(fn ($value, $label) => '<div><dt>'.e($label).'</dt><dd>'.e($value).'</dd></div>')
            ->implode('').'</dl>');
    }
}
