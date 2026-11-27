<?php

namespace Tests\Feature;

use App\Mail\ContactMessageReceived;
use App\Models\ContactMessage;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ContactFormTest extends TestCase
{
    use RefreshDatabase;

    private array $valid = [
        'name' => 'Ada Lovelace',
        'email' => 'ada@example.com',
        'company' => 'Analytical Engines',
        'service' => 'e-commerce',
        'budget' => '$5,000 to $15,000',
        'message' => 'We need a product configurator for custom sneakers.',
        'botcheck' => '',
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedContent();
        Mail::fake();
    }

    public function test_a_message_is_stored_and_emailed_to_the_team(): void
    {
        Setting::putGroup('site', [...Setting::group('site'), 'notify_email' => 'team@example.com']);

        $this->postJson('/api/contact', $this->valid)->assertCreated();

        $message = ContactMessage::query()->sole();
        $this->assertSame('E-commerce & Product Customization', $message->service);
        $this->assertNull($message->read_at);
        Mail::assertSent(ContactMessageReceived::class, fn ($mail) => $mail->hasTo('team@example.com'));
    }

    public function test_without_a_notification_address_the_message_is_still_stored(): void
    {
        $this->postJson('/api/contact', $this->valid)->assertCreated();

        $this->assertSame(1, ContactMessage::query()->count());
        Mail::assertNothingSent();
    }

    public function test_invalid_input_is_rejected(): void
    {
        $this->postJson('/api/contact', [...$this->valid, 'email' => 'nope', 'message' => 'short', 'service' => 'unknown'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'message', 'service']);

        $this->assertSame(0, ContactMessage::query()->count());
    }

    public function test_bots_filling_the_honeypot_get_a_success_response_but_nothing_is_kept(): void
    {
        $this->postJson('/api/contact', [...$this->valid, 'botcheck' => 'gotcha'])->assertCreated();

        $this->assertSame(0, ContactMessage::query()->count());
    }

    public function test_submissions_are_rate_limited(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/contact', $this->valid)->assertCreated();
        }

        $this->postJson('/api/contact', $this->valid)->assertTooManyRequests();
    }
}
