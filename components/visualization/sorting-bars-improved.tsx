"use client"
import { useEffect, useMemo, useRef } from "react"
import { gsap } from "gsap"

type Props = {
  values: number[]
  highlight?: number[]
  height?: number
  gap?: number
}

const ACCENTS = ["#22d3ee", "#34d399", "#fbbf24", "#f43f5e", "#60a5fa"] // cyan, emerald, amber, rose, sky

export function SortingBarsImproved({ values, highlight = [], height = 240, gap = 6 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const max = useMemo(() => Math.max(1, ...values), [values])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const bars = gsap.utils.toArray<HTMLElement>("[data-bar]")
      bars.forEach((bar) => {
        const idx = Number(bar.dataset.idx)
        const val = Number(bar.dataset.val)
        const baseColor = ACCENTS[idx % ACCENTS.length]
        const isHi = highlight.includes(idx)
        gsap.to(bar, {
          height: Math.max(4, (val / max) * height),
          backgroundColor: isHi ? "#f97316" : baseColor, // orange for highlight
          duration: 0.25,
          ease: "power2.out",
        })
      })
    }, containerRef)
    return () => ctx.revert()
  }, [values, max, height, highlight])

  return (
    <div ref={containerRef} className="w-full h-[260px] rounded-md bg-neutral-900 p-3">
      <div className="flex items-end w-full h-full" style={{ gap }}>
        {values.map((v, i) => {
          const baseColor = ACCENTS[i % ACCENTS.length]
          return (
            <div
              key={i}
              data-bar
              data-idx={i}
              data-val={v}
              className="flex-1 rounded-sm will-change-[height,background-color]"
              style={{ backgroundColor: baseColor }}
              title={`${v}`}
            />
          )
        })}
      </div>
    </div>
  )
}

export default SortingBarsImproved
