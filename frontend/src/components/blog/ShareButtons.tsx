import { Check, Link2, Mail, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'

const X_PATH =
  'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z'
const LINKEDIN_PATH =
  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'

const FACEBOOK_PATH =
  'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z'
const PINTEREST_PATH =
  'M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z'

function Brand({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" focusable="false">
      <path d={path} fill="currentColor" />
    </svg>
  )
}

const btn = 'icon-btn transition-[color,border-color,background-color]'

/** Copy link, X, LinkedIn, Facebook, Pinterest, email, and the device share sheet where the browser has one. */
export function ShareButtons({
  url,
  title,
  image,
  className,
}: {
  url: string
  title: string
  /** Absolute image URL for Pinterest. */
  image?: string
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
        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btn}
        aria-label="Share on Facebook (opens in a new tab)"
        title="Share on Facebook"
      >
        <Brand path={FACEBOOK_PATH} />
      </a>
      <a
        href={`https://www.pinterest.com/pin/create/button/?url=${encoded}&description=${text}${image ? `&media=${encodeURIComponent(image)}` : ''}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btn}
        aria-label="Save on Pinterest (opens in a new tab)"
        title="Save on Pinterest"
      >
        <Brand path={PINTEREST_PATH} />
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
