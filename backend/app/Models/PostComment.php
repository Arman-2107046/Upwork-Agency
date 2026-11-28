<?php

namespace App\Models;

use App\Models\Concerns\RecordsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** A reader's comment on a blog post. It shows on the website once a team member approves it. */
#[Fillable(['post_id', 'name', 'email', 'body', 'status', 'ip_address', 'user_agent'])]
class PostComment extends Model
{
    use RecordsActivity;

    public const PENDING = 'pending';

    public const APPROVED = 'approved';

    public const HIDDEN = 'hidden';

    public const STATUSES = [self::PENDING => 'Pending', self::APPROVED => 'Approved', self::HIDDEN => 'Hidden'];

    /** Only moderation is logged, never what readers wrote. */
    protected array $activityOnly = ['status'];

    /** @return BelongsTo<Post, $this> */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /** @param Builder<PostComment> $query */
    public function scopeApproved(Builder $query): void
    {
        $query->where('status', self::APPROVED);
    }

    public function activityLabel(): string
    {
        return "Comment by {$this->name}";
    }
}
