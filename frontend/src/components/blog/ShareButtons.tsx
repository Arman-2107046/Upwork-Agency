import { Check, Link2, Mail, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'

const X_PATH =
  'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z'
const LINKEDIN_PATH =
  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'

function Brand({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" focusable="false">
      <path d={path} fill="currentColor" />
    </svg>
  )
}

const btn = 'icon-btn transition-[color,border-color,background-color]'

/** Copy link, X, LinkedIn, email, and the device share sheet where the browser has one. */
export function ShareButtons({
  url,
  title,
  className,
}: {
  url: string
  title: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)
  // Client-rendered only, so the device share sheet can be detected during render.
  const canShare = typeof navigator.share === 'function'

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(id)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      window.prompt('Copy this link', url)
    }
  }

  const encoded = encodeURIComponent(url)
  const text = encodeURIComponent(title)

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <button
        type="button"
        onClick={copy}
        className={cn(btn, copied && 'border-accent text-accent-ink')}
        aria-label={copied ? 'Link copied' : 'Copy link'}
        title={copied ? 'Link copied' : 'Copy link'}
      >
        {copied ? <Check size={16} aria-hidden="true" /> : <Link2 size={16} aria-hidden="true" />}
      </button>
      <a
        href={`https://x.com/intent/post?url=${encoded}&text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btn}
        aria-label="Share on X (opens in a new tab)"
        title="Share on X"
      >
        <Brand path={X_PATH} />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btn}
        aria-label="Share on LinkedIn (opens in a new tab)"
        title="Share on LinkedIn"
      >
        <Brand path={LINKEDIN_PATH} />
      </a>
      <a
        href={`mailto:?subject=${text}&body=${encoded}`}
        className={btn}
        aria-label="Share by email"
        title="Share by email"
      >
        <Mail size={16} aria-hidden="true" />
      </a>
      {canShare ? (
        <button
          type="button"
          onClick={() => navigator.share({ title, url }).catch(() => undefined)}
          className={btn}
          aria-label="More sharing options"
          title="More sharing options"
        >
          <Share2 size={16} aria-hidden="true" />
        </button>
      ) : null}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? 'Link copied to the clipboard' : ''}
      </span>
    </div>
  )
}
