<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('url')->nullable();
            $table->string('category');
            $table->text('overview');
            $table->jsonb('scope')->nullable();
            $table->jsonb('technologies')->nullable();
            $table->string('cover_image')->nullable();
            $table->string('cover_alt')->nullable();
            // [{ image: string|null, alt: string }]
            $table->jsonb('gallery')->nullable();
            $table->boolean('is_featured')->default(true);
            $table->boolean('is_published')->default(true);
            $table->unsignedInteger('sort')->default(0)->index();
            $table->timestamps();
        });

        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('summary', 500);
            $table->jsonb('bullets')->nullable();
            $table->text('outcome');
            $table->string('icon', 40);
            $table->jsonb('stack_groups')->nullable();
            $table->string('example_image')->nullable();
            $table->string('example_alt')->nullable();
            $table->foreignId('example_project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->boolean('is_published')->default(true);
            $table->unsignedInteger('sort')->default(0)->index();
            $table->timestamps();
        });

        Schema::create('technology_groups', function (Blueprint $table) {
            $table->id();
            $table->string('label')->unique();
            $table->jsonb('items')->nullable();
            // Which row of the home page logo slider shows this group (null: not shown).
            $table->unsignedTinyInteger('slider_row')->nullable();
            $table->unsignedInteger('sort')->default(0)->index();
            $table->timestamps();
        });

        // Singleton content (site settings, home page, about page, page SEO), one JSON value per key.
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->jsonb('value')->nullable();
            $table->timestamps();
        });

        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('company')->nullable();
            $table->string('service')->nullable();
            $table->string('budget')->nullable();
            $table->text('message');
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamp('read_at')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_messages');
        Schema::dropIfExists('settings');
        Schema::dropIfExists('technology_groups');
        Schema::dropIfExists('services');
        Schema::dropIfExists('projects');
    }
};
