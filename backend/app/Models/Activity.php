<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** One change made in the admin: who did what to which record (Settings › Activity log). */
#[Fillable(['user_id', 'event', 'subject_type', 'subject_id', 'subject_label', 'changes'])]
class Activity extends Model
{
    public const UPDATED_AT = null;

    protected $table = 'activity_log';

    protected function casts(): array
    {
        return ['changes' => 'array'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
