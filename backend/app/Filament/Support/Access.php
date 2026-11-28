<?php

namespace App\Filament\Support;

use App\Models\User;
use Illuminate\Support\Facades\Auth;

/** The signed-in team member's role, for controls that have no policy behind them (toggles, settings). */
final class Access
{
    public static function canWrite(): bool
    {
        $user = Auth::user();

        return $user instanceof User && $user->canWrite();
    }

    public static function isAdmin(): bool
    {
        $user = Auth::user();

        return $user instanceof User && $user->isAdmin();
    }
}
