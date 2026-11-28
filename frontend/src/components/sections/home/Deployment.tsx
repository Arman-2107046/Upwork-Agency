import { SectionHeader } from '@/components/ui/SectionHeader'
import { TechLogo } from '@/components/ui/TechLogo'
import { TextLink } from '@/components/ui/TextLink'
import { deployment, sectionIndex } from '@/data/home'
import { getService, servicePath } from '@/data/services'
import { Reveal } from '@/motion/Reveal'
import { Stagger, StaggerItem } from '@/motion/Stagger'

/** Platforms we deploy to (logo rows) and what ongoing maintenance covers. */
export function Deployment() {
  const { eyebrow, title, intro, platformGroups, maintenance } = deployment
  const cloud = getService('cloud')

  return (
    <section
      aria-labelledby="deployment-title"
      className="relative border-t border-line py-28 sm:py-40"
    >
      <div className="container-content relative">
        <SectionHeader
          layout="split"
          index={sectionIndex.deployment}
          id="deployment-title"
          eyebrow={eyebrow}
          title={title}
          mutedWords={3}
          intro={
            intro || cloud ? (
              <>
                {intro ? <p>{intro}</p> : null}
                {cloud ? (
                  <p className="mt-6">
                    <TextLink to={servicePath(cloud.slug)} arrow>
                      {cloud.title}
                    </TextLink>
                  </p>
                ) : null}
              </>
            ) : undefined
          }
        />

        <div className="mt-16 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-8">
          <Stagger as="ul" className={maintenance.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'}>
            {platformGroups.map((group) => (
              <StaggerItem
                as="li"
                key={group.label}
                className="grid gap-4 border-t border-line py-6 last:border-b sm:grid-cols-[10rem_1fr] sm:items-center sm:gap-6"
              >
                <h3 className="flex items-center justify-between gap-4 font-mono text-label font-normal tracking-[0.22em] text-muted uppercase sm:block">
                  {group.label}
                  <span aria-hidden="true" className="tabular-nums sm:mt-1 sm:block">
                    {String(group.items.length).padStart(2, '0')}
                  </span>
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="inline-flex min-h-12 items-center gap-3 border border-line bg-bg px-4 py-2 text-sm font-medium transition-colors duration-[var(--dur-micro)] hover:border-fg"
                    >
                      <TechLogo name={item} size={20} />
                      {item}
                    </li>
                  ))}
                </ul>
              </StaggerItem>
            ))}
          </Stagger>

          {maintenance.length > 0 ? (
            <Reveal className="lg:col-span-5 lg:col-start-8">
              <div className="border border-line bg-surface p-6 sm:p-8">
                <p className="eyebrow">After launch</p>
                <h3 className="mt-3 text-title">Maintenance</h3>
                <ol className="mt-6 border-t border-line">
                  {maintenance.map((item, i) => (
                    <li
                      key={item.title}
                      className="flex gap-4 border-b border-line py-4 last:border-b-0 last:pb-0"
                    >
                      <span className="pt-0.5 font-mono text-xs text-accent-ink tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="mt-1 text-sm text-muted">{item.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  )
}
