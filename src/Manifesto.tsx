import { useEffect, useRef, useState, type ReactNode } from 'react'
import { MARK_PATH } from './logo'

/**
 * The manifesto: seeing the field. Always Night. The section is tall; a
 * full-screen stage stays pinned while you scroll, and one statement at a
 * time comes into focus. Behind it, a calm rain of hex digits falls through
 * the lattice on the side where nothing has to be read.
 */

const GLYPHS = '0123456789ABCDEF'
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const STATEMENTS: { text: string; quiet?: boolean }[] = [
  { text: 'Everything you rely on runs on something you never see.', quiet: true },
  { text: 'Payments clear. Trucks move. Records stay right.', quiet: true },
  { text: 'Under all of it, a field holds the world in place.' },
  { text: 'Most people never look down there. We work there.' },
  { text: 'When we do it well, nothing happens. Nothing goes down. Nothing waits. Nothing is lost.', quiet: true },
  { text: 'That is the point.' },
]
const FINAL = 'We build the field.'
const STEPS = STATEMENTS.length + 1
const VH_PER_STEP = 62

// ─── Field rain: few drops, slow, right side only ─────────────────────────────

function FieldRain() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const CELL = 22
    const FONT = "12px 'JetBrains Mono', ui-monospace, monospace"
    type Drop = { col: number; y: number; speed: number; len: number; seed: number }
    let cols = 0, rows = 0, dpr = 1, firstCol = 0
    let drops: Drop[] = []
    let visible = true
    let raf = 0
    let last = 0

    const glyph = (seed: number) => GLYPHS[Math.floor(Math.abs(Math.sin(seed)) * GLYPHS.length) % GLYPHS.length]

    const spawn = (anywhere = false): Drop => ({
      col: firstCol + Math.floor(Math.random() * (cols - firstCol)),
      y: anywhere ? Math.random() * rows : -Math.random() * rows * 0.6,
      speed: 1.2 + Math.random() * 1.8,        // rows per second: slow
      len: 10 + Math.floor(Math.random() * 12),
      seed: Math.random() * 1000,
    })

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.clientWidth, h = canvas.clientHeight
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr)
      cols = Math.ceil(w / CELL); rows = Math.ceil(h / CELL)
      const narrow = w < 700
      firstCol = Math.floor(cols * (narrow ? 0.74 : 0.46))   // keep the reading side clear
      const count = narrow ? 2 : Math.max(3, Math.floor((cols - firstCol) / 6))
      drops = Array.from({ length: count }, () => spawn(true))
    }

    const paint = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
      ctx.font = FONT
      ctx.textBaseline = 'top'
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i]
        const head = Math.floor(d.y)
        for (let k = 0; k < d.len; k++) {
          const r = head - k
          if (r < 0 || r >= rows) continue
          const fade = 1 - k / d.len
          // Glyphs are stable per cell; only the head flickers.
          const g = k === 0 ? glyph(now * 0.01 + d.seed) : glyph(r * 7.13 + d.col * 3.7 + d.seed)
          ctx.fillStyle = k === 0 ? 'rgba(216, 237, 160, 0.8)' : `rgba(0, 220, 95, ${(0.42 * fade * fade).toFixed(3)})`
          ctx.fillText(g, d.col * CELL + 5, r * CELL + 4)
        }
      }
    }

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (!visible) return
      if (now - last < 1000 / 20) return
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      for (let i = 0; i < drops.length; i++) {
        drops[i].y += drops[i].speed * dt
        if (Math.floor(drops[i].y) - drops[i].len > rows) drops[i] = spawn()
      }
      paint(now)
    }

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0 })
    io.observe(canvas)
    const ro = new ResizeObserver(() => { resize(); paint(performance.now()) })
    ro.observe(canvas)

    resize()
    paint(performance.now())
    if (!reducedMotion()) raf = requestAnimationFrame(frame)

    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect() }
  }, [])

  return <canvas ref={ref} className="absolute inset-0 w-full h-full" aria-hidden="true" />
}

// ─── Scroll progress → active step ────────────────────────────────────────────

