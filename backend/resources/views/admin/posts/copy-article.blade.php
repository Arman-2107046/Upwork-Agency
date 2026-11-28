{{-- "Copy article": each part of the post as it is in the form now, ready to paste into another site. --}}
@php
    $items = [
        ['label' => 'Title', 'value' => $title],
        ['label' => 'Meta title', 'value' => $seoTitle],
        ['label' => 'Meta description', 'value' => $seoDescription],
        ['label' => 'Slug', 'value' => $slug],
        ['label' => 'Public URL', 'value' => $url],
    ];
@endphp
<div x-data="{
        copied: null,
        done(key) { this.copied = key; setTimeout(() => { if (this.copied === key) this.copied = null }, 2000) },
        text(key, value) { navigator.clipboard.writeText(value).then(() => this.done(key)) },
        rich(html, plain) {
            const item = new ClipboardItem({
                'text/html': new Blob([html], { type: 'text/html' }),
                'text/plain': new Blob([plain], { type: 'text/plain' }),
            })
            navigator.clipboard.write([item]).then(() => this.done('rich'))
        },
    }" class="bp-copy">
    @foreach ($items as $i => $item)
        <div class="bp-copy-row">
            <div class="bp-copy-text">
                <span class="bp-label">{{ $item['label'] }}</span>
                <span class="bp-copy-value">{{ $item['value'] !== '' ? $item['value'] : '—' }}</span>
            </div>
            <button type="button" class="bp-btn" x-on:click="text('f{{ $i }}', @js($item['value']))"
                x-text="copied === 'f{{ $i }}' ? 'Copied' : 'Copy'" @disabled($item['value'] === '')></button>
        </div>
    @endforeach

    <div class="bp-copy-row bp-copy-body">
        <div class="bp-copy-text">
            <span class="bp-label">Article body</span>
            <span class="bp-copy-value">{{ number_format($words) }} words. Rich text pastes into editors such as WordPress, Google Docs or Medium; HTML and Markdown are plain text.</span>
        </div>
        <div class="bp-copy-buttons">
            <button type="button" class="bp-btn" x-on:click="rich(@js($html), @js($plain))" x-text="copied === 'rich' ? 'Copied' : 'Rich text'"></button>
            <button type="button" class="bp-btn" x-on:click="text('html', @js($html))" x-text="copied === 'html' ? 'Copied' : 'HTML'"></button>
            <button type="button" class="bp-btn" x-on:click="text('md', @js($markdown))" x-text="copied === 'md' ? 'Copied' : 'Markdown'"></button>
        </div>
    </div>
    <p class="bp-copy-note">Copies what is in the form now, saved or not. Images keep their address on this site.</p>
</div>
