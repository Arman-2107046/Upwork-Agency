<?php

namespace App\Filament\Resources\Posts;

use App\Filament\Resources\Posts\Pages\CreatePost;
use App\Filament\Resources\Posts\Pages\EditPost;
use App\Filament\Resources\Posts\Pages\ListPosts;
use App\Filament\Resources\Posts\Pages\ViewPost;
use App\Filament\Resources\Posts\Schemas\PostForm;
use App\Filament\Resources\Posts\Tables\PostsTable;
use App\Models\Post;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Support\Facades\URL;
use UnitEnum;

class PostResource extends Resource
{
    protected static ?string $model = Post::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedNewspaper;

    protected static string|UnitEnum|null $navigationGroup = 'Content';

    protected static ?string $navigationLabel = 'Blog posts';

    protected static ?string $modelLabel = 'blog post';

    protected static ?int $navigationSort = 0;

    protected static ?string $recordTitleAttribute = 'title';

    /** Admin links use the post's address: /admin/posts/{slug}/edit (the website's Edit button builds them). */
    protected static ?string $recordRouteKeyName = 'slug';

    /** @return list<string> */
    public static function getGloballySearchableAttributes(): array
    {
        return ['title', 'slug', 'excerpt'];
    }

    public static function form(Schema $schema): Schema
    {
        return PostForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PostsTable::configure($table);
    }

    public static function getNavigationBadge(): ?string
    {
        $drafts = Post::query()->where('is_published', false)->count();

        return $drafts > 0 ? (string) $drafts : null;
    }

    public static function getNavigationBadgeTooltip(): ?string
    {
        return 'Drafts';
    }

    /** Live posts open on the website; drafts and scheduled posts get a private preview link for 24 hours. */
    public static function websiteUrl(Post $post): string
    {
        return $post->isLive()
            ? "/blog/{$post->slug}"
            : URL::temporarySignedRoute('blog.post', now()->addDay(), ['slug' => $post->slug], absolute: false);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListPosts::route('/'),
            'create' => CreatePost::route('/create'),
            'edit' => EditPost::route('/{record}/edit'),
            'view' => ViewPost::route('/{record}'),
        ];
    }
}
