<?php

namespace App\Http\Controllers\Api;

use App\Content\SiteContent;
use App\Http\Controllers\Controller;
use App\Mail\ContactMessageReceived;
use App\Models\ContactMessage;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Throwable;

class ContactController extends Controller
{
    /** Rules mirror frontend/src/lib/validators.ts. */
    public function __invoke(Request $request): JsonResponse
    {
        // Honeypot: bots fill the hidden field. Pretend success and keep nothing.
        if (filled($request->input('botcheck'))) {
            return response()->json(['ok' => true], 201);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'string', 'email', 'max:254'],
            'company' => ['nullable', 'string', 'max:160'],
            'service' => ['nullable', 'string', Rule::exists('services', 'slug')->where('is_published', true)],
            'budget' => ['nullable', 'string', Rule::in(ContactMessage::BUDGETS)],
            'message' => ['required', 'string', 'min:20', 'max:5000'],
        ]);

        $service = filled($data['service'] ?? null)
            ? Service::query()->where('slug', $data['service'])->value('title')
            : null;

        $message = ContactMessage::create([
            ...$data,
            'service' => $service,
            'ip_address' => $request->ip(),
            'user_agent' => Str::limit((string) $request->userAgent(), 490, ''),
        ]);

        $this->notify($message);

        return response()->json(['ok' => true], 201);
    }

    /** Emails the team. A mail failure never loses the message: it is already saved. */
    private function notify(ContactMessage $message): void
    {
        $site = SiteContent::settings('site');
        $to = $site['notify_email'] ?: $site['email'] ?: config('mail.contact_to');
        if (! $to) {
            return;
        }

        try {
            Mail::to($to)->send(new ContactMessageReceived($message, $site['brand_name']));
        } catch (Throwable $e) {
            Log::error('Contact notification email failed', ['message_id' => $message->id, 'error' => $e->getMessage()]);
        }
    }
}
