<?php

namespace App\Filament\Resources\ContactMessages\Pages;

use App\Filament\Resources\ContactMessages\ContactMessageResource;
use App\Models\ContactMessage;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\ViewRecord;
use Filament\Support\Icons\Heroicon;

class ViewContactMessage extends ViewRecord
{
    protected static string $resource = ContactMessageResource::class;

    public function mount(int|string $record): void
    {
        parent::mount($record);

        /** @var ContactMessage $message */
        $message = $this->getRecord();
        $message->markAsRead();
    }

    protected function getHeaderActions(): array
    {
        /** @var ContactMessage $message */
        $message = $this->getRecord();

        return [
            Action::make('reply')
                ->label('Reply by email')
                ->icon(Heroicon::OutlinedArrowUturnLeft)
                ->url('mailto:'.$message->email.'?subject='.rawurlencode('Re: your project enquiry')),
            Action::make('markUnread')
                ->label('Mark as unread')
                ->color('gray')
                ->icon(Heroicon::OutlinedEnvelope)
                ->action(function () use ($message): void {
                    $message->forceFill(['read_at' => null])->save();
                    $this->redirect(ContactMessageResource::getUrl('index'));
                }),
            DeleteAction::make(),
        ];
    }
}
