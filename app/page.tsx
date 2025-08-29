"use client"

import { useMemo, useState, useRef, useEffect, useCallback } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { gsap } from "gsap"
import Link from "next/link"
import { SortingBars } from "@/components/visualization/sorting-bars"
import { SortingBlocks } from "@/components/visualization/sorting-blocks"
import { SearchCells } from "@/components/visualization/search-cells"
import { LiveProcess } from "@/components/live-process"
import {
  type AlgorithmId,
  type AlgorithmMode,
  type StepEvent,
  generateRandomArray,
  SORTING_ALGOS,
  SEARCHING_ALGOS,
  algoMeta,
  generateSteps,
} from "@/lib/algorithms"

type ViewMode = "sorting" | "searching"
type SortVizMode = "bars" | "blocks"

export default function HomePage() {
  const [mode, setMode] = useState<ViewMode>("sorting")
  const [sortingAlgo, setSortingAlgo] = useState<AlgorithmId>("bubble")
  const [searchAlgo, setSearchAlgo] = useState<AlgorithmId>("linear")
  const [size, setSize] = useState(25)
  const [speed, setSpeed] = useState(0.6) // seconds per step base
  const [array, setArray] = useState<number[]>(() => generateRandomArray(25))
  const [target, setTarget] = useState<number>(13)
  const [playing, setPlaying] = useState(false)
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null)
  const barsRef = useRef<HTMLDivElement>(null)
  const cellsRef = useRef<HTMLDivElement>(null)
  const [steps, setSteps] = useState<StepEvent[]>([])
  const [sortViz, setSortViz] = useState<SortVizMode>("blocks")
  const [visualValues, setVisualValues] = useState<number[]>(array)
  const [blockHighlight, setBlockHighlight] = useState<number[]>([])
  const [liveCurrent, setLiveCurrent] = useState<string | null>(null)
  const [allDescriptions, setAllDescriptions] = useState<string[]>([])
  const [currentAlgo, setCurrentAlgo] = useState<AlgorithmId>(sortingAlgo)
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0, writes: 0, probes: 0 })
  const [elapsedMs, setElapsedMs] = useState(0)
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle")
  const tickerRef = useRef<((t: number) => void) | null>(null)

  // Sync current algo based on mode
  useEffect(() => {
    setCurrentAlgo(mode === "sorting" ? sortingAlgo : searchAlgo)
  }, [mode, sortingAlgo, searchAlgo])

  // Keep blocks visual values in sync on array regenerate (when idle)
  useEffect(() => {
    if (!playing) setVisualValues(array)
  }, [array, playing])

  // Regenerate array on size change when not playing
  useEffect(() => {
    if (!playing) {
      const next = generateRandomArray(size)
      setArray(next)
      setVisualValues(next)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size])

  const reset = useCallback(() => {
    if (tickerRef.current) {
      gsap.ticker.remove(tickerRef.current)
      tickerRef.current = null
    }
    if (timeline) {
      timeline.kill()
    }
    setTimeline(null)
    setPlaying(false)
    setSteps([])
    const next = generateRandomArray(size)
    setArray(next)
    setVisualValues(next)
    setBlockHighlight([])
    setLiveCurrent(null)
    setAllDescriptions([])
    setStats({ comparisons: 0, swaps: 0, writes: 0, probes: 0 })
    setElapsedMs(0)
    setStatus("idle")
  }, [timeline, size])

  // Small utility to describe events for the live process box
  function describe(evt: StepEvent): string {
    switch (evt.type) {
      case "compare":
        return `Compare indices ${evt.indices[0]} and ${evt.indices[1]}`
      case "swap":
        return `Swap indices ${evt.indices[0]} and ${evt.indices[1]}`
      case "overwrite":
        return `Write ${evt.value} at index ${evt.index}`
      case "merge":
        return `Merge range [${evt.range[0]}, ${evt.range[1]}..${evt.range[2]}]`
      case "partition":
        return `Partition pivot at ${evt.pivot} in [${evt.range[0]}, ${evt.range[1]}]`
      case "probe":
        return `Probe index ${evt.index}`
      case "range":
        return `Restrict range to [${evt.range[0]}, ${evt.range[1]}]`
      case "found":
        return `Found at index ${evt.index}`
      case "not_found":
        return "Target not found"
      case "done":
        return "Completed"
      default:
        return "Step"
    }
  }

  const play = useCallback(async () => {
    if (playing) return

    const sourceArray = mode === "searching" ? array.slice().sort((a, b) => a - b) : array.slice()

    const result = steps.length
      ? { steps }
      : generateSteps(currentAlgo, sourceArray, {
          target: mode === "searching" ? Number(target) : undefined,
          order: "asc",
        })

    if (!result) return

    const evts = result.steps
    setSteps(evts)
    setStats({ comparisons: 0, swaps: 0, writes: 0, probes: 0 })

    // Precompute human-readable step list
    const desc = evts.map(describe)
    setAllDescriptions(desc)
    setLiveCurrent(null)

    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: "power2.out" },
    })

    const stepDur = Math.min(0.8, Math.max(0.2, 1.1 / Math.max(0.1, speed)))

    const isBlocks = mode === "sorting" && sortViz === "blocks"
    const root = mode === "sorting" ? barsRef.current : cellsRef.current
    const getEl = (i: number) => root?.querySelector(`[data-idx="${i}"]`) as HTMLElement | null
    const baseColorOf = (i: number) => getEl(i)?.dataset.baseColor || "rgb(148 163 184)"

    const revert = (indices: number[] | null = null, dur = stepDur * 0.3) => {
      if (isBlocks) return // blocks manage highlight via state
      if (!root) return
      if (indices) {
        indices.forEach((idx) => {
          const el = getEl(idx)
          if (el) gsap.to(el, { backgroundColor: baseColorOf(idx), boxShadow: "none", outline: "none", duration: dur })
        })
      } else {
        const nodes = root.querySelectorAll<HTMLElement>("[data-idx]")
        nodes.forEach((el) => {
          const idx = Number(el.dataset.idx)
          const base = el.dataset.baseColor || baseColorOf(idx)
          gsap.to(el, { backgroundColor: base, boxShadow: "none", outline: "none", duration: dur })
        })
      }
    }

    const palette = {
      compare: "rgb(59 130 246)", // blue-500
      action: "rgb(16 185 129)", // emerald-500
      found: "rgb(245 158 11)", // amber-500
    } as const

    const algoMotion = {
      bubble: {
        compare: { scale: 1.05, duration: stepDur * 0.45 },
        action: { y: -8, yoyo: true, repeat: 1, duration: stepDur * 0.5 },
      },
      selection: {
        compare: { boxShadow: "0 0 0 3px rgba(59,130,246,.35)", duration: stepDur * 0.4 },
        action: { rotate: 1.5, yoyo: true, repeat: 1, duration: stepDur * 0.5 },
      },
      insertion: {
        compare: { y: -6, duration: stepDur * 0.35 },
        action: { scaleY: 1.12, yoyo: true, repeat: 1, duration: stepDur * 0.5 },
      },
      merge: {
        compare: { opacity: 0.9, duration: stepDur * 0.3 },
        action: { filter: "brightness(1.15)", duration: stepDur * 0.5 },
      },
      quick: { compare: { scale: 1.04, duration: stepDur * 0.3 }, action: { scale: 1.06, duration: stepDur * 0.5 } },
      linear: {
        compare: { scale: 1.05, duration: stepDur * 0.25 },
        action: { boxShadow: "0 0 0 3px rgba(16,185,129,.5)", duration: stepDur * 0.35 },
      },
      binary: {
        compare: { outline: "2px solid rgba(59,130,246,.6)", duration: stepDur * 0.3 },
        action: { boxShadow: "0 0 0 3px rgba(16,185,129,.55)", duration: stepDur * 0.35 },
      },
      jump: {
        compare: { y: -8, duration: stepDur * 0.3 },
        action: { y: 0, boxShadow: "0 0 0 3px rgba(16,185,129,.45)", duration: stepDur * 0.35 },
      },
    } as const

    const motion = (algoMotion as any)[currentAlgo] ?? algoMotion.bubble

    evts.forEach((evt, idx) => {
      // Update the live process line for each step
      tl.add(() => setLiveCurrent(desc[idx]))

      switch (evt.type) {
        case "compare": {
          const [i, j] = (evt as any).indices as [number, number]
          tl.add(() => setStats((s) => ({ ...s, comparisons: s.comparisons + 1 })))
          if (isBlocks) {
            tl.add(() => setBlockHighlight([i, j]))
            tl.to({}, { duration: stepDur * 0.3 })
            tl.add(() => setBlockHighlight([]))
          } else {
            tl.to([getEl(i), getEl(j)].filter(Boolean), { backgroundColor: palette.compare, ...motion.compare }, "+=0")
            tl.add(() => revert([i, j]))
          }
          break
        }
        case "probe": {
          const k = (evt as any).index as number
          tl.add(() => setStats((s) => ({ ...s, probes: s.probes + 1 })))
          if (isBlocks) {
            tl.add(() => setBlockHighlight([k]))
            tl.to({}, { duration: stepDur * 0.25 })
            tl.add(() => setBlockHighlight([]))
          } else {
            tl.to(getEl(k), { backgroundColor: palette.compare, ...motion.compare }, "+=0")
            tl.add(() => revert([k]))
          }
          break
        }
        case "swap": {
          const [i, j] = (evt as any).indices as [number, number]
          const arrNow = (evt as any).array as number[] | undefined
          tl.add(() => setStats((s) => ({ ...s, swaps: s.swaps + 1 })))
          if (isBlocks) {
            tl.add(() => setBlockHighlight([i, j]))
            if (arrNow) tl.add(() => setVisualValues(arrNow))
            tl.to({}, { duration: stepDur * 0.42 })
            tl.add(() => setBlockHighlight([]))
          } else {
            tl.to([getEl(i), getEl(j)].filter(Boolean), { backgroundColor: palette.action, ...motion.action }, "+=0")
            if (arrNow) {
              tl.add(() => {
                const maxV = Math.max(...arrNow, 1)
                ;[i, j].forEach((idx) => {
                  const v = arrNow[idx]
                  const el = getEl(idx)
                  if (el != null) {
                    const h = Math.max(4, Math.round((v / maxV) * 160) + 8)
                    gsap.to(el, { height: h, duration: stepDur * 0.6, ease: "power2.out" })
                  }
                })
              })
            }
            tl.add(() => revert([i, j]))
          }
          break
        }
        case "overwrite": {
          tl.add(() => setStats((s) => ({ ...s, writes: s.writes + 1 })))
          const idxW = (evt as any).index as number
          const arrNow = (evt as any).array as number[] | undefined
          if (isBlocks) {
            tl.add(() => setBlockHighlight([idxW]))
            if (arrNow) tl.add(() => setVisualValues(arrNow))
            tl.to({}, { duration: stepDur * 0.35 })
            tl.add(() => setBlockHighlight([]))
          } else if (arrNow) {
            tl.add(() => {
              const maxV = Math.max(...arrNow, 1)
              const v = arrNow[idxW]
              const el = getEl(idxW)
              if (el) {
                const h = Math.max(4, Math.round((v / maxV) * 160) + 8)
                gsap.to(el, {
                  height: h,
                  backgroundColor: palette.action,
                  duration: stepDur * 0.5,
                  ease: "power2.out",
                })
              }
            })
            tl.add(() => revert([idxW], stepDur * 0.25))
          }
          break
        }
        case "merge": {
          const [lo, _mid, hi] = (evt as any).range as [number, number, number]
          const arrNow = (evt as any).array as number[] | undefined
          tl.add(() => setStats((s) => ({ ...s, writes: s.writes + 1 })))
          if (isBlocks) {
            if (arrNow) tl.add(() => setVisualValues(arrNow))
            tl.to({}, { duration: stepDur * 0.35 })
          } else if (arrNow) {
            tl.add(() => {
              const maxV = Math.max(...arrNow, 1)
              for (let idxM = lo; idxM <= hi; idxM++) {
                const v = arrNow[idxM]
                const el = getEl(idxM)
                if (el) {
                  const h = Math.max(4, Math.round((v / maxV) * 160) + 8)
                  gsap.to(el, { height: h, duration: stepDur * 0.45, ease: "power1.out" })
                }
              }
            })
            tl.add(() => revert(null, stepDur * 0.25))
          }
          break
        }
        case "partition": {
          if (isBlocks) {
            tl.to({}, { duration: stepDur * 0.25 })
          } else {
            const pivot = (evt as any).pivot as number
            const [lo, hi] = (evt as any).range as [number, number]
            tl.add(() => {
              for (let i = lo; i <= hi; i++) {
                const el = getEl(i)
                if (el) el.style.outline = "2px solid rgba(59,130,246,.35)"
              }
            })
            tl.to(getEl(pivot), { scale: 1.1, backgroundColor: palette.found, ...motion.action }, "+=0")
            tl.to({}, { duration: stepDur * 0.22 })
            tl.add(() => {
              for (let i = lo; i <= hi; i++) {
                const el = getEl(i)
                if (el) el.style.outline = "none"
              }
              revert([pivot])
            })
          }
          break
        }
        case "range": {
          if (isBlocks) {
            tl.to({}, { duration: stepDur * 0.28 })
          } else {
            const [lo, hi] = (evt as any).range as [number, number]
            tl.add(() => {
              for (let i = lo; i <= hi; i++) {
                const el = getEl(i)
                if (el) el.style.outline = "2px solid rgba(59,130,246,.35)"
              }
            })
            tl.to({}, { duration: stepDur * 0.28 })
            tl.add(() => {
              for (let i = 0; i < sourceArray.length; i++) {
                const el = getEl(i)
                if (el) el.style.outline = "none"
              }
            })
          }
          break
        }
        case "found": {
          if (isBlocks) {
            const k = (evt as any).index as number
            tl.add(() => setBlockHighlight([k]))
            tl.to({}, { duration: stepDur * 0.4 })
          } else {
            const k = (evt as any).index as number
            tl.to(getEl(k), {
              backgroundColor: palette.found,
              boxShadow: "0 0 0 4px rgba(245,158,11,.45)",
              scale: 1.07,
              duration: stepDur * 0.55,
              ease: "back.out(1.6)",
            })
          }
          break
        }
        case "not_found": {
          if (!isBlocks) {
            tl.to(root!, { duration: stepDur * 0.4, opacity: 0.92 })
            tl.to(root!, { duration: stepDur * 0.35, opacity: 1 })
          } else {
            tl.to({}, { duration: stepDur * 0.3 })
          }
          break
        }
        case "done": {
          tl.to({}, { duration: stepDur * 0.25 })
          break
        }
      }
    })

    setTimeline(tl)
    setPlaying(true)
    setStatus("running")
    if (tickerRef.current) {
      gsap.ticker.remove(tickerRef.current)
      tickerRef.current = null
    }
    const updateElapsed = () => setElapsedMs(Math.max(0, Math.round((tl.time() || 0) * 1000)))
    gsap.ticker.add(updateElapsed)
    tickerRef.current = updateElapsed

    tl.eventCallback("onComplete", () => {
      setPlaying(false)
      setStatus("done")
      if (tickerRef.current) {
        gsap.ticker.remove(tickerRef.current)
        tickerRef.current = null
      }
      setElapsedMs(Math.max(0, Math.round((tl.time() || 0) * 1000)))
    })
    tl.play()
  }, [steps, currentAlgo, mode, target, array, speed, playing, sortViz])

  const currentMeta = useMemo(() => algoMeta[currentAlgo], [currentAlgo])

  return (
    <main className="bg-slate-950 text-slate-200 p-6 max-w-5xl mx-auto space-y-6 min-h-dvh">
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-pretty">Sorting & Searching Visualizer</h1>
            <p className="text-sm text-muted-foreground max-w-prose">
              Visualize classic algorithms step-by-step using smooth GSAP animations. Adjust speed and array size, then
              press Start.
            </p>
          </div>
          <Link href="/about" className="inline-flex">
            <Button variant="outline">About</Button>
          </Link>
        </div>
      </header>

      <Tabs value={mode} onValueChange={(v) => setMode(v as ViewMode)}>
        <TabsList>
          <TabsTrigger value="sorting">Sorting</TabsTrigger>
          <TabsTrigger value="searching">Searching</TabsTrigger>
        </TabsList>

        <TabsContent value="sorting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                {/* Existing three controls */}
                <div className="space-y-2">
                  <Label>Algorithm</Label>
                  <Select value={sortingAlgo} onValueChange={(v) => setSortingAlgo(v as AlgorithmId)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORTING_ALGOS.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Speed</Label>
                  <Slider value={[speed]} min={0.1} max={1.5} step={0.05} onValueChange={([v]) => setSpeed(v)} />
                </div>
                <div className="space-y-2">
                  <Label>Array size</Label>
                  <Slider value={[size]} min={5} max={100} step={1} onValueChange={([v]) => setSize(v)} />
                </div>
                {/* New control: Visualization */}
                <div className="space-y-2">
                  <Label>Visualization</Label>
                  <Select value={sortViz} onValueChange={(v) => setSortViz(v as SortVizMode)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blocks">Number Blocks</SelectItem>
                      <SelectItem value="bars">Bars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Existing buttons */}
              <div className="flex items-center gap-3">
                <Button onClick={play} disabled={playing}>
                  Start
                </Button>
                <Button variant="secondary" onClick={() => timeline?.paused(!timeline?.paused())} disabled={!timeline}>
                  {timeline?.paused() ? "Resume" : "Pause"}
                </Button>
                <Button variant="ghost" onClick={reset}>
                  Reset
                </Button>
                <Button
                  variant="outline"
                  onClick={() => !playing && setArray(generateRandomArray(size))}
                  disabled={playing}
                >
                  Randomize
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Render blocks or bars */}
              {sortViz === "blocks" ? (
                <SortingBlocks values={visualValues} highlight={blockHighlight} size={44} gap={16} />
              ) : (
                <SortingBars ref={barsRef} array={array} />
              )}
            </CardContent>
          </Card>

          <LiveProcess title="Live Process (Sorting)" current={liveCurrent} all={allDescriptions} />

          <StatsPanel stats={stats} theoretical={currentMeta.complexity} elapsedMs={elapsedMs} status={status} />
          <InfoPanel mode="sorting" algo={currentAlgo} />
        </TabsContent>

        <TabsContent value="searching" className="space-y-4">
          {/* Existing controls card */}
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Algorithm</Label>
                  <Select value={searchAlgo} onValueChange={(v) => setSearchAlgo(v as AlgorithmId)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SEARCHING_ALGOS.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Speed</Label>
                  <Slider value={[speed]} min={0.1} max={1.5} step={0.05} onValueChange={([v]) => setSpeed(v)} />
                </div>
                <div className="space-y-2">
                  <Label>Target</Label>
                  <Input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value || 0))} />
                </div>
              </div>

              {/* Existing buttons */}
              <div className="flex items-center gap-3">
                <Button onClick={play} disabled={playing}>
                  Start
                </Button>
                <Button variant="secondary" onClick={() => timeline?.paused(!timeline?.paused())} disabled={!timeline}>
                  {timeline?.paused() ? "Resume" : "Pause"}
                </Button>
                <Button variant="ghost" onClick={reset}>
                  Reset
                </Button>
                <Button
                  variant="outline"
                  onClick={() => !playing && setArray(generateRandomArray(size).sort((a, b) => a - b))}
                  disabled={playing}
                >
                  Randomize (sorted)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing visualization card */}
          <Card>
            <CardHeader>
              <CardTitle>Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <SearchCells ref={cellsRef} array={array.slice().sort((a, b) => a - b)} />
            </CardContent>
          </Card>

          <LiveProcess title="Live Process (Searching)" current={liveCurrent} all={allDescriptions} />

          <StatsPanel stats={stats} theoretical={currentMeta.complexity} elapsedMs={elapsedMs} status={status} />
          <InfoPanel mode="searching" algo={currentAlgo} />
        </TabsContent>
      </Tabs>
    </main>
  )
}

