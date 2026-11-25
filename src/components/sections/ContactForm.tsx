import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, m } from 'framer-motion'
import { AlertCircle, ChevronDown } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { site } from '@/config/site'
import { getService, services } from '@/data/services'
import { cn } from '@/lib/cn'
import { budgetOptions, contactSchema, type ContactValues } from '@/lib/validators'
import { Stagger, StaggerItem } from '@/motion/Stagger'
import { duration, ease } from '@/motion/tokens'
import { reducedTransition } from '@/motion/variants'
import { useMotionPreference } from '@/motion/useMotionPreference'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const fieldClass =
  'block w-full min-h-12 border border-line-strong bg-surface px-4 py-3 text-base text-fg transition-colors duration-[var(--dur-micro)] placeholder:text-muted/80 hover:border-fg/40 focus-visible:border-fg aria-[invalid=true]:border-danger'

/** Error slot with reserved height: messages fade in without moving anything below. */
function FieldError({ id, message }: { id: string; message?: string }) {
  const pref = useMotionPreference()
  return (
    <div id={id} aria-live="polite" className="min-h-6 pt-1.5">
      <AnimatePresence initial={false}>
        {message ? (
          <m.p
            key={message}
            className="flex items-start gap-1.5 text-sm text-danger"
            initial={{ opacity: 0, y: pref === 'reduced' ? 0 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={
              pref === 'reduced'
                ? reducedTransition
                : { duration: duration.micro, ease: ease.outExpo }
            }
          >
            <AlertCircle size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
            {message}
          </m.p>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string
  hint?: string
  htmlFor: string
  children: ReactNode
}) {
  return (
    <StaggerItem distance={24}>
      <label
        htmlFor={htmlFor}
        className="mb-2 flex items-baseline justify-between gap-4 font-mono text-label tracking-[0.2em] uppercase"
      >
        {label}
        {hint ? (
          <span className="font-sans text-xs tracking-normal text-muted normal-case">{hint}</span>
        ) : null}
      </label>
      {children}
    </StaggerItem>
  )
}

function SuccessPanel({ onReset }: { onReset: () => void }) {
  const pref = useMotionPreference()
  return (
    <m.div
      role="status"
      className="flex flex-col items-start border border-line bg-surface p-8 sm:p-10"
      initial={{ opacity: 0, y: pref === 'reduced' ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        pref === 'reduced' ? reducedTransition : { duration: duration.base, ease: ease.outExpo }
      }
    >
      <svg
        viewBox="0 0 52 52"
        className="size-14 text-accent-ink"
        aria-hidden="true"
        focusable="false"
      >
        <m.circle
          cx="26"
          cy="26"
          r="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          initial={{ pathLength: pref === 'reduced' ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: duration.base, ease: ease.outExpo }}
        />
        <m.path
          d="M15 27 L23 35 L38 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: pref === 'reduced' ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: duration.base, ease: ease.outExpo, delay: duration.micro }}
        />
      </svg>
      <h2 className="mt-6 text-title">Thanks, your message is on its way.</h2>
      <p className="mt-3 text-muted">We will get back to you {site.responseTime}.</p>
      <Button type="button" variant="secondary" className="mt-8" onClick={onReset}>
        Send another message
      </Button>
    </m.div>
  )
}

async function submitToEndpoint(values: ContactValues): Promise<void> {
  if (!site.formEndpoint) throw new Error('Form endpoint is not configured')
  const service = getService(values.service)
  const res = await fetch(site.formEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      ...(site.formAccessKey ? { access_key: site.formAccessKey } : {}),
      subject: `New project enquiry from ${values.name}`,
      from_name: site.brandName,
      name: values.name,
      email: values.email,
      company: values.company ?? '',
      service: service?.title ?? 'Not specified',
      budget: values.budget,
      message: values.message,
    }),
  })
  if (!res.ok) throw new Error(`Form endpoint responded with ${res.status}`)
}

export function ContactForm({ defaultService }: { defaultService?: string }) {
  const [status, setStatus] = useState<Status>('idle')
  const uid = useId()
  const id = (name: string) => `${uid}-${name}`
  const preselected = getService(defaultService)?.slug ?? ''

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      company: '',
      service: preselected,
      budget: 'Not sure yet',
      message: '',
      botcheck: '',
    },
  })

  const onSubmit = async (values: ContactValues) => {
    setStatus('submitting')
    // Bots fill the hidden field. Pretend success and send nothing.
    if (values.botcheck) {
      reset()
      setStatus('success')
      return
    }
    try {
      await submitToEndpoint(values)
      reset()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return <SuccessPanel onReset={() => setStatus('idle')} />
  }

  const describe = (name: keyof ContactValues) => id(`${name}-error`)
  const mailto = site.email
    ? `mailto:${site.email}?subject=${encodeURIComponent('Project enquiry')}`
    : null

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} aria-describedby={id('required-note')}>
      <p id={id('required-note')} className="mb-8 text-sm text-muted">
        Fields marked “required” must be filled in.
      </p>

      {/* Honeypot: hidden from people and assistive tech, tempting to bots */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor={id('botcheck')}>Leave this field empty</label>
        <input
          id={id('botcheck')}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register('botcheck')}
        />
      </div>

      <Stagger className="grid gap-x-6 gap-y-2 sm:grid-cols-2" amount="some">
        <Field label="Name" hint="Required" htmlFor={id('name')}>
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
        </Field>

        <Field label="Email" hint="Required" htmlFor={id('email')}>
          <input
            id={id('email')}
            type="email"
            inputMode="email"
            autoComplete="email"
            aria-required="true"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describe('email')}
            className={fieldClass}
            {...register('email')}
          />
          <FieldError id={describe('email')} message={errors.email?.message} />
        </Field>

        <Field label="Company" hint="Optional" htmlFor={id('company')}>
          <input
            id={id('company')}
            type="text"
            autoComplete="organization"
            aria-describedby={describe('company')}
            className={fieldClass}
            {...register('company')}
          />
          <FieldError id={describe('company')} message={errors.company?.message} />
        </Field>

        <Field label="Service" htmlFor={id('service')}>
          <div className="relative">
            <select
              id={id('service')}
              className={cn(fieldClass, 'appearance-none pr-11')}
              {...register('service')}
            >
              <option value="">Not sure / several</option>
              {services.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.title}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted"
            />
          </div>
          <FieldError id={describe('service')} message={errors.service?.message} />
        </Field>

        <Field label="Budget" htmlFor={id('budget')}>
          <div className="relative">
            <select
              id={id('budget')}
              className={cn(fieldClass, 'appearance-none pr-11')}
              {...register('budget')}
            >
              {budgetOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted"
            />
          </div>
          <FieldError id={describe('budget')} message={errors.budget?.message} />
        </Field>

        <div className="hidden sm:block" aria-hidden="true" />

        <div className="sm:col-span-2">
          <Field label="Message" hint="Required, at least 20 characters" htmlFor={id('message')}>
            <textarea
              id={id('message')}
              rows={6}
              aria-required="true"
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={describe('message')}
              className={cn(fieldClass, 'resize-y')}
              {...register('message')}
            />
            <FieldError id={describe('message')} message={errors.message?.message} />
          </Field>
        </div>

        <StaggerItem className="sm:col-span-2">
          <div aria-live="assertive">
            {status === 'error' ? (
              <div role="alert" className="mb-6 flex gap-3 border border-danger/40 p-4 text-sm">
                <AlertCircle size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-danger" />
                <p>
                  We couldn’t send your message just now. Your text is still here, so you can try
                  again
                  {mailto ? (
                    <>
                      , or{' '}
                      <a href={mailto} className="font-medium underline underline-offset-4">
                        email us directly at {site.email}
                      </a>
                    </>
                  ) : null}
                  .
                </p>
              </div>
            ) : null}
          </div>
          <Button
            type="submit"
            disabled={status === 'submitting'}
            aria-busy={status === 'submitting'}
            className="min-w-44"
          >
            {status === 'submitting' ? (
              <span className="inline-flex items-center gap-2">
                <Spinner /> Sending…
              </span>
            ) : (
              'Send message'
            )}
          </Button>
        </StaggerItem>
      </Stagger>
    </form>
  )
}
