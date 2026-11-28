<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Media is served from the server only; removes the old Cloudflare upload records. */
    public function up(): void
    {
        Schema::dropIfExists('cloud_media');
    }

    public function down(): void {}
};
