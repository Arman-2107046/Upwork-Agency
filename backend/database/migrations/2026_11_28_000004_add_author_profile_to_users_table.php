<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Author details shown on blog posts. */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('job_title', 80)->nullable()->after('email');
            $table->string('avatar')->nullable()->after('job_title');
            $table->string('bio', 500)->nullable()->after('avatar');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['job_title', 'avatar', 'bio']);
        });
    }
};
