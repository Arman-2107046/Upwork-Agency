<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'email', 'company', 'service', 'budget', 'message', 'ip_address', 'user_agent', 'read_at'])]
class ContactMessage extends Model
{
    /** Budget choices on the contact form (keep in sync with frontend/src/lib/validators.ts). */
    public const BUDGETS = [
        'Not sure yet',
        'Under $1,000',
        '$1,000 to $5,000',
        '$5,000 to $15,000',
        '$15,000+',
    ];

    protected function casts(): array
    {
        return ['read_at' => 'datetime'];
    }

    /** @param Builder<ContactMessage> $query */
    public function scopeUnread(Builder $query): void
    {
        $query->whereNull('read_at');
    }

    public function markAsRead(): void
    {
        if ($this->read_at === null) {
            $this->forceFill(['read_at' => now()])->save();
        }
    }
}
