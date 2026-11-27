import { IndexLabel } from '@/components/ui/SectionHeader'
import { intro } from '@/data/about'
import { Reveal } from '@/motion/Reveal'
import { TextScrollFill } from '@/motion/TextScrollFill'

export function Statement() {
  return (
    <section aria-labelledby="statement-title" className="relative py-28 sm:py-40">
      <div className="container-content relative grid gap-8 lg:grid-cols-12">
        <Reveal className="lg:col-span-3 lg:pt-3">
          <h2 id="statement-title">
            <IndexLabel index={1}>What we do</IndexLabel>
          </h2>
        </Reveal>
        <TextScrollFill text={intro} className="display text-statement lg:col-span-9" />
      </div>
    </section>
  )
}
