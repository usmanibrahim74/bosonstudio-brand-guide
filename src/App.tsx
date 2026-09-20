import { useEffect, useState, type ReactNode } from 'react'
import { MARK_PATH, TEXT_PATHS } from './logo'
import { Manifesto } from './Manifesto'

// ─── Brand tokens (mirrors @theme in index.css) ──────────────────────────────
const NIGHT = '#050E12'
const FOREST = '#0B332C'
const GREEN = '#00DC5F'
const TEAL = '#2EE6C8'
const VIOLET = '#9A6BFF'
const LIME = '#D8EDA0'
const MIST = '#EEF3F1'

const ATMOSPHERE_CSS = `background:
  radial-gradient(60% 90% at 18% 0%, rgba(0,220,95,.38), transparent 60%),
  radial-gradient(50% 80% at 62% 8%, rgba(46,230,200,.26), transparent 62%),
  radial-gradient(38% 60% at 90% 40%, rgba(154,107,255,.20), transparent 64%),
  #050E12;`

// ─── Logo ─────────────────────────────────────────────────────────────────────

function BosonMark({ color = GREEN, size = 48, className = '' }: { color?: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="13 5 216 217" fill="none" className={className} aria-hidden="true">
      <path d={MARK_PATH} fill={color} />
    </svg>
  )
}

function BosonLogo({ markColor = GREEN, textColor = 'currentColor', height = 44, className = '' }: {
  markColor?: string; textColor?: string; height?: number; className?: string
}) {
  const w = Math.round((630 / 227) * height)
  return (
    <svg width={w} height={height} viewBox="0 0 630 227" fill="none" className={className} role="img" aria-label="boson studio">
      {TEXT_PATHS.map((d, i) => <path key={i} d={d} fill={textColor} />)}
      <path d={MARK_PATH} fill={markColor} />
    </svg>
  )
}

// ─── Atmosphere ───────────────────────────────────────────────────────────────

function Aurora({ hero = false, ribbons = true, lattice = true, grain = true }: {
  hero?: boolean; ribbons?: boolean; lattice?: boolean; grain?: boolean
}) {
  // Soft ribbons in both themes. In a hero they sway and breathe; elsewhere they are still.
  return (
    <div className={`aurora ${hero ? 'hero-aurora' : ''}`} aria-hidden="true">
      {ribbons && (
        <>
          <div className="ribbon ribbon-low" style={{ '--dur': '19s', '--delay': '-6s', '--op': 0.85 } as React.CSSProperties} />
          <div className="ribbon ribbon-green" style={{ '--dur': '13s', '--op': 1 } as React.CSSProperties} />
          <div className="ribbon ribbon-lime" style={{ '--dur': '16s', '--delay': '-9s', '--op': 0.95 } as React.CSSProperties} />
          <div className="ribbon ribbon-far" style={{ '--dur': '21s', '--delay': '-14s', '--op': 0.85 } as React.CSSProperties} />
        </>
      )}
      {lattice && <div className="lattice absolute inset-0" />}
      {grain && <div className="grain absolute inset-0" />}
    </div>
  )
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function useCopy(): [boolean, (text: string) => void] {
  const [copied, setCopied] = useState(false)
  const copy = (text: string) => {
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }
  return [copied, copy]
}

const CHAPTERS = [
  { id: 'manifesto', n: '01', label: 'Manifesto' },
  { id: 'origin', n: '02', label: 'Origin' },
  { id: 'mark', n: '03', label: 'Mark' },
  { id: 'color', n: '04', label: 'Color' },
  { id: 'field', n: '05', label: 'Field and light' },
  { id: 'type', n: '06', label: 'Type' },
  { id: 'motion', n: '07', label: 'Motion' },
  { id: 'in-use', n: '08', label: 'In use' },
  { id: 'voice', n: '09', label: 'Voice' },
]

type Theme = 'dark' | 'light'
function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'))
  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try { localStorage.setItem('boson-theme', next) } catch { /* private mode */ }
    setTheme(next)
  }
  return [theme, toggle]
}

