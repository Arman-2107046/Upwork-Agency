{{-- A Google result preview: meta title or title, the address, the date, meta description or excerpt. --}}
<div
    x-data="{
        host: @js(parse_url($base, PHP_URL_HOST) ?: 'example.com'),
        get title() { return ($wire.data.seo_title || $wire.data.title || 'Post title') + ' | ' + @js(\App\Content\SiteContent::settings('site')['brand_name'] ?? '') },
        get description() { return $wire.data.seo_description || $wire.data.excerpt || 'The excerpt shows here when no meta description is set.' },
        get date() {
            const d = $wire.data.published_at ? new Date(String($wire.data.published_at).replace(' ', 'T')) : null
            return d && ! isNaN(d) ? d.toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' }) + ' — ' : ''
        },
    }"
    class="bp-serp"
    aria-label="Google result preview"
>
    <span class="bp-label">Google preview</span>
    <div class="bp-serp-card">
        <div class="bp-serp-site">
            <span class="bp-serp-favicon" aria-hidden="true">&gt;_</span>
            <span>
                <span class="bp-serp-name" x-text="host"></span>
                <span class="bp-serp-url" x-text="'https://' + host + ' › blog › ' + ($wire.data.slug || '…')"></span>
            </span>
        </div>
        <p class="bp-serp-title" x-text="title.length > 64 ? title.slice(0, 62) + '…' : title"></p>
        <p class="bp-serp-desc"><span class="bp-serp-date" x-text="date"></span><span x-text="description.length > 160 ? description.slice(0, 157) + '…' : description"></span></p>
    </div>
</div>
