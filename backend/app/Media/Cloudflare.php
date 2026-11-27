<?php

namespace App\Media;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/** Minimal client for the Cloudflare Images and Stream APIs. */
class Cloudflare
{
    private const API = 'https://api.cloudflare.com/client/v4';

    public function __construct(
        private readonly ?string $accountId,
        private readonly ?string $token,
        private readonly ?string $imagesHash,
        private readonly string $prefix,
    ) {}

    public static function fromConfig(): self
    {
        $config = config('services.cloudflare');

        return new self($config['account_id'] ?? null, $config['api_token'] ?? null,
            $config['images_hash'] ?? null, trim((string) ($config['prefix'] ?? 'bytecode'), '/') ?: 'bytecode');
    }

    public function imagesEnabled(): bool
    {
        return filled($this->accountId) && filled($this->token) && filled($this->imagesHash);
    }

    public function streamEnabled(): bool
    {
        return filled($this->accountId) && filled($this->token);
    }

    /** Remote ID for a public-disk path: stable, so every environment shares one copy. */
    public function remoteId(string $path): string
    {
        return $this->prefix.'/'.ltrim($path, '/');
    }

    /** imagedelivery.net URL using a flexible variant, e.g. w=800. */
    public function imageUrl(string $remoteId, int $width): string
    {
        $id = implode('/', array_map(rawurlencode(...), explode('/', $remoteId)));

        return "https://imagedelivery.net/{$this->imagesHash}/{$id}/w={$width},fit=scale-down";
    }

    /** Uploads an image under a fixed ID. An image that already exists counts as uploaded. */
    public function uploadImage(string $absolutePath, string $remoteId): void
    {
        $file = fopen($absolutePath, 'r');
        try {
            $response = $this->client()
                ->attach('file', $file, basename($absolutePath))
                ->post("/accounts/{$this->accountId}/images/v1", ['id' => $remoteId]);
        } finally {
            if (is_resource($file)) {
                fclose($file);
            }
        }

        if ($response->successful()) {
            return;
        }
        if ($this->client()->get("/accounts/{$this->accountId}/images/v1/".rawurlencode($remoteId))->successful()) {
            return;
        }

        throw new RuntimeException('Cloudflare Images upload failed: '.$this->errors($response->json()));
    }

    public function deleteImage(string $remoteId): void
    {
        $this->client()->delete("/accounts/{$this->accountId}/images/v1/".rawurlencode($remoteId));
    }

    /**
     * Uploads a video to Stream (single request, up to 200 MB).
     *
     * @return array<string, mixed> The Stream video object
     */
    public function uploadVideo(string $absolutePath, string $name): array
    {
        $file = fopen($absolutePath, 'r');
        try {
            $response = $this->client(timeout: 600)
                ->attach('file', $file, basename($absolutePath))
                ->post("/accounts/{$this->accountId}/stream");
        } finally {
            if (is_resource($file)) {
                fclose($file);
            }
        }

        $video = $this->result($response->json(), 'Cloudflare Stream upload failed');
        // Name it in the Stream dashboard (best effort).
        $this->client()->post("/accounts/{$this->accountId}/stream/{$video['uid']}", ['meta' => ['name' => $name]]);

        return $video;
    }

    /** @return array<string, mixed> */
    public function video(string $uid): array
    {
        return $this->result(
            $this->client()->get("/accounts/{$this->accountId}/stream/{$uid}")->json(),
            'Cloudflare Stream lookup failed',
        );
    }

    public function deleteVideo(string $uid): void
    {
        $this->client()->delete("/accounts/{$this->accountId}/stream/{$uid}");
    }

    private function client(int $timeout = 60): PendingRequest
    {
        return Http::baseUrl(self::API)->withToken((string) $this->token)->acceptJson()->timeout($timeout)->connectTimeout(10);
    }

    /** @return array<string, mixed> */
    private function result(?array $json, string $message): array
    {
        if (! ($json['success'] ?? false) || ! is_array($json['result'] ?? null)) {
            throw new RuntimeException($message.': '.$this->errors($json));
        }

        return $json['result'];
    }

    private function errors(?array $json): string
    {
        return collect($json['errors'] ?? [])->map(fn ($e) => ($e['code'] ?? '').' '.($e['message'] ?? ''))->implode('; ') ?: 'no response';
    }
}
