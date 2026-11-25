import { webp, type ImageAsset } from './types'

export interface ShowcaseStage {
  title: string
  text: string
  /** Set `src` to a real screenshot to replace the schematic placeholder. */
  image: ImageAsset
  /** Which schematic placeholder to draw while no screenshot exists. */
  sketch: 'fabric' | 'customize' | 'preview' | 'pricing' | 'order'
}

export const showcase = {
  projectSlug: 'customtailor',
  eyebrow: 'Configurator showcase',
  title: 'CustomTailor.store',
  intro:
    'An interactive custom tailoring platform with fabric selection, garment customization, live previews, dynamic pricing, and personalized ordering.',
  // Screenshots of the live configurator (1200x900 WebP in /public/images/showcase/).
  stages: [
    {
      title: 'Choose fabric',
      text: 'Customers browse the fabric range and pick the one for their garment.',
      image: webp('showcase/fabric', 'Fabric selection panel next to the suit preview', 1200, 900),
      sketch: 'fabric',
    },
    {
      title: 'Customize the garment',
      text: 'Style options and garment details are chosen step by step.',
      image: webp(
        'showcase/customize',
        'Style options for body style, vents and lapels',
        1200,
        900,
      ),
      sketch: 'customize',
    },
    {
      title: 'Live preview',
      text: 'Every choice is reflected in a live preview of the garment.',
      image: webp(
        'showcase/preview',
        'Suit preview updated to the selected plaid fabric',
        1200,
        900,
      ),
      sketch: 'preview',
    },
    {
      title: 'Dynamic pricing',
      text: 'The price updates instantly as options change.',
      image: webp(
        'showcase/pricing',
        'Price updated to $300 after choosing a different fabric',
        1200,
        900,
      ),
      sketch: 'pricing',
    },
    {
      title: 'Personalized order',
      text: 'The finished configuration is placed as a personalized order.',
      image: webp(
        'showcase/order',
        'Configured suit added to the cart, with the View cart button',
        1200,
        900,
      ),
      sketch: 'order',
    },
  ] satisfies ShowcaseStage[],
}
