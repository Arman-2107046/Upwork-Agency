<?php

use App\Content\SiteContent;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Graphic design (Photoshop and Illustrator) becomes its own service, listed after the software
 * services. The existing mockups service keeps its content and is retitled so the two don't
 * share a name, unless its title was already edited in the admin.
 *
 * A fresh database has no services yet: the content seeder adds both, so nothing happens here.
 */
return new class extends Migration
{
    private const OLD_TITLE = 'Graphic Design & Product Visualization';

    private const NEW_TITLE = 'Product Mockups & Visualization';

    public function up(): void
    {
        if (! DB::table('services')->exists()) {
            return;
        }

        DB::table('services')->where('slug', 'design')->where('title', self::OLD_TITLE)->update(['title' => self::NEW_TITLE]);

        if (! DB::table('services')->where('slug', 'graphic-design')->exists()) {
            DB::table('services')->insert([
                'slug' => 'graphic-design',
                'title' => 'Graphic Design: Photoshop & Illustrator',
                'summary' => 'Brand assets, vector graphics, photo editing and marketing visuals in Adobe Photoshop and Illustrator.',
                'bullets' => json_encode([
                    'Logos, Icons & Vector Illustration in Adobe Illustrator',
                    'Photo Editing, Retouching & Compositing in Adobe Photoshop',
                    'Brand Assets, Social Media & Print Graphics',
                ]),
                'outcome' => 'Design files ready for web, social or print, in the formats you need.',
                'icon' => 'pen-tool',
                'stack_groups' => json_encode(['Design']),
                'is_published' => true,
                'sort' => (int) DB::table('services')->max('sort') + 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        SiteContent::flush();
    }

    public function down(): void
    {
        DB::table('services')->where('slug', 'graphic-design')->delete();
        DB::table('services')->where('slug', 'design')->where('title', self::NEW_TITLE)->update(['title' => self::OLD_TITLE]);
        SiteContent::flush();
    }
};
