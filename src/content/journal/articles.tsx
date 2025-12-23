import type { ReactNode } from 'react'
import { Typography } from '@/components/ui'

export type JournalArticleRecord = {
  section: string
  slug: string
  title: string
  summary: string
  tags: string[]
  pullQuotes?: string[]
  publishedAt?: string
  body: ReactNode
}

function paragraphCopy(text: string): ReactNode {
  return (
    <Typography key={text} variant="body" className="mb-4 text-text-secondary">
      {text}
    </Typography>
  )
}

export const journalArticles: JournalArticleRecord[] = [
  {
    section: 'Trends',
    slug: 'style-notes-linear-layers',
    title: 'Style Notes: Linear Layers',
    summary: 'Mastering the art of the mixed-metal stack with recycled chains and texture contrast.',
    tags: ['style-notes', 'layering', 'sustainability', 'mixed-metals'],
    pullQuotes: ['“Balance is found in the unexpected pairing of warm gold and cool silver.”'],
    publishedAt: '2025-11-01',
    body: (
      <>
        {paragraphCopy('The "rules" of matching metals are officially retired. This season is about the deliberate clash of 14k recycled gold vermeil against cool-toned sterling silver. The secret lies in the ratio: we recommend a 2:1 mix to keep the look intentional rather than accidental.')}
        {paragraphCopy('Start with a heavy-weight paperclip chain in gold as your anchor. Layer a delicate silver snake chain tailored 2 inches shorter to create visual breathing room. Finish with a mixed-metal pendant that bridges the gap, tying the silhouette together with a modern, industrial edge.')}
      </>
    ),
  },
  {
    section: 'Trends',
    slug: 'trend-radar-neon-elevation',
    title: 'Trend Radar: Neon Elevation',
    summary: 'Interjecting calm luxury with dopamine-inducing pops of neon enamel and colored stones.',
    tags: ['trend-radar', 'color-theory', 'y2k-influence'],
    pullQuotes: ['“Minimalism meets dopamine dressing in a single, electric accent.”'],
    publishedAt: '2025-10-28',
    body: (
      <>
        {paragraphCopy('While our palette leans neutral, the streets of Tokyo and New York are broadcasting a different signal: Electric Neon. The key to wearing this Y2K-revival trend without looking costumey is isolation. A single neon-green enamel heart on a bare collarbone says more than a full rainbow stack.')}
        {paragraphCopy('We’ve introduced a limited run of lab-grown sapphires in hot pink and electric blue. Set in our signature bezel settings, they offer a controlled explosion of color that elevates a simple white tee into a fashion statement.')}
      </>
    ),
  },
  {
    section: 'Playbooks',
    slug: 'playbooks-gifting-guide',
    title: 'Playbooks: Gifting Guide',
    summary: 'The ultimate recipe for personalized gifting, from birthstones to bespoke engravings.',
    tags: ['playbooks', 'gift-guides', 'personalization'],
    pullQuotes: ['“The most cherished gifts carry a secret only the wearer knows.”'],
    publishedAt: '2025-10-15',
    body: (
      <>
        {paragraphCopy('Gifting is an art form, and personalization is your medium. Skip the generic and go for the hyper-personal. Our concierge suggests starting with a signet ring canvas—a modern classic that suits every hand.')}
        {paragraphCopy('Elevate it by engraving a hidden message on the inner band, or choose a birthstone flush-set on the face. It turns a beautiful object into a future heirloom, satisfying the desire for connection without sacrificing our clean design language.')}
      </>
    ),
  },
  {
    section: 'Styling',
    slug: 'gift-guides-celestial-orbit',
    title: 'Gift Guides: Celestial Orbit',
    summary: 'Channeling cosmic energy through zodiac constellations and moon-phase motifs.',
    tags: ['gift-guides', 'celestial', 'zodiac', 'meaningful-jewelry'],
    pullQuotes: ['“Wear your universe. Let your jewelry align with your stars.”'],
    publishedAt: '2025-10-10',
    body: (
      <>
        {paragraphCopy('There is a quiet power in looking up. Our Celestial Orbit edit draws inspiration from the night sky, featuring pendants that map out zodiac constellations in drilling lab-diamonds.')}
        {paragraphCopy('Whether you are a fiery Leo or a grounded Virgo, these pieces serve as a daily talisman. Layer a crescent moon charm with your sun sign to capture the full scope of your astrological identity. It is personalization that feels written in the stars.')}
      </>
    ),
  },
  {
    section: 'Styling',
    slug: 'layering-field-guide',
    title: 'Layering Field Guide',
    summary: 'The definitive cheat sheet for necklace spacing and silhouette building.',
    tags: ['layering', 'styling', 'educational'],
    pullQuotes: ['“Breathe between the chains. Space is as important as the metal itself.”'],
    publishedAt: '2025-09-30',
    body: (
      <>
        {paragraphCopy('The perfect stack isn’t about wearing everything you own; it’s about geometry. The Golden Rule of Layering is the "2-Inch Gap." This prevents tangling and ensures each piece catches the light independently.')}
        {paragraphCopy('Start with a 14” choker base—this is your frame. Add a 16” textural layer, like a rope or herringbone chain. Anchor the look with an 18” pendant that draws the eye down. This inverted triangle creates length and elegance, working with any neckline.')}
      </>
    ),
  },
  {
    section: 'Creators',
    slug: 'spotlight-tonal-drop',
    title: 'Creator Spotlight: Tonal Drop',
    summary: 'How Tonal Drop used the Aurora hub to build a carbon-neutral capsule in under two weeks.',
    tags: ['spotlights', 'capsule-drops', 'creator-economy'],
    pullQuotes: ['“Capsule drops thrive when the story feels personal.”'],
    publishedAt: '2025-10-05',
    body: (
      <>
        {paragraphCopy('Creator Tonal Drop focused on silver + lab-diamond cuffs, building directly in the 3D customizer, then exporting Coral & Sky renders for social teasers before a single physical sample existed.')}
        {paragraphCopy('This digital-first approach minimized waste and allowed for real-time community feedback on the designs. The result was a sold-out launch that hit the 12–15 day shipping window, proving that speed and sustainability can coexist.')}
      </>
    ),
  },
  {
    section: 'Creators',
    slug: 'capsule-drop-prism-night',
    title: 'Capsule Drop: Prism Night',
    summary: 'A preview of the upcoming collaboration focusing on midnight textures and onyx accents.',
    tags: ['capsule-drops', 'creators', 'coming-soon'],
    pullQuotes: ['“Prism Night explores the beauty of the void—deep blacks and sudden sparks of light.”'],
    publishedAt: '2025-09-20',
    body: (
      <>
        {paragraphCopy('Prepare for the dark side of glow. The Prism Night capsule is a study in contrast, featuring matte black rhodium finishes and flush-set black onyx stones. It is jewelry for the after-hours, designed to disappear in the shadows and reappear under the strobe.')}
        {paragraphCopy('Dropping exclusively for our newsletter subscribers first. This collection challenges the assumption that jewelry must always shine—sometimes, it just needs to simmer.')}
      </>
    ),
  },
  {
    section: 'Tech & Materials',
    slug: 'lab-insights-spectrum-clarity',
    title: 'Lab Insights: Spectrum Clarity',
    summary: 'Tracing the journey of every carat from renewable energy source to your jewelry box.',
    tags: ['lab-insights', 'materials', 'sustainability', 'transparency'],
    pullQuotes: ['“Sustainability is not a buzzword; it is a measurable metric.”'],
    publishedAt: '2025-10-22',
    body: (
      <>
        {paragraphCopy('We believe you have the right to know the origin of your sparkle. Our Spectrum Clarity report tracks the energy source of every lab-grown diamond we set. We are proud to report that 100% of our current batch is crystallized using hydro and solar power.')}
        {paragraphCopy('Each Journal entry links to the specific stone certificate, ensuring that "conflict-free" means exactly what it says. Transparency is the ultimate luxury.')}
      </>
    ),
  },
  {
    section: 'Tech & Materials',
    slug: 'drop-calendar-halo-glow',
    title: 'Drop Calendar: Halo Glow',
    summary: 'Mark your calendars. The Q1 release schedule for the Halo Glow collection.',
    tags: ['drop-calendar', 'materials', 'releases'],
    pullQuotes: ['“Halo Glow is the anchor for our Q1 vision—soft light, hard edges.”'],
    publishedAt: '2025-09-15',
    body: (
      <>
        {paragraphCopy('The Halo Glow collection arrives precisely when the days get shorter. Expect pieces that maximize light return through innovative cutting techniques. Early access begins on January 15th for our Velvet Tier members.')}
        {paragraphCopy('Public access opens January 20th. Be ready—the signature "Lumen" pendant is expected to move quickly. Sign up for SMS notifications to secure your piece of the light.')}
      </>
    ),
  },
]
