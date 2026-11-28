<?php

namespace App\Filament\Pages;

use App\Content\SiteContent;
use App\Filament\Support\Access;
use App\Models\Setting;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Actions;
use Filament\Schemas\Components\EmbeddedSchema;
use Filament\Schemas\Components\Form;
use Filament\Schemas\Schema;
use Filament\Support\Enums\Width;

/**
 * Edits one settings document (a row in the "settings" table). Subclasses list the fields.
 */
abstract class SettingsPage extends Page
{
    /** @var array<string, mixed>|null */
    public ?array $data = [];

    protected Width|string|null $maxContentWidth = Width::FiveExtraLarge;

    /** Key of the settings document, e.g. "site". */
    abstract protected static function settingsKey(): string;

    /** @return array<int, mixed> */
    abstract protected function fields(): array;

    public function mount(): void
    {
        $this->form->fill($this->stored());
    }

    /** @return array<string, mixed> */
    protected function stored(): array
    {
        return SiteContent::settings(static::settingsKey());
    }

    public function form(Schema $schema): Schema
    {
        return $schema->statePath('data')->components($this->fields())->disabled(! Access::canWrite());
    }

    public function content(Schema $schema): Schema
    {
        return $schema->components([
            Form::make([EmbeddedSchema::make('form')])
                ->id('form')
                ->livewireSubmitHandler('save')
                ->footer([
                    Actions::make([
                        Action::make('save')
                            ->label('Save changes')
                            ->submit('save')
                            ->keyBindings(['mod+s'])
                            ->visible(Access::canWrite()),
                        Action::make('view')
                            ->label('View website')
                            ->color('gray')
                            ->url('/', shouldOpenInNewTab: true),
                    ])->sticky(),
                ]),
        ]);
    }

    public function save(): void
    {
        abort_unless(Access::canWrite(), 403);
        Setting::putGroup(static::settingsKey(), $this->form->getState());

        Notification::make()->success()->title('Saved. The website shows the changes now.')->send();
    }
}
