<?php

namespace Database\Seeders;

use App\Content\Defaults;
use App\Content\SiteContent;
use App\Models\Project;
use App\Models\Service;
use App\Models\Setting;
use App\Models\TechnologyGroup;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

/**
 * Fills the CMS with the website's original content (database/seeders/content).
 * Safe to run again: existing records are left as they are.
 */
class ContentSeeder extends Seeder
{
    public function run(): void
    {
        $seed = Defaults::seed();

        $this->copyImages();

        foreach (['site', 'home', 'about', 'pages'] as $key) {
            Setting::query()->firstOrCreate(['key' => $key], ['value' => $seed[$key]]);
        }

        foreach ($seed['technology_groups'] as $i => $group) {
            TechnologyGroup::query()->firstOrCreate(['label' => $group['label']], [...$group, 'sort' => $i + 1]);
        }

        foreach ($seed['projects'] as $i => $project) {
            Project::query()->firstOrCreate(['slug' => $project['slug']], [...$project, 'sort' => $i + 1]);
        }

        foreach ($seed['services'] as $i => $service) {
            $projectSlug = $service['example_project_slug'];
            unset($service['example_project_slug']);
            Service::query()->firstOrCreate(['slug' => $service['slug']], [
                ...$service,
                'example_project_id' => $projectSlug ? Project::query()->where('slug', $projectSlug)->value('id') : null,
                'sort' => $i + 1,
            ]);
        }

        SiteContent::flush();
    }

    /** Copies the original screenshots to the public disk, where uploads from the admin also live. */
    private function copyImages(): void
    {
        $disk = Storage::disk('public');
        $source = Defaults::imagesPath();

        foreach (File::allFiles($source) as $file) {
            $path = str_replace('\\', '/', $file->getRelativePathname());
            if (! $disk->exists($path)) {
                $disk->put($path, $file->getContents());
            }
        }
    }
}
