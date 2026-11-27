<x-mail::message>
# New project enquiry

**Name:** {{ $contactMessage->name }}<br>
**Email:** {{ $contactMessage->email }}<br>
@if ($contactMessage->company)
**Company:** {{ $contactMessage->company }}<br>
@endif
**Service:** {{ $contactMessage->service ?: 'Not specified' }}<br>
**Budget:** {{ $contactMessage->budget ?: 'Not specified' }}

<x-mail::panel>
{{ $contactMessage->message }}
</x-mail::panel>

<x-mail::button :url="url('/admin/contact-messages/'.$contactMessage->id)">
Open in the admin
</x-mail::button>

Reply to this email to answer {{ $contactMessage->name }} directly.

{{ $brand }}
</x-mail::message>
