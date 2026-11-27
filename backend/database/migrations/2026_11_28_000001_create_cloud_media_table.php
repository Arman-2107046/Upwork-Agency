<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Which files on the public disk have been uploaded to Cloudflare, and under which ID. */
    public function up(): void
    {
        Schema::create('cloud_media', function (Blueprint $table) {
            $table->id();
            $table->string('path')->unique();
            $table->string('kind', 10); // image | video
            $table->string('remote_id');
            $table->string('status', 20)->default('ready'); // ready | processing | failed
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            // Stream: iframe and HLS URLs, thumbnail. Failures: the last error.
            $table->jsonb('data')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cloud_media');
    }
};
