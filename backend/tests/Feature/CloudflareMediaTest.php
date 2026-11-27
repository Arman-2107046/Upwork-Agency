<?php

namespace Tests\Feature;

use App\Media\MediaSync;
use App\Models\CloudMedia;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CloudflareMediaTest extends TestCase
{
    use RefreshDatabase;

    private const API = 'https://api.cloudflare.com/client/v4/accounts/acc';

    /** @var list<string> */
    private array $uploadedIds = [];

    private bool $videoReady = false;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.cloudflare' => ['account_id' => 'acc', 'api_token' => 'token', 'images_hash' => 'HASH', 'prefix' => 'bytecode']]);
        $this->seedContent();
    }

    private function fakeCloudflare(bool $imagesFail = false): void
    {
        Http::fake(function (Request $request) use ($imagesFail) {
            $url = $request->url();
            $stream = [
                'uid' => 'vid123',
                'readyToStream' => $this->videoReady,
                'status' => ['state' => $this->videoReady ? 'ready' : 'inprogress'],
                'preview' => 'https://customer-abc.cloudflarestream.com/vid123/watch',
                'thumbnail' => 'https://customer-abc.cloudflarestream.com/vid123/thumbnails/thumbnail.jpg',
                'playback' => ['hls' => 'https://customer-abc.cloudflarestream.com/vid123/manifest/video.m3u8'],
                'input' => ['width' => 1280, 'height' => 720],
            ];

            return match (true) {
                $url === self::API.'/images/v1' && $request->method() === 'POST' => $imagesFail
                    ? Http::response(['success' => false, 'errors' => [['code' => 5400, 'message' => 'Bad request']]], 400)
                    : $this->recordImage($request),
                str_starts_with($url, self::API.'/images/v1/') => Http::response(['success' => false], 404),
                $url === self::API.'/stream' => Http::response(['success' => true, 'result' => $stream]),
                str_starts_with($url, self::API.'/stream/vid123') => Http::response(['success' => true, 'result' => $stream]),
                default => Http::response(['success' => false], 500),
            };
        });
    }

    private function recordImage(Request $request): mixed
    {
        $id = collect($request->data())->firstWhere('name', 'id')['contents'] ?? null;
        $this->uploadedIds[] = $id;

        return Http::response(['success' => true, 'result' => ['id' => $id]]);
    }

    public function test_images_are_uploaded_under_the_site_prefix_and_served_from_cloudflare(): void
    {
        $this->fakeCloudflare();

        $stats = app(MediaSync::class)->sync();

        $this->assertSame(0, $stats['failed']);
        $this->assertContains('bytecode/work/customtailor-home.webp', $this->uploadedIds);
        $this->assertSame(count(array_unique($this->uploadedIds)), count($this->uploadedIds), 'Shared images are uploaded once');

        $cover = $this->getJson('/api/content')->json('projects.0.cover');
        $this->assertSame('https://imagedelivery.net/HASH/bytecode/work/customtailor-home.webp/w=1600,fit=scale-down', $cover['src']);
        $this->assertSame(
            'https://imagedelivery.net/HASH/bytecode/work/customtailor-home.webp/w=800,fit=scale-down 800w, '.$cover['src'].' 1600w',
            $cover['srcSet'],
        );
        $this->assertSame(1600, $cover['width']);

        // A second sync has nothing left to do.
        $this->uploadedIds = [];
        app(MediaSync::class)->sync();
        $this->assertSame([], $this->uploadedIds);
    }

    public function test_a_failed_upload_keeps_serving_the_local_file(): void
    {
        $this->fakeCloudflare(imagesFail: true);

        $stats = app(MediaSync::class)->sync();

        $this->assertGreaterThan(0, $stats['failed']);
        $this->assertSame('failed', CloudMedia::query()->where('path', 'work/customtailor-home.webp')->value('status'));
        $this->getJson('/api/content')->assertJsonPath('projects.0.cover.src', '/storage/work/customtailor-home.webp');
    }

    public function test_project_videos_play_locally_until_stream_has_processed_them(): void
    {
        $this->fakeCloudflare();
        Storage::disk('public')->putFileAs('videos', UploadedFile::fake()->create('demo.mp4', 500, 'video/mp4'), 'demo.mp4');
        Project::query()->where('slug', 'customtailor')->first()->update(['video' => 'videos/demo.mp4']);

        app(MediaSync::class)->sync();
        $this->getJson('/api/content')
            ->assertJsonPath('projects.0.video.provider', 'file')
            ->assertJsonPath('projects.0.video.src', '/storage/videos/demo.mp4');

        $this->videoReady = true;
        app(MediaSync::class)->sync();
        $this->getJson('/api/content')
            ->assertJsonPath('projects.0.video.provider', 'stream')
            ->assertJsonPath('projects.0.video.src', 'https://customer-abc.cloudflarestream.com/vid123/iframe')
            ->assertJsonPath('projects.0.video.width', 1280);
    }

    public function test_nothing_is_sent_when_cloudflare_is_not_configured(): void
    {
        config(['services.cloudflare.account_id' => null]);
        Http::fake();

        app(MediaSync::class)->sync();

        Http::assertNothingSent();
        $this->getJson('/api/content')->assertJsonPath('projects.0.cover.src', '/storage/work/customtailor-home.webp');
    }
}
