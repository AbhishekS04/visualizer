"use client"

import { forwardRef } from "react"

export const SearchCells = forwardRef<HTMLDivElement, { array: number[] }>(function SearchCells({ array }, ref) {
  return (
    <div ref={ref} className="grid grid-cols-8 md:grid-cols-12 gap-2 p-3 border rounded-md">
      {array.map((v, i) => (
        <div
          key={i}
          data-idx={i}
          data-base-color="#ffffff"
          className="h-12 flex items-center justify-center rounded-md bg-white text-black border border-slate-400 shadow-md text-base md:text-lg font-semibold tracking-wide"
          aria-label={`cell ${i} value ${v}`}
        >
          {v}
        </div>
      ))}
    </div>
  )
})
