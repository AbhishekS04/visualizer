"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { gsap } from "gsap"

type Props = {
  values: number[]
  highlight?: number[]
  size?: number
  gap?: number
}

type Block = {
  id: string
  value: number
  position: number
}

const HILITE_BG = "#f97316" // orange-500
const HILITE_BORDER = "#fb923c" // orange-400
const BASE_BG = "#ffffff"
const BASE_TEXT = "#0a0a0a"
const BASE_BORDER = "#e5e7eb" // neutral-200

// Counter for stable ID generation
let blockIdCounter = 0

export function SortingBlocks({ values, highlight = [], size = 44, gap = 16 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [isClient, setIsClient] = useState(false)
  const prevValuesRef = useRef<number[]>([])
  
  // Ensure we only render on client to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Initialize or update blocks when values change
  useEffect(() => {
    if (!isClient) return
    
    const prevValues = prevValuesRef.current
    
    // If array length changed or it's the first render, reinitialize
    if (prevValues.length !== values.length) {
      const newBlocks = values.map((value, index) => ({
        id: `block-${blockIdCounter++}-${index}`,
        value,
        position: index
      }))
      setBlocks(newBlocks)
      prevValuesRef.current = [...values]
      return
    }
    
    // For sorting steps, maintain block identity and update positions
    setBlocks(prevBlocks => {
      const newBlocks = [...prevBlocks]
      
      // Create a map of current value positions
      const valuePositions = new Map<number, number[]>()
      values.forEach((value, index) => {
        if (!valuePositions.has(value)) {
          valuePositions.set(value, [])
        }
        valuePositions.get(value)!.push(index)
      })
      
      // Update block positions based on their values
      const usedPositions = new Map<number, number>()
      newBlocks.forEach(block => {
        const positions = valuePositions.get(block.value) || []
        const usedCount = usedPositions.get(block.value) || 0
        
        if (positions[usedCount] !== undefined) {
          block.position = positions[usedCount]
          usedPositions.set(block.value, usedCount + 1)
        }
      })
      
      return newBlocks
    })
    
    prevValuesRef.current = [...values]
  }, [values, isClient])

  // Animate blocks to their new positions
  useEffect(() => {
    if (blocks.length === 0) return
    
    const ctx = gsap.context(() => {
      blocks.forEach(block => {
        const el = document.querySelector<HTMLElement>(`[data-block-id="${block.id}"]`)
        if (!el) return
        
        const targetX = block.position * (size + gap)
        const isHighlighted = highlight.includes(block.position)
        
        gsap.to(el, {
          x: targetX,
          backgroundColor: isHighlighted ? HILITE_BG : BASE_BG,
          color: BASE_TEXT,
          borderColor: isHighlighted ? HILITE_BORDER : BASE_BORDER,
          duration: 0.35,
          ease: "power2.out",
        })
      })
    }, containerRef)
    
    return () => ctx.revert()
  }, [blocks, highlight, size, gap])

  // Show loading state during SSR/initial hydration
  if (!isClient) {
    return (
      <div className="w-full overflow-x-auto">
        <div
          className="relative h-[64px] rounded-md bg-neutral-900/80 backdrop-blur p-2 flex items-center justify-center"
          style={{ 
            paddingLeft: gap / 2, 
            paddingRight: gap / 2,
            minWidth: Math.max(400, values.length * (size + gap) + gap)
          }}
        >
          <div className="text-neutral-400 text-sm">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full overflow-x-auto">
      <div
        className="relative h-[64px] rounded-md bg-neutral-900/80 backdrop-blur p-2"
        style={{ 
          paddingLeft: gap / 2, 
          paddingRight: gap / 2,
          minWidth: Math.max(400, values.length * (size + gap) + gap)
        }}
      >
        {blocks.map(block => (
          <div
            key={block.id}
            data-block-id={block.id}
            className="absolute top-2 rounded-md border shadow-sm grid place-items-center select-none will-change-transform font-mono"
            style={{ 
              left: 0,
              width: size,
              height: size,
              background: BASE_BG, 
              color: BASE_TEXT, 
              borderColor: BASE_BORDER,
              fontSize: block.value > 99 ? '11px' : '13px'
            }}
          >
            <span className="font-semibold">{block.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SortingBlocks
