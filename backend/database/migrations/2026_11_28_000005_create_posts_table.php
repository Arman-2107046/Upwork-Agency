<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('excerpt', 320);
            // Rich editor HTML as written in the admin.
            $table->longText('body')->nullable();
            // Generated on save (App\Content\PostBody): sanitized HTML, heading outline, reading time.
            $table->longText('body_html')->nullable();
            $table->jsonb('toc')->nullable();
            $table->unsignedSmallInteger('reading_minutes')->default(1);
            $table->string('category', 60);
            $table->jsonb('tags')->nullable();
            $table->string('cover_image')->nullable();
            $table->string('cover_alt')->nullable();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('is_published')->default(false);
            $table->boolean('is_featured')->default(false);
            // Live once is_published is on and this moment has passed (a future date schedules the post).
            $table->timestamp('published_at')->nullable()->index();
            $table->string('seo_title', 70)->nullable();
            $table->string('seo_description', 160)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
