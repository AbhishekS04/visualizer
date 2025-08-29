export type SortAlgo = "bubble" | "selection" | "insertion" | "merge" | "quick"

export type StepEvent =
  | { type: "compare"; indices: [number, number] }
  | { type: "swap"; indices: [number, number]; array: number[] }
  | { type: "overwrite"; index: number; value: number; array: number[] }
  | { type: "partition"; pivot: number; range: [number, number] }
  | { type: "merge"; range: [number, number, number]; array: number[] }
  | { type: "done"; array: number[] }

export type SortRun = {
  steps: StepEvent[]
  summary: { comparisons: number; writes: number; swaps: number }
}

function clone(a: number[]) {
  return a.slice()
}

export function formatStepDescription(step: StepEvent): string {
  switch (step.type) {
    case "compare":
      return `Compare indices ${step.indices[0]} and ${step.indices[1]}`
    case "swap":
      return `Swap indices ${step.indices[0]} and ${step.indices[1]}`
    case "overwrite":
      return `Write value ${step.value} at index ${step.index}`
    case "partition":
      return `Partition around pivot index ${step.pivot} in range [${step.range[0]}, ${step.range[1]}]`
    case "merge":
      return `Merge range [${step.range[0]}, ${step.range[1]}]..${step.range[2]}`
    case "done":
      return `Sorting complete`
  }
}

// Bubble Sort (stable event generation)
export function bubbleSortSteps(arr: number[]): SortRun {
  const a = clone(arr)
  const steps: StepEvent[] = []
  let comparisons = 0
  let writes = 0
  let swaps = 0

  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      steps.push({ type: "compare", indices: [j, j + 1] })
      comparisons++
      if (a[j] > a[j + 1]) {
        ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
        steps.push({ type: "swap", indices: [j, j + 1], array: clone(a) })
        swaps++
        writes += 2
      }
    }
  }
  steps.push({ type: "done", array: clone(a) })
  return { steps, summary: { comparisons, writes, swaps } }
}

// Selection Sort
export function selectionSortSteps(arr: number[]): SortRun {
  const a = clone(arr)
  const steps: StepEvent[] = []
  let comparisons = 0
  let writes = 0
  let swaps = 0

  for (let i = 0; i < a.length; i++) {
    let minIdx = i
    for (let j = i + 1; j < a.length; j++) {
      steps.push({ type: "compare", indices: [minIdx, j] })
      comparisons++
      if (a[j] < a[minIdx]) minIdx = j
    }
    if (minIdx !== i) {
      ;[a[i], a[minIdx]] = [a[minIdx], a[i]]
      steps.push({ type: "swap", indices: [i, minIdx], array: clone(a) })
      swaps++
      writes += 2
    }
  }
  steps.push({ type: "done", array: clone(a) })
  return { steps, summary: { comparisons, writes, swaps } }
}

// Insertion Sort
export function insertionSortSteps(arr: number[]): SortRun {
  const a = clone(arr)
  const steps: StepEvent[] = []
  let comparisons = 0
  let writes = 0
  const swaps = 0

  for (let i = 1; i < a.length; i++) {
    const key = a[i]
    let j = i - 1
    while (j >= 0) {
      steps.push({ type: "compare", indices: [j, j + 1] })
      comparisons++
      if (a[j] > key) {
        a[j + 1] = a[j]
        steps.push({ type: "overwrite", index: j + 1, value: a[j], array: clone(a) })
        writes++
        j--
      } else break
    }
    a[j + 1] = key
    steps.push({ type: "overwrite", index: j + 1, value: key, array: clone(a) })
    writes++
  }
  steps.push({ type: "done", array: clone(a) })
  return { steps, summary: { comparisons, writes, swaps } }
}

