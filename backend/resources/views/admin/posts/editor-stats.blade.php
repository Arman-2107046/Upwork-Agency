{{-- Live counts under the editor (window.blogEditorStats in resources/views/admin/scripts.blade.php). --}}
<div x-data="{ get s() { return window.blogEditorStats ? window.blogEditorStats($wire.data.body) : null } }" class="bp-stats" aria-live="off">
    <template x-if="s">
        <p>
            <span><strong x-text="s.words.toLocaleString()"></strong> words</span>
            <span><strong x-text="s.minutes"></strong> min read</span>
            <span><strong x-text="s.headings"></strong> headings</span>
            <span><strong x-text="s.images"></strong> images</span>
        </p>
    </template>
</div>
