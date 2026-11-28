<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Blog reader engagement: view counts, likes (one per reader) and moderated comments. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->string('cover_caption', 160)->nullable()->after('cover_alt');
            $table->unsignedInteger('views')->default(0)->after('reading_minutes');
        });

        Schema::create('post_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            // "reader:{random}" from the reader cookie.
            $table->string('token', 64);
            $table->timestamps();
            $table->unique(['post_id', 'token']);
        });

        Schema::create('post_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->string('name', 120);
            $table->string('email');
            $table->text('body');
            // pending until a team member approves it; hidden comments stay out of the website.
            $table->string('status', 10)->default('pending')->index();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamps();
            $table->index(['post_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('post_comments');
        Schema::dropIfExists('post_likes');
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn(['cover_caption', 'views']);
        });
    }
};