// Merge Sort
export function mergeSortSteps(arr: number[]): SortRun {
  const a = clone(arr)
  const steps: StepEvent[] = []
  let comparisons = 0
  let writes = 0
  const swaps = 0

  function merge(lo: number, mid: number, hi: number) {
    const left = a.slice(lo, mid + 1)
    const right = a.slice(mid + 1, hi + 1)
    let i = 0,
      j = 0,
      k = lo
    while (i < left.length && j < right.length) {
      steps.push({ type: "compare", indices: [lo + i, mid + 1 + j] })
      comparisons++
      if (left[i] <= right[j]) {
        a[k] = left[i++]
      } else {
        a[k] = right[j++]
      }
      steps.push({ type: "merge", range: [lo, mid, hi], array: clone(a) })
      writes++
      k++
    }
    while (i < left.length) {
      a[k++] = left[i++]
      steps.push({ type: "merge", range: [lo, mid, hi], array: clone(a) })
      writes++
    }
    while (j < right.length) {
      a[k++] = right[j++]
      steps.push({ type: "merge", range: [lo, mid, hi], array: clone(a) })
      writes++
    }
  }

  function sort(lo: number, hi: number) {
    if (lo >= hi) return
    const mid = Math.floor((lo + hi) / 2)
    sort(lo, mid)
    sort(mid + 1, hi)
    merge(lo, mid, hi)
  }

  sort(0, a.length - 1)
  steps.push({ type: "done", array: clone(a) })
  return { steps, summary: { comparisons, writes, swaps } }
}

// Quick Sort (Lomuto partition)
export function quickSortSteps(arr: number[]): SortRun {
  const a = clone(arr)
  const steps: StepEvent[] = []
  let comparisons = 0
  let writes = 0
  let swaps = 0

  function partition(lo: number, hi: number): number {
    const pivot = a[hi]
    let i = lo
    steps.push({ type: "partition", pivot: hi, range: [lo, hi] })
    for (let j = lo; j < hi; j++) {
      steps.push({ type: "compare", indices: [j, hi] })
      comparisons++
      if (a[j] < pivot) {
        if (i !== j) {
          ;[a[i], a[j]] = [a[j], a[i]]
          steps.push({ type: "swap", indices: [i, j], array: clone(a) })
          swaps++
          writes += 2
        }
        i++
      }
    }
    if (i !== hi) {
      ;[a[i], a[hi]] = [a[hi], a[i]]
      steps.push({ type: "swap", indices: [i, hi], array: clone(a) })
      swaps++
      writes += 2
    }
    return i
  }

  function qs(lo: number, hi: number) {
    if (lo >= hi) return
    const p = partition(lo, hi)
    qs(lo, p - 1)
    qs(p + 1, hi)
  }

  qs(0, a.length - 1)
  steps.push({ type: "done", array: clone(a) })
  return { steps, summary: { comparisons, writes, swaps } }
}

export function generateSortingSteps(algo: SortAlgo, arr: number[]): SortRun {
  switch (algo) {
    case "bubble":
      return bubbleSortSteps(arr)
    case "selection":
      return selectionSortSteps(arr)
    case "insertion":
      return insertionSortSteps(arr)
    case "merge":
      return mergeSortSteps(arr)
    case "quick":
      return quickSortSteps(arr)
    default:
      return bubbleSortSteps(arr)
  }
}

export function algoComplexities(algo: SortAlgo) {
  // Theoretical complexities
  switch (algo) {
    case "bubble":
      return { best: "O(n)", avg: "O(n^2)", worst: "O(n^2)", space: "O(1)" }
    case "selection":
      return { best: "O(n^2)", avg: "O(n^2)", worst: "O(n^2)", space: "O(1)" }
    case "insertion":
      return { best: "O(n)", avg: "O(n^2)", worst: "O(n^2)", space: "O(1)" }
    case "merge":
      return { best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(n)" }
    case "quick":
      return { best: "O(n log n)", avg: "O(n log n)", worst: "O(n^2)", space: "O(log n)" }
  }
}
