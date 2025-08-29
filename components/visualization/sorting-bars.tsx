"use client"

import { forwardRef } from "react"
export { SortingBlocks } from "./sorting-blocks"

export const SortingBars = forwardRef<HTMLDivElement, { array: number[] }>(function SortingBars({ array }, ref) {
  const max = Math.max(...array, 1)
  // Punchy 5-color accent palette (within overall theme): cyan, sky, amber, emerald, rose
  const accents = ["#22D3EE", "#38BDF8", "#F59E0B", "#10B981", "#FB7185"] as const

  // Stable hash using index + value to vary colors per render while staying consistent for the array
  const colorFor = (i: number, v: number) => {
    const h = (i * 2654435761 + v * 97) >>> 0
    return accents[h % accents.length]
  }

  return (
    <div
      ref={ref}
      className="relative w-full h-56 md:h-64 lg:h-72 flex items-end gap-0.5 border rounded-md p-2 overflow-hidden"
    >
      {array.map((v, i) => {
        const h = Math.max(4, Math.round((v / max) * 160) + 8)
        const baseColor = colorFor(i, v)
        return (
          <div
            key={i}
            data-idx={i}
            data-base-color={baseColor}
            className="flex-1 rounded-sm shadow-sm will-change-transform will-change-height origin-bottom"
            style={{ height: h, backgroundColor: baseColor }}
            aria-label={`bar ${i} value ${v}`}
          />
        )
      })}
    </div>
  )
})
