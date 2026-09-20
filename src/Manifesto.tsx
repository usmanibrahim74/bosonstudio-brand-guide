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

function FieldRain({ intensity }: { intensity: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const level = useRef(intensity)
  level.current = intensity

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

    let narrow = false
    const resize = () => {
      narrow = canvas.clientWidth < 700
      dpr = Math.min(window.devicePixelRatio || 1, narrow ? 1.25 : 2)
      const w = canvas.clientWidth, h = canvas.clientHeight
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr)
      cols = Math.ceil(w / CELL); rows = Math.ceil(h / CELL)
      firstCol = Math.floor(cols * (narrow ? 0.55 : 0.46))   // keep the reading side mostly clear
      const count = narrow ? 4 : Math.max(5, Math.floor((cols - firstCol) / 3))
      drops = Array.from({ length: count }, () => spawn(true))
    }

    const paint = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
      ctx.font = FONT
      ctx.textBaseline = 'top'
      const lv = level.current
      const gain = (0.55 + 0.75 * lv) * (narrow ? 0.7 : 1) // trail brightness grows with the sequence; dimmer on phones
      // Later drops only join as the field brightens.
      const active = Math.max(3, Math.round(drops.length * (0.6 + 0.4 * lv)))
      for (let i = 0; i < active; i++) {
        const d = drops[i]
        const head = Math.floor(d.y)
        for (let k = 0; k < d.len; k++) {
          const r = head - k
          if (r < 0 || r >= rows) continue
          const fade = 1 - k / d.len
          // Glyphs are stable per cell; only the head flickers.
          const g = k === 0 ? glyph(now * 0.01 + d.seed) : glyph(r * 7.13 + d.col * 3.7 + d.seed)
          ctx.fillStyle = k === 0 ? `rgba(216, 237, 160, ${(0.6 + 0.35 * lv).toFixed(2)})` : `rgba(0, 220, 95, ${(0.5 * gain * fade * fade).toFixed(3)})`
          ctx.fillText(g, d.col * CELL + 5, r * CELL + 4)
        }
      }
    }

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (!visible) return
      if (now - last < 1000 / (narrow ? 15 : 20)) return
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      const rate = 0.8 + 0.6 * level.current              // the field moves a little faster as it brightens
      for (let i = 0; i < drops.length; i++) {
        drops[i].y += drops[i].speed * rate * dt
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

// ─── Scroll progress, continuous ──────────────────────────────────────────────
// p runs from 0 (first statement in focus) to STEPS - 1 (final line in focus)
// and follows the scrollbar directly, so every pixel of scroll moves the words.

function useProgress(sectionRef: React.RefObject<HTMLElement | null>) {
  const [p, setP] = useState(0)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const travel = el.offsetHeight - window.innerHeight
      const t = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0
      // The last line holds for the final stretch instead of sliding away.
      setP(Math.min(STEPS - 1, t * (STEPS - 1 + 0.45)))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf) }
  }, [sectionRef])
  return p
}

const smooth = (x: number) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t) }

/**
 * One statement, positioned by how far it is from the focal plane (d = p - index).
 * Each word has its own small offset, so a line comes into focus word by word
 * from the start and leaves the same way, while the whole line drifts upward.
 */
function Line({ d, children, reduced }: { d: number; children: ReactNode; reduced: boolean }) {
  const near = Math.abs(d) < 1
  if (!near) return null
  if (reduced) {
    return Math.abs(d) < 0.5 ? <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">{children}</div> : null
  }
  return (
    <div
      className="absolute inset-x-0 top-1/2 will-change-transform"
      style={{ transform: `translateY(calc(-50% + ${(-d * 72).toFixed(1)}px))`, pointerEvents: Math.abs(d) < 0.5 ? 'auto' : 'none' }}
      aria-hidden={Math.abs(d) >= 0.5}
    >
      {children}
    </div>
  )
}

