import type { NextRequest } from "next/server"
import type { StepEvent } from "@/lib/algorithms"
import {
  bubbleSteps,
  selectionSteps,
  insertionSteps,
  mergeSteps,
  quickSteps,
  linearSteps,
  binarySteps,
  jumpSteps,
} from "@/lib/steps"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return Response.json({ error: "Invalid JSON" }, { status: 400 })

  const { algorithm, array, options } = body as {
    algorithm: string
    array: number[]
    options?: { target?: number; order?: "asc" | "desc" }
  }

  // Validate
  if (!Array.isArray(array) || array.length < 5 || array.length > 256) {
    return Response.json({ error: "Array length must be 5..256" }, { status: 400 })
  }
  if (array.some((n) => !Number.isFinite(n) || !Number.isInteger(n))) {
    return Response.json({ error: "Array must contain integers" }, { status: 400 })
  }

  // If BACKEND_URL provided, forward the request to Python FastAPI
  const backend = process.env.BACKEND_URL
  if (backend) {
    try {
      const r = await fetch(`${backend.replace(/\/+$/, "")}/api/steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ algorithm, array, options }),
      })
      const data = await r.json()
      return Response.json(data, { status: r.status })
    } catch (err) {
      // fall through to local generator
    }
  }

  // Local TypeScript generators as fallback
  let steps: StepEvent[] = []
  switch (algorithm) {
    case "bubble":
      steps = bubbleSteps(array.slice())
      break
    case "selection":
      steps = selectionSteps(array.slice())
      break
    case "insertion":
      steps = insertionSteps(array.slice())
      break
    case "merge":
      steps = mergeSteps(array.slice())
      break
    case "quick":
      steps = quickSteps(array.slice())
      break
    case "linear":
      steps = linearSteps(array.slice(), options?.target ?? 0)
      break
    case "binary":
      steps = binarySteps(
        array.slice().sort((a, b) => a - b),
        options?.target ?? 0,
      )
      break
    case "jump":
      steps = jumpSteps(
        array.slice().sort((a, b) => a - b),
        options?.target ?? 0,
      )
      break
    default:
      return Response.json({ error: "Unknown algorithm" }, { status: 400 })
  }

  // Basic summary
  const summary: any = {}
  summary.writes = steps.filter((s) => s.type === "swap" || s.type === "overwrite" || s.type === "merge").length
  summary.comparisons = steps.filter((s) => s.type === "compare" || s.type === "probe" || s.type === "check").length

  let foundIndex: number | null = null
  for (let i = steps.length - 1; i >= 0; i--) {
    const s = steps[i]
    if (s.type === "found") {
      // @ts-expect-error index exists on 'found'
      foundIndex = s.index
      break
    }
  }
  summary.foundIndex = foundIndex

  return Response.json({ steps, summary })
}
