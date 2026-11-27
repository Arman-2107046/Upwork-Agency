<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

/** A file from the public disk that lives on Cloudflare Images or Stream. */
#[Table('cloud_media')]
#[Fillable(['path', 'kind', 'remote_id', 'status', 'width', 'height', 'data'])]
class CloudMedia extends Model
{
    protected function casts(): array
    {
        return ['data' => 'array', 'width' => 'integer', 'height' => 'integer'];
    }

    public function isReady(): bool
    {
        return $this->status === 'ready';
    }
}