function useStep(sectionRef: React.RefObject<HTMLElement | null>) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const travel = el.offsetHeight - window.innerHeight
      const p = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0
      setStep(Math.min(STEPS - 1, Math.floor(p * STEPS)))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf) }
  }, [sectionRef])
  return step
}

function Focus({ active, before, children }: { active: boolean; before: boolean; children: ReactNode }) {
  return (
    <div
      className="absolute inset-x-0 top-1/2 -translate-y-1/2 transition-[opacity,filter,transform] duration-700 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none"
      style={{
        opacity: active ? 1 : 0,
        filter: active ? 'blur(0px)' : 'blur(10px)',
        transform: `translateY(calc(-50% + ${active ? 0 : before ? -16 : 16}px))`,
        pointerEvents: active ? 'auto' : 'none',
      }}
      aria-hidden={!active}
    >
      {children}
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function Manifesto({ n }: { n: string }) {
  const ref = useRef<HTMLElement>(null)
  const step = useStep(ref)

  return (
    <section
      id="manifesto"
      ref={ref}
      className="force-night relative scroll-mt-14 border-t hairline bg-surface text-ink"
      style={{ height: `${STEPS * VH_PER_STEP + 38}vh` }}
    >
      {/* Everything, once, for screen readers and for search. */}
      <div className="sr-only">
        {STATEMENTS.map(s => <p key={s.text}>{s.text}</p>)}
        <h2>{FINAL}</h2>
      </div>

      <div className="sticky top-0 h-screen overflow-hidden">
        <FieldRain />
        <div className="lattice absolute inset-0" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--surface)_0%,var(--surface)_30%,transparent_62%)] opacity-90" />
        <div className="grain absolute inset-0" />

        <div className="relative mx-auto h-full max-w-[1180px] px-5 md:px-10 pt-14">
          <div className="grid grid-cols-1 md:grid-cols-12 grid-rows-1 gap-x-6 md:gap-x-10 h-full">
            {/* Chapter number and progress */}
            <div className="col-start-1 row-start-1 md:col-span-2 self-start pt-12 md:pt-28 flex md:flex-col items-center md:items-start gap-4 md:gap-6">
              <div className="font-mono text-[12px] text-accent">{n}</div>
              <ol className="flex md:flex-col gap-2.5 m-0 p-0 list-none" aria-label="Progress">
                {Array.from({ length: STEPS }, (_, i) => (
                  <li key={i} className="h-px md:h-[3px] w-4 md:w-3 rounded-full transition-[background-color,width] duration-500"
                    style={{ background: i === step ? '#00DC5F' : 'rgba(238,243,241,0.18)', width: i === step ? 22 : undefined }} />
                ))}
              </ol>
              <div className="font-mono text-[11px] text-faint tabular-nums">{step + 1} / {STEPS}</div>
            </div>

            {/* Stage: one statement at a time */}
            <div className="col-start-1 row-start-1 md:col-start-3 md:col-span-10 relative h-full">
              {STATEMENTS.map((s, i) => (
                <Focus key={s.text} active={step === i} before={i < step}>
                  <p className={`m-0 max-w-[20ch] text-[32px] md:text-[56px] font-medium leading-[1.06] tracking-[-0.03em] ${s.quiet ? 'text-ink/70' : 'text-ink'}`}>
                    {s.text}
                  </p>
                </Focus>
              ))}
              <Focus active={step === STEPS - 1} before={false}>
                <div className="flex items-center gap-5 md:gap-8">
                  <svg viewBox="13 5 216 217" fill="none" className="emit shrink-0 w-12 h-12 md:w-20 md:h-20" aria-hidden="true">
                    <path d={MARK_PATH} fill="#00DC5F" />
                  </svg>
                  <h2 className="m-0 text-[40px] md:text-[84px] font-semibold leading-[0.96] tracking-[-0.04em]">{FINAL}</h2>
                </div>
                <div className="mt-8 md:mt-10 font-mono text-[11.5px] text-faint">125.1 GeV. 557.7 nm. 2012.</div>
              </Focus>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
