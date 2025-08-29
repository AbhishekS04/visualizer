"use client"
import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import { gsap } from "gsap"
import { SortingBarsImproved } from "@/components/visualization/sorting-bars-improved"
import { SortingBlocks } from "@/components/visualization/sorting-blocks"
import { StepLog } from "@/components/step-log"
import { type SortAlgo, algoComplexities, formatStepDescription, generateSortingSteps } from "@/lib/algorithms-steps"

type ViewMode = "bars" | "blocks"

const DEFAULT_SIZE = 16

function uniqueRandomArray(n: number, min = 5, max = 200) {
  const range = Array.from({ length: Math.max(n, max - min + 1) }, (_, i) => i + min)
  for (let i = range.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[range[i], range[j]] = [range[j], range[i]]
  }
  return range.slice(0, n)
}

export default function VisualizerPage() {
  const [algo, setAlgo] = useState<SortAlgo>("bubble")
  const [view, setView] = useState<ViewMode>("blocks")
  const [size, setSize] = useState<number>(DEFAULT_SIZE)
  const [speed, setSpeed] = useState<number>(3)
  const [values, setValues] = useState<number[]>(() => uniqueRandomArray(DEFAULT_SIZE))
  const [highlight, setHighlight] = useState<number[]>([])
  const [playing, setPlaying] = useState(false)

  // Live metrics
  const [comparisons, setComparisons] = useState(0)
  const [writes, setWrites] = useState(0)
  const [swaps, setSwaps] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const startTimeRef = useRef<number | null>(null)

  // Steps
  const [currentStep, setCurrentStep] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [allSteps, setAllSteps] = useState<string[]>([])

  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const complexities = useMemo(() => algoComplexities(algo), [algo])

  function resetStateWithArray(arr: number[]) {
    setValues(arr)
    setHighlight([])
    setComparisons(0)
    setWrites(0)
    setSwaps(0)
    setElapsed(0)
    setCurrentStep("")
    setHistory([])
    setAllSteps([])
  }

  function handleRandomize() {
    if (playing) return
    resetStateWithArray(uniqueRandomArray(size))
  }

  function handleSizeChange(n: number) {
    if (playing) return
    setSize(n)
    resetStateWithArray(uniqueRandomArray(n))
  }

  function appendHistory(text: string) {
    setHistory((h) => [...h, text])
  }

  function handleStart() {
    if (playing) return
    tlRef.current?.kill()
    tlRef.current = null

    setPlaying(true)
    // Only reset metrics, not the values array
    setHighlight([])
    setComparisons(0)
    setWrites(0)
    setSwaps(0)
    setElapsed(0)
    setCurrentStep("")
    setHistory([])
    setAllSteps([])

    const run = generateSortingSteps(algo, values)
    const steps = run.steps
    const summaryFinalArray = steps.length ? ((steps[steps.length - 1] as any).array ?? values) : values
    setAllSteps(steps.map((s) => formatStepDescription(s)))

    const tl = gsap.timeline({
      defaults: { duration: Math.max(0.2, 0.6 / speed), ease: "power2.out" },
      onComplete: () => {
        setPlaying(false)
        setHighlight([])
        // Ensure the final sorted array is preserved
        setValues(summaryFinalArray)
        setCurrentStep("Sorting complete - Array is now sorted!")
        if (startTimeRef.current != null) {
          setElapsed(performance.now() - startTimeRef.current)
          startTimeRef.current = null
        }
      },
    })
    tlRef.current = tl
    startTimeRef.current = performance.now()

    steps.forEach((step) => {
      tl.add(() => {
        const desc = formatStepDescription(step)
        setCurrentStep(desc)
        appendHistory(desc)

        switch (step.type) {
          case "compare":
            setHighlight(step.indices)
            setComparisons((c) => c + 1)
            break
          case "swap":
            setHighlight(step.indices)
            setValues(step.array)
            setSwaps((s) => s + 1)
            setWrites((w) => w + 2)
            break
          case "overwrite":
            setHighlight([step.index])
            setValues(step.array)
            setWrites((w) => w + 1)
            break
          case "merge":
            setValues(step.array)
            setHighlight([])
            setWrites((w) => w + 1)
            break
          case "partition":
            setHighlight([step.pivot])
            break
          case "done":
            setValues(step.array)
            setHighlight([])
            break
        }
        if (startTimeRef.current != null) {
          setElapsed(performance.now() - startTimeRef.current)
        }
      })
    })
  }

  function handlePauseResume() {
    const tl = tlRef.current
    if (!tl) return
    if (playing) {
      tl.pause()
      setPlaying(false)
    } else {
      tl.play()
      setPlaying(true)
    }
  }

  function handleReset() {
    tlRef.current?.kill()
    tlRef.current = null
    setPlaying(false)
    resetStateWithArray(uniqueRandomArray(size))
  }

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-200">
      <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col gap-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-pretty">Sorting Visualizer</h1>
            <p className="text-sm text-neutral-400">
              Dark-only. Smooth animations. Live complexity and step explanations.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={algo}
              onChange={(e) => setAlgo(e.target.value as SortAlgo)}
              className="bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-sm"
            >
              <option value="bubble">Bubble Sort</option>
              <option value="selection">Selection Sort</option>
              <option value="insertion">Insertion Sort</option>
              <option value="merge">Merge Sort</option>
              <option value="quick">Quick Sort</option>
            </select>
            <select
              value={view}
              onChange={(e) => setView(e.target.value as ViewMode)}
              className="bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-sm"
            >
              <option value="blocks">Blocks with numbers</option>
              <option value="bars">Bars</option>
            </select>
            <button
              onClick={handleStart}
              disabled={playing}
              className="rounded-md px-3 py-2 bg-cyan-500 text-neutral-950 font-medium hover:bg-cyan-400 disabled:opacity-50"
            >
              Start
            </button>
            <button
              onClick={handlePauseResume}
              className="rounded-md px-3 py-2 bg-emerald-500 text-neutral-950 font-medium hover:bg-emerald-400"
            >
              {playing ? "Pause" : "Resume"}
            </button>
            <button
              onClick={handleReset}
              className="rounded-md px-3 py-2 bg-neutral-800 text-neutral-200 font-medium hover:bg-neutral-700"
            >
              Reset
            </button>
            <Link
              href="/about"
              className="rounded-md px-3 py-2 bg-white/10 text-neutral-100 border border-neutral-700 hover:bg-white/15"
            >
              About
            </Link>
          </div>
        </header>

        <section className="flex flex-col gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm text-neutral-400">Speed</label>
              <input
                type="range"
                min={1}
                max={5}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-40"
              />
              <label className="text-sm text-neutral-400">Size</label>
              <input
                type="range"
                min={5}
                max={40}
                value={size}
                onChange={(e) => handleSizeChange(Number(e.target.value))}
                className="w-40"
              />
              <button
                onClick={handleRandomize}
                disabled={playing}
                className="ml-auto rounded-md px-3 py-2 bg-neutral-800 text-neutral-200 hover:bg-neutral-700 disabled:opacity-50"
              >
                Randomize
              </button>
            </div>

            {view === "blocks" ? (
              <SortingBlocks values={values} highlight={highlight} gap={12} />
            ) : (
              <SortingBarsImproved values={values} highlight={highlight} gap={8} />
            )}

            <StepLog current={currentStep} history={history} allSteps={allSteps} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-neutral-900/80 backdrop-blur rounded-md p-4 border border-neutral-800">
                <h3 className="text-sm text-neutral-400 mb-2">Live Complexity</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-neutral-400">Comparisons</div>
                  <div className="font-semibold text-neutral-100">{comparisons}</div>
                  <div className="text-neutral-400">Writes</div>
                  <div className="font-semibold text-neutral-100">{writes}</div>
                  <div className="text-neutral-400">Swaps</div>
                  <div className="font-semibold text-neutral-100">{swaps}</div>
                  <div className="text-neutral-400">Elapsed (ms)</div>
                  <div className="font-semibold text-neutral-100">{Math.round(elapsed)}</div>
                </div>
              </div>
              <div className="bg-neutral-900/80 backdrop-blur rounded-md p-4 border border-neutral-800">
                <h3 className="text-sm text-neutral-400 mb-2">Theoretical Complexity</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-neutral-400">Best</div>
                  <div className="font-semibold text-neutral-100">{complexities.best}</div>
                  <div className="text-neutral-400">Average</div>
                  <div className="font-semibold text-neutral-100">{complexities.avg}</div>
                  <div className="text-neutral-400">Worst</div>
                  <div className="font-semibold text-neutral-100">{complexities.worst}</div>
                  <div className="text-neutral-400">Space</div>
                  <div className="font-semibold text-neutral-100">{complexities.space}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