function Nav({ active }: { active: string }) {
  const current = CHAPTERS.find(c => c.id === active)
  const [theme, toggleTheme] = useTheme()
  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b hairline bg-surface/80 backdrop-blur-md">
      <div className="mx-auto max-w-[1180px] px-5 md:px-10 h-14 flex items-center justify-between gap-6">
        <a href="#top" className="flex items-center shrink-0" aria-label="Back to top">
          <BosonLogo height={22} />
        </a>
        <div className="nav-links flex items-center gap-1 overflow-x-auto">
          {CHAPTERS.map(c => (
            <a key={c.id} href={`#${c.id}`}
              className={`shrink-0 px-2.5 py-1 text-[12px] tracking-[0.01em] rounded transition-colors ${active === c.id ? 'text-accent' : 'text-faint hover:text-ink'}`}>
              <span className="font-mono text-[11px] mr-1.5 opacity-70">{c.n}</span>{c.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden md:block font-mono text-[11px] text-faint w-20 text-right whitespace-nowrap">
            {current ? `${current.n} / 09` : 'edition 02'}
          </div>
          <button onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="h-7 px-2.5 rounded border hairline text-[12px] text-ink/80 hover:text-ink hover:border-ink/30 transition-colors flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full border border-current" style={{ background: theme === 'dark' ? 'transparent' : 'currentColor' }} />
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>
    </nav>
  )
}

function Chapter({ id, n, title, intro, children, light = false }: {
  id: string; n: string; title: string; intro?: ReactNode; children: ReactNode; light?: boolean
}) {
  return (
    <section id={id} className={`scroll-mt-14 border-t ${light ? 'bg-mist text-forest border-forest/10' : 'bg-surface text-ink hairline'}`}>
      <div className="mx-auto max-w-[1180px] px-5 md:px-10 py-20 md:py-28">
        <header className="grid md:grid-cols-12 gap-6 md:gap-10 mb-14 md:mb-20">
          <div className={`md:col-span-2 font-mono text-[12px] pt-2 ${light ? 'text-forest/50' : 'text-accent'}`}>{n}</div>
          <div className="md:col-span-10">
            <h2 className="text-[34px] md:text-[48px] font-semibold leading-[1.02] tracking-[-0.03em]">{title}</h2>
            {intro && <p className={`mt-6 max-w-[58ch] text-[16px] md:text-[17px] leading-[1.65] ${light ? 'text-forest/70' : 'text-muted'}`}>{intro}</p>}
          </div>
        </header>
        <div className="grid md:grid-cols-12 gap-6 md:gap-10">
          <div className="hidden md:block md:col-span-2" />
          <div className="md:col-span-10 min-w-0">{children}</div>
        </div>
      </div>
    </section>
  )
}

function Sub({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <h3 className={`text-[20px] md:text-[22px] font-medium tracking-[-0.02em] mb-5 ${light ? 'text-forest' : 'text-ink'}`}>{children}</h3>
}

function Note({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`text-[14.5px] leading-[1.65] max-w-[62ch] ${light ? 'text-forest/65' : 'text-muted'}`}>{children}</p>
}

function Rule({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <li className={`py-4 border-t text-[15px] leading-[1.6] ${light ? 'border-forest/10 text-forest/85' : 'hairline text-ink/85'}`}>{children}</li>
  )
}

// ─── Chapter 02 pieces ────────────────────────────────────────────────────────

function Construction() {
  return (
    <svg viewBox="0 0 320 320" className="w-full max-w-[360px] text-ink" role="img" aria-label="Mark construction: tracks radiating from one point">
      <g stroke="var(--accent-2)" strokeOpacity="0.45" strokeWidth="0.75" fill="none">
        <circle cx="160" cy="160" r="150" strokeDasharray="2 4" />
        <circle cx="160" cy="160" r="54" />
        <line x1="160" y1="0" x2="160" y2="320" />
        <line x1="0" y1="160" x2="320" y2="160" />
        {[15, 45, 75, 105, 135, 165].map(a => (
          <line key={a} x1="160" y1="160" x2={160 + 160 * Math.cos((a * Math.PI) / 180)} y2={160 + 160 * Math.sin((a * Math.PI) / 180)} strokeOpacity="0.18" />
        ))}
      </g>
      <g transform="translate(160 160) scale(1.32) translate(-121 -113)">
        <path d={MARK_PATH} fill={GREEN} />
      </g>
      <circle cx="160" cy="160" r="2.5" fill="currentColor" />
    </svg>
  )
}

function LogoTile({ bg, mark, text, label, aurora = false, border = false, forceNight = false }: {
  bg: string; mark: string; text: string; label: string; aurora?: boolean; border?: boolean; forceNight?: boolean
}) {
  return (
    <figure className="m-0">
      <div className={`relative h-44 rounded-md flex items-center justify-center overflow-hidden ${aurora ? 'aurora-band' : ''} ${border ? 'border hairline' : ''} ${forceNight ? 'force-night' : ''}`} style={{ background: aurora ? undefined : bg }}>
        {aurora && <div className="grain absolute inset-0" />}
        <BosonLogo markColor={mark} textColor={text} height={40} className="relative" />
      </div>
      <figcaption className="mt-3 text-[13px] text-muted">{label}</figcaption>
    </figure>
  )
}

function Misuse({ label, children, ok = false }: { label: string; children: ReactNode; ok?: boolean }) {
  return (
    <figure className="m-0">
      <div className={`relative h-36 rounded-md bg-mist flex items-center justify-center overflow-hidden border ${ok ? 'border-[#007A34]' : 'border-[#FF5C5C]/70'}`}>
        <span className={`absolute top-2.5 left-3 font-mono text-[11px] ${ok ? 'text-[#007A34]' : 'text-[#E04848]'}`}>{ok ? 'yes' : 'no'}</span>
        {children}
      </div>
      <figcaption className="mt-3 text-[13px] text-muted">{label}</figcaption>
    </figure>
  )
}

// ─── Chapter 03 pieces ────────────────────────────────────────────────────────

const PALETTE = [
  { name: 'Night', hex: NIGHT, share: 52, role: 'Every dark surface. Never pure black.', fg: MIST },
  { name: 'Forest', hex: FOREST, share: 18, role: 'Raised panels, text on light surfaces.', fg: MIST },
  { name: 'Boson green', hex: GREEN, share: 12, role: 'The mark and the one action on a screen.', fg: NIGHT },
  { name: 'Aurora teal', hex: TEAL, share: 8, role: 'Second light. Links, focus ring, chart line two.', fg: NIGHT },
  { name: 'Mist', hex: MIST, share: 6, role: 'Text on Night. The light surface when one is needed.', fg: FOREST },
  { name: 'Lime', hex: LIME, share: 2, role: 'Highlight in text and charts. Never a background.', fg: FOREST },
  { name: 'Aurora violet', hex: VIOLET, share: 2, role: 'Rare. A third chart series when two are not enough. Never in the sky, never text or button.', fg: NIGHT },
]

function Strip({ c }: { c: typeof PALETTE[number] }) {
  const [copied, copy] = useCopy()
  return (
    <button onClick={() => copy(c.hex)} className="copyable group text-left min-w-0" style={{ flex: `${c.share} 1 0` }} aria-label={`Copy ${c.name} ${c.hex}`}>
      <div className="h-56 md:h-72 relative overflow-hidden" style={{ background: c.hex }}>
        <span className="absolute left-3 bottom-3 font-mono text-[11px] transition-opacity opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" style={{ color: c.fg }}>
          {copied ? 'copied' : c.hex}
        </span>
      </div>
    </button>
  )
}

function InkSwatch({ name, hex, ratio }: { name: string; hex: string; ratio: string }) {
  const [copied, copy] = useCopy()
  return (
    <button onClick={() => copy(hex)} className="copyable text-left rounded-md overflow-hidden border border-forest/10 bg-mist" aria-label={`Copy ${name} ${hex}`}>
      <div className="p-5 text-[15px] font-medium" style={{ color: hex }}>{name}: the quick brown fox</div>
      <div className="px-5 pb-4 flex justify-between font-mono text-[11px]" style={{ color: hex }}>
        <span>{copied ? 'copied' : hex}</span><span>{ratio}</span>
      </div>
    </button>
  )
}

const CONTRAST = [
  ['Mist on Night', '17.4'], ['Teal on Night', '12.3'], ['Green on Night', '10.6'], ['Night on Green', '10.6'],
  ['Forest on Mist', '12.3'], ['Forest on Lime', '10.9'], ['Green on Forest', '7.5'], ['Violet on Night', '5.5'],
]

// ─── Chapter 04 pieces ────────────────────────────────────────────────────────

function FieldDemo() {
  const [layers, setLayers] = useState({ ribbons: true, lattice: true, grain: true })
  const toggle = (k: keyof typeof layers) => setLayers(l => ({ ...l, [k]: !l[k] }))
  const [copied, copy] = useCopy()
  return (
    <div>
      <div className="relative h-[380px] md:h-[460px] rounded-md overflow-hidden bg-surface border hairline">
        <Aurora ribbons={layers.ribbons} lattice={layers.lattice} grain={layers.grain} />
        <div className="absolute left-6 bottom-6 md:left-8 md:bottom-8">
          <BosonMark size={40} className="emit" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {(['ribbons', 'lattice', 'grain'] as const).map(k => (
          <button key={k} onClick={() => toggle(k)} aria-pressed={layers[k]}
            className={`px-3 py-1.5 rounded text-[13px] border transition-colors ${layers[k] ? 'border-accent/60 text-accent' : 'hairline text-faint hover:text-ink'}`}>
            {k}
          </button>
        ))}
        <button onClick={() => copy(ATMOSPHERE_CSS)} className="copyable ml-auto px-3 py-1.5 rounded text-[13px] border hairline text-ink/70 hover:text-ink">
          {copied ? 'copied' : 'copy static CSS'}
        </button>
      </div>
    </div>
  )
}

// ─── Chapter 06 pieces ────────────────────────────────────────────────────────

function RevealDemo() {
  const [key, setKey] = useState(0)
  return (
    <div className="rounded-md border hairline p-6 md:p-8 bg-surface-2">
      <div key={key} className="min-h-[92px]">
        <div className="reveal text-[22px] font-medium tracking-[-0.02em]" style={{ '--delay': '0ms' } as React.CSSProperties}>Deploy finished</div>
        <div className="reveal mt-2 text-[14.5px] text-muted" style={{ '--delay': '120ms' } as React.CSSProperties}>Build 4,182 is live in three regions.</div>
      </div>
      <button onClick={() => setKey(k => k + 1)} className="mt-4 text-[13px] text-accent-2 hover:text-ink transition-colors">Play again</button>
    </div>
  )
}

// ─── Chapter 07 mockups ───────────────────────────────────────────────────────

function Browser({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg overflow-hidden border hairline bg-surface-2 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
      <div className="h-8 flex items-center gap-1.5 px-3 border-b hairline">
        {[0, 1, 2].map(i => <span key={i} className="w-2.5 h-2.5 rounded-full bg-ink/15" />)}
        <span className="ml-3 h-4 flex-1 max-w-[220px] rounded bg-ink/8 font-mono text-[9px] text-faint px-2 flex items-center">bosonstudio.com</span>
      </div>
      {children}
    </div>
  )
}

function WebsiteMockup() {
  return (
    <Browser>
      <div className="relative h-[330px] overflow-hidden bg-surface">
        <Aurora />
        <div className="relative h-full flex flex-col p-6 md:p-8">
          <div className="flex items-center justify-between">
            <BosonLogo height={18} />
            <div className="hidden sm:flex gap-5 text-[10px] text-muted">
              <span>Work</span><span>Services</span><span>About</span><span className="text-accent">Start a project</span>
            </div>
          </div>
          <div className="mt-auto max-w-[360px]">
            <div className="text-[26px] md:text-[30px] font-semibold leading-[1.05] tracking-[-0.03em]">Software for systems that cannot stop.</div>
            <p className="mt-3 text-[12px] leading-[1.55] text-muted max-w-[300px]">We design, build and run the platforms behind logistics, finance and health companies.</p>
            <div className="mt-4 inline-flex items-center h-8 px-3.5 rounded bg-green text-night text-[11px] font-semibold emit">Start a project</div>
          </div>
        </div>
      </div>
    </Browser>
  )
}

function DashboardMockup() {
  const points = [30, 42, 38, 55, 52, 64, 60, 78, 74, 90]
  const line = (arr: number[]) => arr.map((v, i) => `${(i / (arr.length - 1)) * 300},${100 - v}`).join(' ')
  const second = points.map(v => v * 0.6 + 8)
  return (
    <Browser>
      <div className="flex h-[330px] bg-surface text-ink">
        <div className="w-11 md:w-36 border-r hairline p-3 flex flex-col gap-3">
          <BosonMark size={18} />
          {['Overview', 'Deploys', 'Incidents', 'Billing', 'Team'].map((s, i) => (
            <div key={s} className={`h-5 flex items-center gap-2 text-[10px] ${i === 0 ? 'text-ink' : 'text-faint'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-green' : 'bg-ink/20'}`} />
              <span className="hidden md:inline">{s}</span>
            </div>
          ))}
        </div>
        <div className="flex-1 p-4 md:p-5 min-w-0">
          <div className="flex items-baseline justify-between">
            <div className="text-[13px] font-medium">Overview</div>
            <div className="font-mono text-[9px] text-faint">last 30 days</div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[['Uptime', '99.99%', 'currentColor'], ['Deploys', '412', 'currentColor'], ['P95 latency', '84 ms', 'var(--accent-2)']].map(([k, v, c]) => (
              <div key={k} className="border hairline rounded p-2.5">
                <div className="text-[9px] text-faint">{k}</div>
                <div className="mt-1 font-mono text-[14px]" style={{ color: c }}>{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 border hairline rounded p-3">
            <div className="text-[9px] text-faint mb-2">Requests per second</div>
            <svg viewBox="0 0 300 100" className="w-full h-[110px]" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor={GREEN} stopOpacity="0.35" /><stop offset="1" stopColor={GREEN} stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points={`0,100 ${line(points)} 300,100`} fill="url(#g1)" />
              <polyline points={line(points)} fill="none" stroke="var(--accent)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              <polyline points={line(second)} fill="none" stroke="var(--accent-2)" strokeWidth="1.5" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
        </div>
      </div>
    </Browser>
  )
}

function OgCard() {
  return (
    <div className="force-night relative aspect-[1.91/1] rounded-lg overflow-hidden bg-night text-mist border hairline shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
      <Aurora />
      <div className="relative h-full flex flex-col justify-between p-6 md:p-8">
        <BosonLogo height={24} />
        <div className="text-[22px] md:text-[28px] font-semibold leading-[1.05] tracking-[-0.03em] max-w-[70%]">Software for systems that cannot stop.</div>
      </div>
    </div>
  )
}

function SlideMockup() {
  return (
    <div className="relative aspect-video rounded-lg overflow-hidden aurora-band border hairline shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
      <div className="lattice absolute inset-0" />
      <div className="grain absolute inset-0" />
      <div className="relative h-full flex flex-col justify-between p-6 md:p-8">
        <div className="flex justify-between items-start">
          <BosonMark size={26} />
          <span className="font-mono text-[10px] text-faint">Q4 platform review</span>
        </div>
        <div>
          <div className="text-[24px] md:text-[30px] font-semibold leading-[1.05] tracking-[-0.03em]">Nine weeks to a new billing core</div>
          <div className="mt-2 text-[12px] text-muted">Mika Chen, Head of Engineering</div>
        </div>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => {
      const current = [...CHAPTERS].reverse().find(c => {
        const el = document.getElementById(c.id)
        return el && el.getBoundingClientRect().top <= 80
      })
      setActive(current?.id ?? '')
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div id="top" className="bg-surface text-ink">
      <Nav active={active} />

      {/* ── Cover ── */}
      <header className="relative min-h-screen flex flex-col overflow-hidden bg-surface">
        <Aurora hero />
        <div className="relative mx-auto w-full max-w-[1180px] px-5 md:px-10 pt-28 md:pt-36 pb-12 flex-1 flex flex-col">
          <div className="reveal" style={{ '--delay': '100ms' } as React.CSSProperties}>
            <BosonLogo height={56} className="md:hidden" />
            <BosonLogo height={84} className="hidden md:block" />
          </div>
          <div className="mt-auto pt-24 md:pt-32 grid md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-7">
              <h1 className="reveal text-[44px] md:text-[76px] font-semibold leading-[0.98] tracking-[-0.04em]" style={{ '--delay': '400ms' } as React.CSSProperties}>
                Collision,<br />field, light.
              </h1>
              <p className="reveal mt-6 max-w-[46ch] text-[16px] md:text-[18px] leading-[1.6] text-muted" style={{ '--delay': '650ms' } as React.CSSProperties}>
                Brand guidelines for Boson Studio. Edition 02, September 2026. How the name, the mark and the light behind them fit together.
              </p>
            </div>
            <nav className="reveal md:col-span-5 grid grid-cols-2 gap-x-6 border-t hairline pt-5" aria-label="Contents" style={{ '--delay': '900ms' } as React.CSSProperties}>
              {CHAPTERS.map(c => (
                <a key={c.id} href={`#${c.id}`} className="flex items-baseline gap-3 py-2 text-[14px] text-ink/70 hover:text-accent transition-colors">
                  <span className="font-mono text-[11px] text-faint">{c.n}</span>{c.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* ── 01 Manifesto ── */}
      <Manifesto n="01" />

      {/* ── 02 Origin ── */}
      <Chapter id="origin" n="02" title="Where the name comes from"
        intro="Boson Studio is named after the Higgs boson, the particle whose field gives everything else its mass. It was predicted in 1964 and finally seen in 2012, after two beams of protons were made to collide at close to the speed of light. The mark is that moment: tracks leaving a single point.">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          <div>
            <p className="text-[16px] leading-[1.7] text-ink/80 max-w-[50ch]">
              We build software for companies whose systems cannot afford to stop. The physics turns out to be a useful way of thinking about that work, and it gives the brand its three parts. They happen in order.
            </p>
            <ol className="mt-10 list-none m-0 p-0">
              {[
                ['1', 'Collision', 'Two things meet: a hard problem and a team that has seen it before. This is the mark, and it is where every project starts.'],
                ['2', 'Field', 'The structure nobody sees but everything depends on. Infrastructure, data, the systems underneath. The lattice in our backgrounds stands for it.'],
                ['3', 'Light', 'When charged particles hit the atmosphere they release photons and the sky turns green. Photons are bosons. The aurora is the visible result of invisible work, which is also what a finished product is.'],
              ].map(([n, t, b]) => (
                <li key={n} className="grid grid-cols-[2rem_1fr] gap-4 py-6 border-t hairline">
                  <span className="font-mono text-[12px] text-accent pt-1">{n}</span>
                  <div>
                    <div className="text-[18px] font-medium tracking-[-0.01em]">{t}</div>
                    <p className="mt-2 text-[14.5px] leading-[1.65] text-muted max-w-[48ch]">{b}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="relative rounded-md overflow-hidden border hairline min-h-[420px] aurora-band">
            <div className="lattice absolute inset-0" />
            <div className="grain absolute inset-0" />
            <div className="absolute inset-0 flex items-center justify-center">
              <BosonMark size={180} className="emit" />
            </div>
            <div className="absolute left-5 bottom-5 font-mono text-[11px] text-faint">557.7 nm, the green line of oxygen</div>
          </div>
        </div>
      </Chapter>

      {/* ── 03 Mark ── */}
      <Chapter id="mark" n="03" title="The mark and the wordmark"
        intro="The mark is a collision seen head on. Its tracks are uneven on purpose, the way real debris is. The wordmark is lowercase and ends with a full stop, because the name is a statement, not a shout.">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
          <Construction />
          <div>
            <Sub>Construction</Sub>
            <Note>Every track leaves the same origin. The inner circle marks the smallest gap between tracks and is the unit for clear space. Do not regularise the tracks, add tracks, or close the shape into a star.</Note>
            <ul className="mt-8 list-none m-0 p-0">
              <Rule>Clear space around the lockup equals the height of the lowercase b in the wordmark.</Rule>
              <Rule>Minimum sizes: full lockup 140 px or 36 mm, mark alone 24 px or 6 mm, favicon 16 px.</Rule>
              <Rule>The mark sits left of the wordmark, never above it. There is no stacked version.</Rule>
              <Rule>The mark may glow on Night only. Green at 75 percent, then teal at 35 percent, blur no wider than 40 px. On light surfaces it never glows.</Rule>
            </ul>
          </div>
        </div>

        <div className="mt-20">
          <Sub>Versions</Sub>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <LogoTile bg={NIGHT} mark={GREEN} text={MIST} label="On Night. The default." border forceNight />
            <LogoTile bg="" mark={GREEN} text={MIST} label="On an atmosphere. Grain keeps it legible." aurora />
            <LogoTile bg={MIST} mark={GREEN} text={FOREST} label="On Mist, for documents and print." />
            <LogoTile bg={FOREST} mark={MIST} text={MIST} label="Single color, when green is unavailable." />
          </div>
        </div>

        <div className="mt-20">
          <Sub>App icon</Sub>
          <div className="flex items-end gap-5 flex-wrap">
            {[[96, 44], [64, 30], [32, 15], [16, 8]].map(([box, m]) => (
              <div key={box} className="flex flex-col items-center gap-2">
                <div className="force-night flex items-center justify-center rounded-[22%] bg-night border hairline" style={{ width: box, height: box }}>
                  <BosonMark size={m} />
                </div>
                <span className="font-mono text-[11px] text-faint">{box}</span>
              </div>
            ))}
            <Note>The icon is the mark on Night at 46 percent of the tile. No gradient, no glow, no border.</Note>
          </div>
        </div>

        <div className="mt-20">
          <Sub>Protecting the mark</Sub>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
            <Misuse ok label="Green mark, Forest wordmark, plain background.">
              <BosonLogo markColor={GREEN} textColor={FOREST} height={30} />
            </Misuse>
            <Misuse label="Do not stretch or condense.">
              <div style={{ transform: 'scaleX(1.45)' }}><BosonLogo markColor={GREEN} textColor={FOREST} height={26} /></div>
            </Misuse>
            <Misuse label="Do not rotate. The tracks have an orientation.">
              <div style={{ transform: 'rotate(28deg)' }}><BosonMark size={40} /></div>
            </Misuse>
            <Misuse label="Do not recolor outside the palette.">
              <BosonLogo markColor="#E040FB" textColor="#FF5722" height={26} />
            </Misuse>
            <Misuse label="Do not glow on a light surface.">
              <div style={{ filter: 'drop-shadow(0 0 10px rgba(0,220,95,0.9))' }}><BosonLogo markColor={GREEN} textColor={FOREST} height={26} /></div>
            </Misuse>
            <Misuse label="Do not stack the mark above the wordmark.">
              <div className="flex flex-col items-center gap-1.5">
                <BosonMark size={26} />
                <span className="text-[12px] font-semibold" style={{ color: FOREST }}>boson studio.</span>
              </div>
            </Misuse>
          </div>
        </div>
      </Chapter>

      {/* ── 04 Color ── */}
      <Chapter id="color" n="04" title="Color"
        intro="Seven colors. The width of each strip is roughly how much of any screen it should take up. Night does most of the work, green does one job per screen, and the sky is green only. Click a strip to copy its value.">
        <div className="flex gap-px rounded-md overflow-hidden border hairline">
          {PALETTE.map(c => <Strip key={c.name} c={c} />)}
        </div>
        <ul className="mt-8 list-none m-0 p-0 grid md:grid-cols-2 gap-x-10">
          {PALETTE.map(c => (
            <li key={c.name} className="flex gap-4 py-4 border-t hairline">
              <span className="w-4 h-4 mt-0.5 rounded-sm shrink-0 border border-ink/10" style={{ background: c.hex }} />
              <div className="min-w-0">
                <div className="flex items-baseline gap-3">
                  <span className="text-[15px] font-medium">{c.name}</span>
                  <span className="font-mono text-[11.5px] text-faint">{c.hex}</span>
                  <span className="font-mono text-[11.5px] text-faint ml-auto">{c.share}%</span>
                </div>
                <div className="text-[13.5px] text-muted mt-1">{c.role}</div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-20">
          <Sub>On light surfaces</Sub>
          <Note>Boson green and aurora teal are lights. As text on Mist they fall below 2:1, so light mode swaps in ink versions for text, links, focus rings and chart lines. The mark and green buttons keep the true green.</Note>
          <div className="mt-6 grid sm:grid-cols-3 gap-5">
            {[
              ['Green ink', '#007A34', '4.9:1 on Mist'],
              ['Teal ink', '#0A7568', '5.0:1 on Mist'],
              ['Violet ink', '#5B3FC4', '6.3:1 on Mist'],
            ].map(([name, hex, ratio]) => (
              <InkSwatch key={name} name={name} hex={hex} ratio={ratio} />
            ))}
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-2 gap-10 md:gap-16">
          <div>
            <Sub>Contrast</Sub>
            <Note>Every pair below passes 4.5:1 for body text. Violet is the only one that does not clear 7:1, which is one more reason it never carries text.</Note>
            <ul className="mt-6 list-none m-0 p-0">
              {CONTRAST.map(([pair, ratio]) => (
                <li key={pair} className="flex justify-between py-2.5 border-t hairline text-[14px]">
                  <span className="text-ink/80">{pair}</span>
                  <span className="font-mono text-[12px] text-accent-2">{ratio}:1</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Sub>Rules</Sub>
            <ul className="list-none m-0 p-0">
              <Rule>Dark first. The website and the product open on Night. Light mode exists for documents, print and people who ask for it, and it follows the same rules with the ink accents below.</Rule>
              <Rule>Green is the action. One green element per view: the primary button, or the mark, not both at full strength.</Rule>
              <Rule>Teal is the second light in the interface only: links, focus rings, secondary data. It stays out of the sky.</Rule>
              <Rule>Lime is not a background. On the old guide it read as an organic brand. It stays as a highlight in charts and inline text.</Rule>
              <Rule>No flat two-stop gradients. Color moves through the atmospheres in the next chapter, or not at all.</Rule>
            </ul>
          </div>
        </div>
      </Chapter>

      {/* ── 05 Field and light ── */}
      <Chapter id="field" n="05" title="Field and light"
        intro="The one place the brand is allowed to be loud. Three layers make an atmosphere: ribbons of light, the lattice of the field behind them, and grain to keep it from looking like a vector gradient. Toggle each layer to see what it does.">
        <FieldDemo />
        <div className="mt-14 grid md:grid-cols-3 gap-8">
          {[
            ['Ribbons', 'Tall gradients, skewed 10 to 28 degrees and blurred 54 px, screened on Night and multiplied on Mist. Green carries all of the light; a paler lime-green ribbon gives the edge its glow. No teal or violet in the sky: blurred, they read as blue.'],
            ['Lattice', 'A 28 px grid of dots at 16 percent white, masked so it fades before the edges. It is the field: present everywhere, visible only where the light is.'],
            ['Grain', 'Fractal noise at 11 percent with overlay blending. Without it the blur reads as a mesh gradient from a template. With it, it reads as sky.'],
          ].map(([t, b]) => (
            <div key={t} className="border-t hairline pt-5">
              <div className="text-[16px] font-medium">{t}</div>
              <p className="mt-2 text-[14px] leading-[1.65] text-muted">{b}</p>
            </div>
          ))}
        </div>
        <div className="mt-14">
          <Sub>Where it goes</Sub>
          <ul className="list-none m-0 p-0 max-w-[70ch]">
            <Rule>Page openers, section openers, social cards, slide titles. One atmosphere per page. The field rain, hex digits falling through the lattice, belongs to the manifesto alone: always Night, never behind an interface.</Rule>
            <Rule>Never behind more than two lines of text. Body copy sits on plain Night.</Rule>
            <Rule>On Mist the atmosphere is a dawn: the same ribbons multiplied at full strength, the lattice in Forest. Switch this guide to light to see it.</Rule>
            <Rule>Ribbons move only in a hero, and slowly: they sway sideways and breathe in brightness over 13 to 21 seconds per cycle, in both themes. It should feel like light, not look like a photograph of one. Everywhere else the atmosphere is still.</Rule>
          </ul>
        </div>
      </Chapter>

      {/* ── 06 Type ── */}
      <Chapter id="type" n="06" title="Type"
        intro="Sora for everything people read. JetBrains Mono for values people copy: hex codes, sizes, timings, version numbers. Sentence case throughout, including headlines.">
        <div className="border-t hairline pt-8">
          <div className="text-[44px] md:text-[80px] font-semibold leading-[0.98] tracking-[-0.04em] max-w-[16ch]">Systems that hold under load.</div>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-[18px]">
            {[[300, 'Light'], [400, 'Regular'], [500, 'Medium'], [600, 'Semibold'], [700, 'Bold']].map(([w, n]) => (
              <span key={w} style={{ fontWeight: w as number }} className="text-ink/85">{n} <span className="font-mono text-[11px] text-faint ml-1">{w}</span></span>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <Sub>Scale</Sub>
          <ul className="list-none m-0 p-0">
            {[
              ['Display', '76 / 0.98 / -0.04em', 600, 'Collision.', 'text-[40px] md:text-[64px] tracking-[-0.04em]'],
              ['Heading 1', '48 / 1.02 / -0.03em', 600, 'Protecting the mark', 'text-[32px] md:text-[44px] tracking-[-0.03em]'],
              ['Heading 2', '22 / 1.2 / -0.02em', 500, 'Where it goes', 'text-[22px] tracking-[-0.02em]'],
              ['Body', '17 / 1.65 / 0', 400, 'Software for systems that cannot stop.', 'text-[17px]'],
              ['Small', '14.5 / 1.65 / 0', 400, 'Every pair passes 4.5:1 for body text.', 'text-[14.5px] text-ink/70'],
              ['Data', '12 / 1.5 / 0', 400, '#00DC5F  557.7 nm  build 4182', 'font-mono text-[12px] text-accent-2'],
            ].map(([name, spec, w, sample, cls]) => (
              <li key={name as string} className="grid md:grid-cols-12 gap-3 md:gap-6 py-5 border-t hairline items-baseline">
                <div className="md:col-span-2 text-[13px] text-muted">{name}</div>
                <div className="md:col-span-3 font-mono text-[11px] text-faint">{spec}</div>
                <div className={`md:col-span-7 leading-[1.1] ${cls}`} style={{ fontWeight: w as number }}>{sample}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-14">
          <Sub>Rules</Sub>
          <ul className="list-none m-0 p-0 max-w-[70ch]">
            <Rule>Lines under 70 characters. Wide screens get margins, not longer lines.</Rule>
            <Rule>No all caps. Mono data is the only small text, and it stays in the case it was written.</Rule>
            <Rule>One weight step between a heading and its body. Semibold headings, regular text.</Rule>
            <Rule>Do not color a single word in a headline. If a line matters, give it its own line.</Rule>
          </ul>
        </div>
      </Chapter>

      {/* ── 07 Motion ── */}
      <Chapter id="motion" n="07" title="Motion"
        intro="The atmosphere is slow and the interface is fast. Light drifts over tens of seconds. Anything a person touches answers in under a quarter of one.">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          <div>
            <Sub>Timings</Sub>
            <ul className="list-none m-0 p-0">
              {[
                ['Atmosphere', '13 to 21 s', 'ease-in-out, alternate', 'Ribbons sway and breathe in a hero. Never faster.'],
                ['Reveal', '900 ms', 'cubic-bezier(.2, .8, .2, 1)', 'Once per page load, staggered 120 ms. Not on scroll.'],
                ['Response', '160 to 220 ms', 'ease-out', 'Hover, focus, press, toggle. The emission glow on the mark.'],
                ['Layout', '300 ms', 'cubic-bezier(.2, .8, .2, 1)', 'Panels opening, rows expanding. Show what moved.'],
              ].map(([n, d, e, u]) => (
                <li key={n} className="py-4 border-t hairline">
                  <div className="flex items-baseline gap-4">
                    <span className="text-[15px] font-medium w-28 shrink-0">{n}</span>
                    <span className="font-mono text-[12px] text-accent-2">{d}</span>
                    <span className="font-mono text-[11px] text-faint hidden sm:inline">{e}</span>
                  </div>
                  <p className="mt-1.5 text-[13.5px] text-muted leading-[1.6]">{u}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-6">
            <RevealDemo />
            <div className="rounded-md border hairline p-6 md:p-8 bg-surface-2 flex items-center justify-between gap-6">
              <div>
                <div className="text-[15px] font-medium">Emission</div>
                <p className="mt-1 text-[13.5px] text-muted leading-[1.6]">Hover the mark or the button. On Night the glow is the only effect that touches the logo. On light surfaces nothing glows; the mark only lifts.</p>
              </div>
              <div className="flex items-center gap-5 shrink-0">
                <BosonMark size={40} className="emit" />
                <button className="emit h-9 px-4 rounded bg-green text-night text-[13px] font-semibold">Start a project</button>
              </div>
            </div>
          </div>
        </div>
        <ul className="mt-14 list-none m-0 p-0 max-w-[70ch]">
          <Rule>Nothing fades in as it scrolls into view. The page is already there. The one exception is the manifesto, where the screen holds still and one statement at a time comes into focus as you scroll.</Rule>
          <Rule>No parallax, no bounce, no spring on text.</Rule>
          <Rule>When a visitor asks for reduced motion the ribbons stand still and reveals are instant. Nothing is removed.</Rule>
        </ul>
      </Chapter>

      {/* ── 08 In use ── */}
      <Chapter id="in-use" n="08" title="In use"
        intro="The places the brand actually shows up for a software company: the website, the product, a link preview, and a slide. Switch the theme in the top bar to see the website and product in light mode. The link preview is always Night.">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-10">
          <figure className="m-0">
            <WebsiteMockup />
            <figcaption className="mt-3 text-[13px] text-muted">Website opener. One atmosphere, one green action.</figcaption>
          </figure>
          <figure className="m-0">
            <DashboardMockup />
            <figcaption className="mt-3 text-[13px] text-muted">Product interface. Plain Night, hairlines, teal for the second series.</figcaption>
          </figure>
          <figure className="m-0">
            <OgCard />
            <figcaption className="mt-3 text-[13px] text-muted">Link preview, 1200 by 630.</figcaption>
          </figure>
          <figure className="m-0">
            <SlideMockup />
            <figcaption className="mt-3 text-[13px] text-muted">Slide title. Still atmosphere, lattice showing.</figcaption>
          </figure>
        </div>
      </Chapter>

      {/* ── 09 Voice ── */}
      <Chapter id="voice" n="09" title="How we write"
        intro="We write the way the physics is written: plain, specific and checkable. A reader should be able to tell what we did, how long it took and what happened.">
        <div className="grid sm:grid-cols-2 gap-x-10">
          {[
            ['Precise, not vague', 'Numbers over adjectives. Nine weeks, not fast. Three regions, not global.'],
            ['Plain, not casual', 'Short words, full sentences, no jokes in the way of the point.'],
            ['Confident, not loud', 'We state what we did and let it stand. No exclamation marks, no superlatives.'],
            ['Curious, not clever', 'We ask the question the brief skipped. We do not perform the asking.'],
          ].map(([t, b]) => (
            <div key={t} className="py-5 border-t hairline">
              <div className="text-[17px] font-medium tracking-[-0.01em]">{t}</div>
              <p className="mt-2 text-[14.5px] leading-[1.65] text-muted max-w-[44ch]">{b}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 grid md:grid-cols-2 gap-8 md:gap-12">
          <div className="border-l-2 border-accent pl-6">
            <div className="font-mono text-[11px] text-accent mb-3">reads as Boson</div>
            <p className="text-[19px] md:text-[21px] leading-[1.5] tracking-[-0.01em]">We replaced a fourteen-year-old billing system in nine weeks. Nothing went down.</p>
          </div>
          <div className="border-l-2 border-ink/15 pl-6">
            <div className="font-mono text-[11px] text-faint mb-3">does not</div>
            <p className="text-[19px] md:text-[21px] leading-[1.5] tracking-[-0.01em] text-faint">Leveraging world-class, synergistic expertise to deliver holistic, end-to-end digital transformation for tomorrow's industry leaders.</p>
          </div>
        </div>
      </Chapter>

      <footer className="border-t hairline">
        <div className="mx-auto max-w-[1180px] px-5 md:px-10 py-12 flex flex-wrap items-end justify-between gap-6">
          <BosonLogo height={26} />
          <div className="text-[13px] text-faint leading-[1.8] text-right">
            <div>Brand guidelines, edition 02</div>
            <div>hello@bosonstudio.com</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
