<?php

namespace App\Filament\Support;

use App\Models\TechnologyGroup;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;

/** Field presets shared by the admin forms. */
final class Fields
{
    /** Technologies that have a brand logo on the website (frontend/src/data/brandIcons.ts). */
    public const BRAND_LOGOS = [
        'React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express', 'NestJS', 'Laravel',
        'PHP', 'Python', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'n8n', 'Zapier', 'Make', 'Docker',
        'Ubuntu VPS', 'Cloudflare', 'Blender', 'Three.js',
    ];

    /** Image upload to the public disk. The website builds an 800px WebP variant automatically. */
    public static function image(string $name, string $directory): FileUpload
    {
        return FileUpload::make($name)
            ->image()
            ->disk('public')
            ->visibility('public')
            ->directory($directory)
            ->acceptedFileTypes(['image/webp', 'image/jpeg', 'image/png'])
            ->maxSize(10 * 1024)
            ->imageEditor()
            ->helperText('WebP, JPG or PNG, up to 10 MB. Use 1600 px wide screenshots (16:10) for the sharpest result.');
    }

    public static function alt(string $name = 'alt'): TextInput
    {
        return TextInput::make($name)
            ->label('Alt text')
            ->maxLength(255)
            ->helperText('Describe what the image shows, for screen readers and search engines.');
    }

    /** Technology names, suggesting the ones that have a logo plus every name already in use. */
    public static function technologies(string $name): TagsInput
    {
        return TagsInput::make($name)
            ->reorderable()
            ->suggestions(fn () => collect(self::BRAND_LOGOS)
                ->merge(TechnologyGroup::query()->pluck('items')->flatten())
                ->unique()
                ->sort()
                ->values()
                ->all())
            ->helperText('Press Enter after each name. Names with a brand logo: '.implode(', ', self::BRAND_LOGOS).'.');
    }

    /** A reorderable list of { title, text } rows. */
    public static function titledList(string $name, string $addLabel): Repeater
    {
        return Repeater::make($name)
            ->schema([
                TextInput::make('title')->required()->maxLength(120),
                Textarea::make('text')->required()->rows(2)->maxLength(500),
            ])
            ->itemLabel(fn (array $state): ?string => $state['title'] ?? null)
            ->addActionLabel($addLabel)
            ->reorderableWithButtons()
            ->collapsible()
            ->defaultItems(0);
    }
}
