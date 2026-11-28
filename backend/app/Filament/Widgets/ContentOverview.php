<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\ContactMessages\ContactMessageResource;
use App\Filament\Resources\Posts\PostResource;
use App\Filament\Resources\Projects\ProjectResource;
use App\Filament\Resources\Services\ServiceResource;
use App\Models\ContactMessage;
use App\Models\Post;
use App\Models\Project;
use App\Models\Service;
use Filament\Support\Icons\Heroicon;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class ContentOverview extends StatsOverviewWidget
{
    protected static ?int $sort = 1;

    protected function getColumns(): int
    {
        return 4;
    }

    protected function getStats(): array
    {
        $unread = ContactMessage::query()->unread()->count();
        $drafts = Post::query()->where('is_published', false)->count();
        $scheduled = Post::query()->where('is_published', true)->where('published_at', '>', now())->count();

        return [
            Stat::make('Unread messages', $unread)
                ->description(ContactMessage::query()->where('created_at', '>=', now()->subDays(30))->count().' in the last 30 days')
                ->icon(Heroicon::OutlinedInbox)
                ->color($unread > 0 ? 'primary' : 'gray')
                ->url(ContactMessageResource::getUrl('index')),
            Stat::make('Blog posts', Post::query()->live()->count())
                ->description(collect([
                    $drafts ? "{$drafts} ".str('draft')->plural($drafts) : null,
                    $scheduled ? "{$scheduled} scheduled" : null,
                ])->filter()->implode(' · ') ?: 'Published on the blog')
                ->icon(Heroicon::OutlinedNewspaper)
                ->url(PostResource::getUrl('index')),
            Stat::make('Published projects', Project::query()->where('is_published', true)->count())
                ->description(Project::query()->where('is_published', true)->where('is_featured', true)->count().' on the home page')
                ->icon(Heroicon::OutlinedRectangleStack)
                ->url(ProjectResource::getUrl('index')),
            Stat::make('Published services', Service::query()->where('is_published', true)->count())
                ->description('Each has its own page')
                ->icon(Heroicon::OutlinedSquares2x2)
                ->url(ServiceResource::getUrl('index')),
        ];
    }
}
