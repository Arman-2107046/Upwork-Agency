import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'

const COPY_ICON =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="0"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'

/**
 * Renders the article HTML (sanitized by the backend) in the reading typography. Adds a copy
 * button to code blocks and keeps internal links inside the single-page app.
 */
export function ArticleBody({ html, className }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const cleanups: (() => void)[] = []
    root.querySelectorAll('pre').forEach((pre) => {
      if (pre.parentElement?.classList.contains('code-block')) return
      const wrap = document.createElement('div')
      wrap.className = 'code-block'
      pre.replaceWith(wrap)
      wrap.append(pre)
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'code-copy'
      button.innerHTML = `${COPY_ICON}<span>Copy</span>`
      const label = button.querySelector('span') as HTMLSpanElement
      let timer = 0
      const onClick = async () => {
        try {
          await navigator.clipboard.writeText(pre.innerText)
          label.textContent = 'Copied'
        } catch {
          label.textContent = 'Press Ctrl+C'
        }
        window.clearTimeout(timer)
        timer = window.setTimeout(() => (label.textContent = 'Copy'), 2000)
      }
      button.addEventListener('click', onClick)
      wrap.append(button)
      cleanups.push(() => {
        button.removeEventListener('click', onClick)
        window.clearTimeout(timer)
      })
    })
    return () => cleanups.forEach((fn) => fn())
  }, [html])

  return (
    <div
      ref={ref}
      className={cn('prose-article', className)}
      onClick={(e) => {
        const link = (e.target as HTMLElement).closest('a')
        if (!link || link.target || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey)
          return
        const url = new URL(link.href, window.location.href)
        if (url.origin !== window.location.origin || url.pathname.startsWith('/storage/')) return
        if (url.pathname === window.location.pathname && url.hash) return
        e.preventDefault()
        navigate(url.pathname + url.search + url.hash)
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
