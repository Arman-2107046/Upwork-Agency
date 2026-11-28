<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/** Comments come from readers: the team only moderates them (approve, hide, delete). */
class PostCommentPolicy extends ContentPolicy
{
    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, Model $record): bool
    {
        return false;
    }

    public function moderate(User $user): bool
    {
        return $user->canWrite();
    }
}