function InfoPanel({ mode, algo }: { mode: AlgorithmMode; algo: AlgorithmId }) {
  const meta = algoMeta[algo]
  if (!meta) return null
  return (
    <Card>
      <CardHeader>
        <CardTitle>About {meta.label}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-2">
        <p>{meta.description}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <InfoChip label="Best" value={meta.complexity.best} />
          <InfoChip label="Average" value={meta.complexity.avg} />
          <InfoChip label="Worst" value={meta.complexity.worst} />
          {"space" in meta.complexity ? <InfoChip label="Space" value={meta.complexity.space!} /> : null}
        </div>
      </CardContent>
    </Card>
  )
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border px-3 py-2">
      <span className="text-xs">{label}</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  )
}

function StatsPanel({
  stats,
  theoretical,
  elapsedMs,
  status,
}: {
  stats: { comparisons: number; swaps: number; writes: number; probes: number }
  theoretical: { best: string; avg: string; worst: string; space?: string }
  elapsedMs: number
  status: "idle" | "running" | "done"
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Complexity</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-6 gap-2 text-sm">
        <InfoChip label="Comparisons" value={String(stats.comparisons)} />
        <InfoChip label="Writes" value={String(stats.writes)} />
        <InfoChip label="Swaps" value={String(stats.swaps)} />
        <InfoChip label="Probes" value={String(stats.probes)} />
        <InfoChip label="Elapsed" value={`${(elapsedMs / 1000).toFixed(2)}s`} />
        <InfoChip label="Status" value={status === "running" ? "Running" : status === "done" ? "Done" : "Idle"} />
        <div className="col-span-2 md:col-span-6 grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          <InfoChip label="Best" value={theoretical.best} />
          <InfoChip label="Average" value={theoretical.avg} />
          <InfoChip label="Worst" value={theoretical.worst} />
          {"space" in theoretical ? <InfoChip label="Space" value={theoretical.space!} /> : null}
        </div>
      </CardContent>
    </Card>
  )
}
