<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Blog categories become their own records (name, address, description, order), so they can be
 * renamed in one place and get a page each at /blog/category/{slug}. Existing posts keep the
 * category they had.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 60)->unique();
            $table->string('slug', 80)->unique();
            $table->string('description', 320)->nullable();
            $table->string('seo_title', 70)->nullable();
            $table->string('seo_description', 160)->nullable();
            $table->unsignedInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::table('posts', function (Blueprint $table) {
            // A category with posts cannot be deleted (move its posts first).
            $table->foreignId('category_id')->nullable()->after('reading_minutes')->constrained()->restrictOnDelete();
        });

        $now = now();
        $names = DB::table('posts')->distinct()->orderBy('category')->pluck('category')
            ->map(fn ($name) => trim((string) $name))
            ->filter()
            ->unique(fn ($name) => Str::lower($name))
            ->values();
        $slugs = [];
        foreach ($names as $sort => $name) {
            $base = Str::slug($name) ?: 'category';
            $slug = $base;
            for ($i = 2; in_array($slug, $slugs, true); $i++) {
                $slug = "{$base}-{$i}";
            }
            $slugs[] = $slug;
            $id = DB::table('categories')->insertGetId([
                'name' => $name, 'slug' => $slug, 'sort' => $sort, 'created_at' => $now, 'updated_at' => $now,
            ]);
            DB::table('posts')->whereRaw('lower(trim(category)) = ?', [Str::lower($name)])->update(['category_id' => $id]);
        }

        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn('category');
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->string('category', 60)->default('');
        });
        foreach (DB::table('categories')->get(['id', 'name']) as $category) {
            DB::table('posts')->where('category_id', $category->id)->update(['category' => $category->name]);
        }
        Schema::table('posts', function (Blueprint $table) {
            $table->dropConstrainedForeignId('category_id');
        });
        Schema::dropIfExists('categories');
    }
};
