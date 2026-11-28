<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/** One reader's like of a post. The token comes from the long-lived "reader" cookie. */
#[Fillable(['post_id', 'token'])]
class PostLike extends Model {}