function Words({ text, d, className, rich }: { text: string; d: number; className: string; rich: boolean }) {
  const words = text.split(' ')
  const n = words.length
  return (
    <p className={`m-0 ${className}`}>
      {words.map((w, k) => {
        // Words are staggered across a third of a step; later words trail the first.
        const offset = (k / Math.max(1, n - 1)) * 0.34 - 0.17
        const dist = Math.abs(d - offset)                 // distance from this word's focal point
        const v = smooth((0.62 - dist) / 0.42)            // crisp within 0.2 of focus, gone at 0.62
        return (
          <span key={k} className="inline-block whitespace-pre"
            style={{
              opacity: v,
              // Blur is the expensive part; phones get opacity and movement only.
              filter: rich && v < 0.98 ? `blur(${((1 - v) * 9).toFixed(2)}px)` : undefined,
              transform: `translateY(${((d - offset) * -22).toFixed(1)}px)`,
            }}>
            {w}{k < n - 1 ? ' ' : ''}
          </span>
        )
      })}
    </p>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function Manifesto({ n }: { n: string }) {
  const ref = useRef<HTMLElement>(null)
  const p = useProgress(ref)
  const step = Math.round(p)
  const t = p / (STEPS - 1)                                      // 0 at the first line, 1 at the last
  const finale = smooth((0.8 - Math.abs(p - (STEPS - 1))) / 0.6) // 1 while the last line is in focus
  const [reduced, setReduced] = useState(false)
  const [rich, setRich] = useState(true)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fine = window.matchMedia('(min-width: 768px) and (hover: hover)')
    const sync = () => { setReduced(mq.matches); setRich(fine.matches) }
    sync(); mq.addEventListener('change', sync); fine.addEventListener('change', sync)
    return () => { mq.removeEventListener('change', sync); fine.removeEventListener('change', sync) }
  }, [])

  return (
    <section
      id="manifesto"
      ref={ref}
      className="force-night relative scroll-mt-14 border-t hairline bg-surface text-ink"
      style={{ height: `${STEPS * VH_PER_STEP + 38}svh` }}
    >
      {/* Everything, once, for screen readers and for search. */}
      <div className="sr-only">
        {STATEMENTS.map(s => <p key={s.text}>{s.text}</p>)}
        <h2>{FINAL}</h2>
      </div>

      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Field glow: grows with the sequence, blooms behind the final line */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{
          opacity: 0.35 + 0.65 * t,
          background: 'radial-gradient(55% 75% at 80% 45%, rgba(0,220,95,0.26), transparent 65%), radial-gradient(35% 50% at 60% 20%, rgba(150,236,130,0.13), transparent 70%), radial-gradient(40% 45% at 8% 78%, rgba(0,220,95,0.11), transparent 70%)',
        }} />
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{
          opacity: finale,
          background: 'radial-gradient(45% 55% at 42% 52%, rgba(0,220,95,0.2), transparent 70%)',
        }} />
        <FieldRain intensity={t} />
        <div className="lattice absolute inset-0" style={{ '--lattice-dot': `rgba(0, 220, 95, ${(0.12 + 0.16 * t).toFixed(3)})` } as React.CSSProperties} />
        {/* Quiet the rain side a touch behind the text; the lattice stays visible everywhere */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,14,18,0.35)_0%,rgba(5,14,18,0.25)_40%,transparent_64%)]" />
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
                <Line key={s.text} d={p - i} reduced={reduced}>
                  <Words text={s.text} d={p - i} rich={rich}
                    className={`max-w-[20ch] text-[32px] md:text-[56px] font-medium leading-[1.06] tracking-[-0.03em] ${s.quiet ? 'text-ink/70' : 'text-ink'}`} />
                </Line>
              ))}
              <Line d={p - (STEPS - 1)} reduced={reduced}>
                {(() => {
                  const d = p - (STEPS - 1)
                  const v = reduced ? 1 : smooth((0.7 - Math.abs(d)) / 0.5)
                  return (
                    <>
                      <div className="flex items-center gap-5 md:gap-8">
                        <svg viewBox="13 5 216 217" fill="none" className="emit shrink-0 w-12 h-12 md:w-20 md:h-20" aria-hidden="true"
                          style={{ opacity: v, transform: `scale(${(0.7 + 0.3 * v).toFixed(3)}) rotate(${((1 - v) * -40).toFixed(1)}deg)` }}>
                          <path d={MARK_PATH} fill="#00DC5F" />
                        </svg>
                        <h2 className="m-0">
                          <Words text={FINAL} d={d} rich={rich} className="text-[40px] md:text-[84px] font-semibold leading-[0.96] tracking-[-0.04em]" />
                        </h2>
                      </div>
                      <div className="mt-8 md:mt-10 font-mono text-[11.5px] text-faint" style={{ opacity: smooth(v * 1.6 - 0.6) }}>125.1 GeV. 557.7 nm. 2012.</div>
                    </>
                  )
                })()}
              </Line>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
