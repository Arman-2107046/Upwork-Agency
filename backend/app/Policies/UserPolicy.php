<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/** Only admins manage team members. Nobody deletes their own account. */
class UserPolicy extends ContentPolicy
{
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Model $record): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Model $record): bool
    {
        return $user->isAdmin() && ! $record->is($user);
    }

    public function deleteAny(User $user): bool
    {
        return false;
    }
}
