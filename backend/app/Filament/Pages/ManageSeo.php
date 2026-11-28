<?php

namespace App\Filament\Pages;

use App\Content\Defaults;
use App\Models\Setting;
use BackedEnum;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

/** Titles and descriptions of the fixed pages. Services, projects and blog posts use their own fields. */
class ManageSeo extends SettingsPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedMagnifyingGlass;

    protected static string|UnitEnum|null $navigationGroup = 'Settings';

    protected static ?string $navigationLabel = 'SEO';

    protected static ?string $title = 'Search and sharing';

    protected static ?int $navigationSort = 2;

    protected static ?string $slug = 'settings/seo';

    private const PAGES = [
        'home' => 'Home',
        'services' => 'Services',
        'work' => 'Work',
        'blog' => 'Blog',
        'about' => 'About',
        'contact' => 'Contact',
    ];

    protected static function settingsKey(): string
    {
        return 'pages';
    }

    protected function stored(): array
    {
        return array_replace_recursive(Defaults::group('pages'), Setting::group('pages'));
    }

    protected function fields(): array
    {
        return collect(self::PAGES)->map(fn (string $label, string $key) => Section::make($label)
            ->description($key === 'home' ? 'Shown as is.' : 'The brand name is added after the title automatically.')
            ->compact()
            ->schema([
                TextInput::make("{$key}.title")->label('Title')->required()->maxLength(70),
                Textarea::make("{$key}.description")->label('Description')->required()->rows(2)->maxLength(160)
                    ->helperText('Up to 160 characters. Shown in search results and link previews.'),
            ]))->values()->all();
    }
}
