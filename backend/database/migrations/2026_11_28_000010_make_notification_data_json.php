<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Filament reads admin notifications with a JSON query ("data"->>'format'), which PostgreSQL only
 * allows on a json column. 2026_11_28_000008 created "data" as text, so every admin page failed
 * with a 500 after login on PostgreSQL. SQLite (tests, local) reads JSON from text and needs nothing.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE notifications ALTER COLUMN data TYPE jsonb USING data::jsonb');
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE notifications ALTER COLUMN data TYPE text USING data::text');
        }
    }
};
