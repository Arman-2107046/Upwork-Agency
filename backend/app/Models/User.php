<?php

namespace App\Models;

use App\Models\Concerns\FlushesSiteContent;
use App\Models\Concerns\RecordsActivity;
use Database\Factories\UserFactory;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * A member of the team with access to the admin (Settings › Users). The role decides what they
 * can do: admins everything, editors all content (not users, not deleting blog categories),
 * viewers can open every screen but save nothing.
 * Name, job title, avatar and bio appear on the blog posts they write.
 */
#[Fillable(['name', 'email', 'password', 'role', 'job_title', 'avatar', 'bio'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<UserFactory> */
    use FlushesSiteContent, HasFactory, Notifiable, RecordsActivity;

    public const ADMIN = 'admin';

    public const EDITOR = 'editor';

    public const VIEWER = 'viewer';

    /** Same default as the column: users made from the command line are admins. */
    protected $attributes = ['role' => self::ADMIN];

    public const ROLES = [
        self::ADMIN => 'Admin',
        self::EDITOR => 'Editor',
        self::VIEWER => 'Viewer',
    ];

    public const ROLE_DESCRIPTIONS = [
        self::ADMIN => 'Everything, including users and settings.',
        self::EDITOR => 'Writes, publishes and moderates content. Cannot manage users or delete blog categories.',
        self::VIEWER => 'Can open every screen but save nothing.',
    ];

    public function canAccessPanel(Panel $panel): bool
    {
        return array_key_exists((string) $this->role, self::ROLES);
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ADMIN;
    }

    /** Admins and editors change content; viewers only look. */
    public function canWrite(): bool
    {
        return in_array($this->role, [self::ADMIN, self::EDITOR], true);
    }

    /** @return HasMany<Post, $this> */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class, 'author_id');
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
