{{-- Small admin additions for the blog write page (counters, Google preview, editor stats, copy). --}}
<style>
    .bp-label { display: block; font-size: .75rem; font-weight: 500; color: var(--gray-500); margin-bottom: .375rem; }
    .bp-btn { flex: none; border: 1px solid var(--gray-300); border-radius: .5rem; padding: .3rem .75rem; font-size: .8125rem; font-weight: 500; color: var(--gray-700); background: white; cursor: pointer; }
    .bp-btn:hover { background: var(--gray-50); }
    .bp-btn:disabled { opacity: .4; cursor: default; }
    .dark .bp-btn { background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.12); color: var(--gray-200); }
    .bp-permalink-row { display: flex; align-items: center; gap: .75rem; min-width: 0; }
    .bp-link { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .875rem; color: var(--primary-600); }
    .dark .bp-link { color: var(--primary-400); }
    .bp-link:hover { text-decoration: underline; }
    .bp-counter { font-variant-numeric: tabular-nums; font-size: .75rem; color: var(--gray-500); }
    .bp-counter-over { color: var(--danger-600); font-weight: 600; }
    .bp-title-input { font-size: 1.5rem !important; line-height: 1.25 !important; font-weight: 600 !important; resize: none; }
    .bp-serp-card { border: 1px solid var(--gray-200); border-radius: .75rem; padding: 1rem 1.125rem; background: white; font-family: Arial, sans-serif; max-width: 40rem; }
    .dark .bp-serp-card { background: #202124; border-color: rgba(255,255,255,.1); }
    .bp-serp-site { display: flex; align-items: center; gap: .625rem; font-size: .8125rem; color: #202124; }
    .dark .bp-serp-site { color: #dadce0; }
    .bp-serp-favicon { display: grid; place-items: center; width: 1.75rem; height: 1.75rem; border-radius: 999px; background: #0b0b0c; color: #fff; font: 700 .625rem/1 ui-monospace, monospace; }
    .bp-serp-site > span:last-child { display: flex; flex-direction: column; line-height: 1.25; min-width: 0; }
    .bp-serp-url { color: #4d5156; font-size: .75rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .dark .bp-serp-url { color: #bdc1c6; }
    .bp-serp-title { margin-top: .5rem; color: #1a0dab; font-size: 1.25rem; line-height: 1.3; }
    .dark .bp-serp-title { color: #8ab4f8; }
    .bp-serp-desc { margin-top: .25rem; color: #4d5156; font-size: .875rem; line-height: 1.55; }
    .dark .bp-serp-desc { color: #bdc1c6; }
    .bp-serp-date { color: #70757a; }
    .bp-editor .tiptap, .bp-editor .ProseMirror { min-height: 28rem; max-height: calc(100vh - 14rem); overflow-y: auto; }
    .bp-stats p { display: flex; flex-wrap: wrap; gap: .25rem 1.25rem; font-size: .8125rem; color: var(--gray-500); }
    .bp-stats strong { color: var(--gray-900); font-weight: 600; font-variant-numeric: tabular-nums; }
    .dark .bp-stats strong { color: white; }
    .bp-details { display: grid; gap: .5rem; font-size: .875rem; }
    .bp-details div { display: flex; justify-content: space-between; gap: 1rem; }
    .bp-details dt { color: var(--gray-500); }
    .bp-details dd { font-weight: 500; text-align: right; font-variant-numeric: tabular-nums; }
    .bp-copy { display: grid; gap: .25rem; }
    .bp-copy-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: .75rem 0; border-bottom: 1px solid var(--gray-200); }
    .dark .bp-copy-row { border-color: rgba(255,255,255,.1); }
    .bp-copy-text { min-width: 0; }
    .bp-copy-value { display: block; font-size: .875rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .bp-copy-body .bp-copy-value { white-space: normal; color: var(--gray-500); }
    .bp-copy-buttons { display: flex; flex-wrap: wrap; gap: .5rem; justify-content: flex-end; }
    .bp-copy-note { margin-top: .5rem; font-size: .75rem; color: var(--gray-500); }
</style>
<script>
    // Words, reading time, headings and images of the rich editor's live content (HTML or TipTap JSON).
    window.blogEditorStats = function (state) {
        let text = '', headings = 0, images = 0
        if (typeof state === 'string') {
            const doc = new DOMParser().parseFromString(state, 'text/html')
            text = doc.body.textContent || ''
            headings = doc.querySelectorAll('h1, h2, h3, h4').length
            images = doc.querySelectorAll('img').length
        } else if (state && typeof state === 'object') {
            const walk = (node) => {
                if (! node || typeof node !== 'object') return
                if (node.type === 'heading') headings++
                if (node.type === 'image') images++
                if (node.type === 'text' && node.text) text += node.text + ' '
                ;(node.content || []).forEach(walk)
                if (['paragraph', 'heading', 'listItem', 'tableCell', 'tableHeader'].includes(node.type)) text += ' '
            }
            walk(state)
        }
        const words = (text.trim().match(/\S+/g) || []).length
        return { words, minutes: Math.max(1, Math.ceil(words / 225)), headings, images }
    }
</script>
