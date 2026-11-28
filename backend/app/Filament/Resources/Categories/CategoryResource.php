<?php

namespace App\Filament\Resources\Categories;

use App\Filament\Resources\Categories\Pages\ManageCategories;
use App\Filament\Support\Access;
use App\Models\Category;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;
use UnitEnum;

/** Blog categories: each post has one, and each category with live posts gets a page on the website. */
class CategoryResource extends Resource
{
    protected static ?string $model = Category::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedFolder;

    protected static string|UnitEnum|null $navigationGroup = 'Content';

    protected static ?string $navigationParentItem = 'Blog posts';

    protected static ?string $navigationLabel = 'Categories';

    protected static ?string $modelLabel = 'category';

    protected static ?int $navigationSort = 0;

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return $schema->columns(1)->components(self::fields());
    }

    /**
     * Also used to add a category from the post form.
     *
     * @return list<mixed>
     */
    public static function fields(): array
    {
        return [
            TextInput::make('name')
                ->required()
                ->maxLength(60)
                ->unique(ignoreRecord: true)
                ->live(onBlur: true)
                ->afterStateUpdated(function (?string $state, Get $get, Set $set, string $operation): void {
                    if ($operation === 'create' || blank($get('slug'))) {
                        $set('slug', Str::slug((string) $state));
                    }
                })
                ->placeholder('Engineering'),
            TextInput::make('slug')
                ->label('Address')
                ->required()
                ->maxLength(80)
                ->regex('/^[a-z0-9]+(?:-[a-z0-9]+)*$/')
                ->validationMessages(['regex' => 'Use lowercase letters, numbers and dashes only.'])
                ->unique(ignoreRecord: true)
                ->prefix('/blog/category/')
                ->helperText('Filled from the name. Changing it later breaks links to the category page.'),
            Textarea::make('description')
                ->rows(3)
                ->maxLength(320)
                ->helperText('One or two sentences shown at the top of the category page.'),
            Section::make('Search and sharing')
                ->description('Optional. Leave empty to use the name and description.')
                ->collapsible()
                ->collapsed()
                ->compact()
                ->schema([
                    TextInput::make('seo_title')
                        ->label('Search title')
                        ->maxLength(70)
                        ->placeholder(fn (Get $get): string => trim($get('name').' articles')),
                    Textarea::make('seo_description')
                        ->label('Search description')
                        ->rows(2)
                        ->maxLength(160)
                        ->placeholder(fn (Get $get): ?string => $get('description')),
                ]),
        ];
    }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query) => $query->withCount([
                'posts',
                'posts as live_posts_count' => fn (Builder $q) => $q->where('is_published', true)->where('published_at', '<=', now()),
            ]))
            ->defaultSort('sort')
            ->reorderable('sort')
            ->columns([
                TextColumn::make('name')
                    ->weight('medium')
                    ->searchable()
                    ->description(fn (Category $record): ?string => $record->description ? Str::limit($record->description, 90) : null)
                    ->wrap(),
                TextColumn::make('slug')
                    ->label('Address')
                    ->prefix('/blog/category/')
                    ->color('gray')
                    ->toggleable(),
                TextColumn::make('posts_count')
                    ->label('Posts')
                    ->alignEnd()
                    ->description(fn (Category $record): ?string => $record->posts_count > $record->live_posts_count
                        ? "{$record->live_posts_count} live"
                        : null),
            ])
            ->recordActions([
                Action::make('website')
                    ->label('View')
                    ->icon(Heroicon::OutlinedArrowTopRightOnSquare)
                    ->color('gray')
                    ->url(fn (Category $record): string => "/blog/category/{$record->slug}", shouldOpenInNewTab: true)
                    ->visible(fn (Category $record): bool => $record->live_posts_count > 0),
                EditAction::make(),
                ViewAction::make()->hidden(fn (Category $record): bool => Access::canWrite()),
                DeleteAction::make()
                    ->disabled(fn (Category $record): bool => $record->posts_count > 0)
                    ->tooltip(fn (Category $record): ?string => $record->posts_count > 0
                        ? 'Move its posts to another category first'
                        : null),
            ])
            ->emptyStateHeading('No categories yet')
            ->emptyStateDescription('Add one here, or straight from a post while you write it.')
            ->emptyStateIcon(Heroicon::OutlinedFolder);
    }

    public static function getPages(): array
    {
        return [
            'index' => ManageCategories::route('/'),
        ];
    }
}
