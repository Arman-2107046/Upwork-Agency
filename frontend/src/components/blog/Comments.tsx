import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Check } from 'lucide-react'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { PostCommentItem } from '@/content/types'
import { formatDate } from '@/data/posts'
import { OfflineError, RateLimitedError, sendComment, ValidationError } from '@/lib/blogApi'
import { cn } from '@/lib/cn'
import { commentSchema, type CommentValues } from '@/lib/validators'

const fieldClass =
  'block w-full min-h-12 border border-line-strong bg-surface px-4 py-3 text-base text-fg transition-colors duration-[var(--dur-micro)] placeholder:text-muted/80 hover:border-fg/40 focus-visible:border-fg aria-[invalid=true]:border-danger'

const labelClass =
  'mb-2 flex items-baseline justify-between gap-4 font-mono text-label tracking-[0.2em] uppercase'

function initial(name: string): string {
  return (name.trim()[0] ?? '?').toUpperCase()
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <div id={id} aria-live="polite" className="min-h-6 pt-1.5 pb-3">
      {message ? (
        <p className="flex items-start gap-1.5 text-sm text-danger">
          <AlertCircle size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
          {message}
        </p>
      ) : null}
    </div>
  )
}

type Status = 'idle' | 'sending' | 'sent' | 'error' | 'rate-limited' | 'offline'

function CommentForm({ slug }: { slug: string }) {
  const [status, setStatus] = useState<Status>('idle')
  const uid = useId()
  const id = (name: string) => `${uid}-${name}`
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CommentValues>({
    resolver: zodResolver(commentSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { name: '', email: '', body: '', website: '' },
  })

  const onSubmit = async (values: CommentValues) => {
    setStatus('sending')
    // Bots fill the hidden field. Pretend success and send nothing.
    if (values.website) {
      reset()
      setStatus('sent')
      return
    }
    try {
      await sendComment(slug, values)
      reset()
      setStatus('sent')
    } catch (error) {
      if (error instanceof ValidationError) {
        for (const [field, messages] of Object.entries(error.fields)) {
          if (field === 'name' || field === 'email' || field === 'body') {
            setError(field, { message: messages[0] }, { shouldFocus: true })
          }
        }
        setStatus('idle')
      } else if (error instanceof RateLimitedError) {
        setStatus('rate-limited')
      } else if (error instanceof OfflineError) {
        setStatus('offline')
      } else {
        setStatus('error')
      }
    }
  }

  if (status === 'sent') {
    return (
      <div
        role="status"
        className="flex items-start gap-4 border border-line bg-surface p-6 sm:p-8"
      >
        <span className="grid size-10 shrink-0 place-items-center border border-accent text-accent-ink">
          <Check size={18} aria-hidden="true" />
        </span>
        <div>
          <p className="font-medium">Thanks, your comment is in.</p>
          <p className="mt-1 text-muted">It will appear once the team has read it.</p>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="link-underline mt-4 text-sm"
          >
            Write another comment
          </button>
        </div>
      </div>
    )
  }

  const describe = (name: keyof CommentValues) => id(`${name}-error`)
  const alert =
    status === 'rate-limited'
      ? 'That was a lot of comments in a short time. Please wait a minute and try again.'
      : status === 'offline'
        ? 'You seem to be offline. Check your connection and send it again.'
        : status === 'error'
          ? 'Your comment could not be sent. Please try again in a moment.'
          : null

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} aria-labelledby={id('title')}>
      <p id={id('title')} className="eyebrow mb-6">
        Leave a comment
      </p>

      {/* Honeypot: hidden from people and assistive tech, tempting to bots */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor={id('website')}>Leave this field empty</label>
        <input
          id={id('website')}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register('website')}
        />
      </div>

      <div className="grid gap-x-6 sm:grid-cols-2">
        <div>
          <label htmlFor={id('name')} className={labelClass}>
            Name
          </label>
          <input
            id={id('name')}
            type="text"
            autoComplete="name"
            aria-required="true"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describe('name')}
            className={fieldClass}
            {...register('name')}
          />
          <FieldError id={describe('name')} message={errors.name?.message} />
        </div>
        <div>
          <label htmlFor={id('email')} className={labelClass}>
            Email
            <span className="font-sans text-xs tracking-normal text-muted normal-case">
              Never shown
            </span>
          </label>
          <input
            id={id('email')}
            type="email"
            autoComplete="email"
            inputMode="email"
            aria-required="true"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describe('email')}
            className={fieldClass}
            {...register('email')}
          />
          <FieldError id={describe('email')} message={errors.email?.message} />
        </div>
      </div>
      <div>
        <label htmlFor={id('body')} className={labelClass}>
          Comment
        </label>
        <textarea
          id={id('body')}
          rows={5}
          aria-required="true"
          aria-invalid={errors.body ? true : undefined}
          aria-describedby={describe('body')}
          className={cn(fieldClass, 'resize-y')}
          {...register('body')}
        />
        <FieldError id={describe('body')} message={errors.body?.message} />
      </div>

      {alert ? (
        <p
          role="alert"
          className="mb-6 flex items-start gap-2 border border-danger/40 p-4 text-sm text-danger"
        >
          <AlertCircle size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
          {alert}
        </p>
      ) : null}

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-sm text-muted">
          Comments appear after the team approves them. Your email is never shown.
        </p>
        <Button type="submit" disabled={status === 'sending'} aria-disabled={status === 'sending'}>
          {status === 'sending' ? (
            <>
              <Spinner />
              Sending
            </>
          ) : (
            'Post comment'
          )}
        </Button>
      </div>
    </form>
  )
}

/** Approved comments (oldest first), then the form. New comments wait for the team's approval. */
export function Comments({
  slug,
  comments,
  className,
}: {
  slug: string
  comments: PostCommentItem[]
  className?: string
}) {
  const count = comments.length
  return (
    <section
      id="comments"
      aria-labelledby="comments-title"
      className={cn('scroll-mt-32 border-t border-line pt-12', className)}
    >
      <h2 id="comments-title" className="text-title">
        {count === 0 ? 'Comments' : `${count} ${count === 1 ? 'comment' : 'comments'}`}
      </h2>
      {count === 0 ? (
        <p className="mt-3 text-muted">No comments yet. Start the conversation.</p>
      ) : (
        <ol className="mt-8 divide-y divide-line border-y border-line">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-4 py-6">
              <span
                aria-hidden="true"
                className="grid size-10 shrink-0 place-items-center border border-line bg-surface-2 font-mono text-xs"
              >
                {initial(c.name)}
              </span>
              <div className="min-w-0">
                <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-medium">{c.name}</span>
                  <time dateTime={c.date} className="font-mono text-xs text-muted">
                    {formatDate(c.date)}
                  </time>
                </p>
                <p className="mt-2 leading-relaxed break-words whitespace-pre-line text-fg/90">
                  {c.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
      <div className="mt-12">
        <CommentForm slug={slug} />
      </div>
    </section>
  )
}
