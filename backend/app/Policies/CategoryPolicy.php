<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/** Editors manage categories but only admins delete them. */
class CategoryPolicy extends ContentPolicy
{
    public function delete(User $user, Model $record): bool
    {
        return $user->isAdmin();
    }

    public function deleteAny(User $user): bool
    {
        return $user->isAdmin();
    }
}
