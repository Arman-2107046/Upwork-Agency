{{-- The post's public address, following the Address field as it is typed. --}}
<div
    x-data="{ copied: false, get url() { return @js($base) + '/blog/' + ($wire.data.slug || '') } }"
    class="bp-permalink"
>
    <span class="bp-label">Permalink</span>
    <div class="bp-permalink-row">
        <a x-bind:href="url" target="_blank" rel="noopener" class="bp-link" x-text="url"></a>
        <button
            type="button"
            class="bp-btn"
            x-on:click="navigator.clipboard.writeText(url).then(() => { copied = true; setTimeout(() => copied = false, 2000) })"
            x-text="copied ? 'Copied' : 'Copy'"
        ></button>
    </div>
</div>
