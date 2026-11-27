<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(ContentSeeder::class);

        $admin = config('app.admin');
        if ($admin['email'] && $admin['password'] && ! User::query()->where('email', $admin['email'])->exists()) {
            User::query()->forceCreate([
                'name' => $admin['name'],
                'email' => $admin['email'],
                'password' => $admin['password'],
                'email_verified_at' => now(),
            ]);
        }
    }
}
