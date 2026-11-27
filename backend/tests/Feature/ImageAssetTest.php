<?php

namespace Tests\Feature;

use App\Content\ImageAsset;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ImageAssetTest extends TestCase
{
    public function test_uploaded_images_get_dimensions_and_a_small_screen_variant(): void
    {
        Storage::disk('public')->putFileAs('projects', UploadedFile::fake()->image('shot.png', 1600, 1000), 'shot.png');

        $asset = ImageAsset::make('projects/shot.png', 'A screenshot');

        $this->assertSame(['src', 'alt', 'width', 'height', 'srcSet'], array_keys($asset));
        $this->assertSame(1600, $asset['width']);
        $this->assertSame('/storage/projects/shot-800.webp 800w, /storage/projects/shot.png 1600w', $asset['srcSet']);
        Storage::disk('public')->assertExists('projects/shot-800.webp');
        $this->assertSame(800, getimagesize(Storage::disk('public')->path('projects/shot-800.webp'))[0]);
    }

    public function test_small_images_skip_the_variant_and_missing_ones_become_placeholders(): void
    {
        Storage::disk('public')->putFileAs('projects', UploadedFile::fake()->image('small.png', 600, 400), 'small.png');

        $this->assertArrayNotHasKey('srcSet', ImageAsset::make('projects/small.png', 'Small'));
        $this->assertSame(
            ['alt' => 'Gone', 'width' => 1600, 'height' => 1000, 'placeholderLabel' => 'Gone'],
            ImageAsset::make('projects/missing.png', 'Gone'),
        );
    }
}
