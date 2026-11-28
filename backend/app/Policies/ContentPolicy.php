<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * Every team member can open content; admins and editors change it; viewers only look.
 * The admin hides the buttons a user may not use, and these checks also guard the requests.
 */
abstract class ContentPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Model $record): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->canWrite();
    }

    public function update(User $user, Model $record): bool
    {
        return $user->canWrite();
    }

    public function delete(User $user, Model $record): bool
    {
        return $user->canWrite();
    }

    public function deleteAny(User $user): bool
    {
        return $user->canWrite();
    }

    public function reorder(User $user): bool
    {
        return $user->canWrite();
    }
}
