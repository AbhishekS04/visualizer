export type AlgorithmMode = "sorting" | "searching"
export type AlgorithmId = "bubble" | "selection" | "insertion" | "merge" | "quick" | "linear" | "binary" | "jump"

export type StepEvent =
  | { type: "compare"; indices: [number, number] }
  | { type: "swap"; indices: [number, number]; array: number[] }
  | { type: "overwrite"; index: number; value: number; array: number[] }
  | { type: "partition"; pivot: number; range: [number, number] }
  | { type: "merge"; range: [number, number, number]; array: number[] }
  | { type: "done"; array: number[] }
  | { type: "probe"; index: number }
  | { type: "check"; index: number }
  | { type: "range"; range: [number, number] }
  | { type: "found"; index: number }
  | { type: "not_found" }

export function generateRandomArray(n: number) {
  const out: number[] = []
  for (let i = 0; i < n; i++) out.push(Math.floor(Math.random() * 99) + 1)
  return out
}

export const SORTING_ALGOS = [
  { id: "bubble", label: "Bubble Sort" },
  { id: "selection", label: "Selection Sort" },
  { id: "insertion", label: "Insertion Sort" },
  { id: "merge", label: "Merge Sort" },
  { id: "quick", label: "Quick Sort" },
] as const

export const SEARCHING_ALGOS = [
  { id: "linear", label: "Linear Search" },
  { id: "binary", label: "Binary Search" },
  { id: "jump", label: "Jump Search" },
] as const

type Complexity = { best: string; avg: string; worst: string; space?: string }
export const algoMeta: Record<AlgorithmId, { label: string; description: string; complexity: Complexity }> = {
  bubble: {
    label: "Bubble Sort",
    description: "Repeatedly compares adjacent elements and swaps them if out of order.",
    complexity: { best: "O(n)", avg: "O(n^2)", worst: "O(n^2)", space: "O(1)" },
  },
  selection: {
    label: "Selection Sort",
    description: "Finds the minimum element and places it at the beginning iteratively.",
    complexity: { best: "O(n^2)", avg: "O(n^2)", worst: "O(n^2)", space: "O(1)" },
  },
  insertion: {
    label: "Insertion Sort",
    description: "Builds the sorted array one item at a time by inserting at the correct position.",
    complexity: { best: "O(n)", avg: "O(n^2)", worst: "O(n^2)", space: "O(1)" },
  },
  merge: {
    label: "Merge Sort",
    description: "Divide and conquer algorithm that recursively splits and merges arrays.",
    complexity: { best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(n)" },
  },
  quick: {
    label: "Quick Sort",
    description: "Divide and conquer using partitioning around a pivot.",
    complexity: { best: "O(n log n)", avg: "O(n log n)", worst: "O(n^2)", space: "O(log n)" },
  },
  linear: {
    label: "Linear Search",
    description: "Sequentially checks each element for the target value.",
    complexity: { best: "O(1)", avg: "O(n)", worst: "O(n)" },
  },
  binary: {
    label: "Binary Search",
    description: "Searches a sorted array by repeatedly dividing the search interval in half.",
    complexity: { best: "O(1)", avg: "O(log n)", worst: "O(log n)" },
  },
  jump: {
    label: "Jump Search",
    description: "Searches in fixed-size jumps, then linearly scans a block.",
    complexity: { best: "O(√n)", avg: "O(√n)", worst: "O(√n)" },
  },
}

export type GenerateOptions = {
  target?: number
  order?: "asc" | "desc"
}

function maybeReverse<T>(arr: T[], order?: "asc" | "desc") {
  return order === "desc" ? arr.slice().reverse() : arr.slice()
}

/* Sorting generators */
function stepsBubble(src: number[], order: "asc" | "desc" = "asc"): StepEvent[] {
  const a = src.slice()
  const steps: StepEvent[] = []
  const n = a.length
  const cmp = (x: number, y: number) => (order === "asc" ? x > y : x < y)
  for (let i = 0; i < n; i++) {
    let swapped = false
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({ type: "compare", indices: [j, j + 1] })
      if (cmp(a[j], a[j + 1])) {
        ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
        steps.push({ type: "swap", indices: [j, j + 1], array: a.slice() })
        swapped = true
      }
    }
    if (!swapped) break
  }
  steps.push({ type: "done", array: a.slice() })
  return steps
}

function stepsSelection(src: number[], order: "asc" | "desc" = "asc"): StepEvent[] {
  const a = src.slice()
  const steps: StepEvent[] = []
  const n = a.length
  const better = (x: number, y: number) => (order === "asc" ? x < y : x > y)
  for (let i = 0; i < n; i++) {
    let best = i
    for (let j = i + 1; j < n; j++) {
      steps.push({ type: "compare", indices: [best, j] })
      if (better(a[j], a[best])) best = j
    }
    if (best !== i) {
      ;[a[i], a[best]] = [a[best], a[i]]
      steps.push({ type: "swap", indices: [i, best], array: a.slice() })
    }
  }
  steps.push({ type: "done", array: a.slice() })
  return steps
}

function stepsInsertion(src: number[], order: "asc" | "desc" = "asc"): StepEvent[] {
  const a = src.slice()
  const steps: StepEvent[] = []
  const n = a.length
  const before = (x: number, y: number) => (order === "asc" ? x > y : x < y)
  for (let i = 1; i < n; i++) {
    const key = a[i]
    let j = i - 1
    while (j >= 0 && before(a[j], key)) {
      steps.push({ type: "compare", indices: [j, j + 1] })
      a[j + 1] = a[j]
      steps.push({ type: "overwrite", index: j + 1, value: a[j + 1], array: a.slice() })
      j--
    }
    a[j + 1] = key
    steps.push({ type: "overwrite", index: j + 1, value: key, array: a.slice() })
  }
  steps.push({ type: "done", array: a.slice() })
  return steps
}

function stepsMerge(src: number[], order: "asc" | "desc" = "asc"): StepEvent[] {
  const a = src.slice()
  const steps: StepEvent[] = []
  const n = a.length
  const goesBefore = (x: number, y: number) => (order === "asc" ? x <= y : x >= y)
  const aux = new Array<number>(n)

  function merge(lo: number, mid: number, hi: number) {
    for (let k = lo; k <= hi; k++) aux[k] = a[k]
    let i = lo
    let j = mid + 1
    for (let k = lo; k <= hi; k++) {
      if (i > mid) a[k] = aux[j++]
      else if (j > hi) a[k] = aux[i++]
      else if (goesBefore(aux[i], aux[j])) a[k] = aux[i++]
      else a[k] = aux[j++]
      // We emit a "merge" event occasionally to keep payload small; snapshot after each placement
      steps.push({ type: "merge", range: [lo, mid, hi], array: a.slice() })
    }
  }

  function sort(lo: number, hi: number) {
    if (lo >= hi) return
    const mid = Math.floor((lo + hi) / 2)
    sort(lo, mid)
    sort(mid + 1, hi)
    merge(lo, mid, hi)
  }

  sort(0, n - 1)
  steps.push({ type: "done", array: a.slice() })
  return steps
}

function stepsQuick(src: number[], order: "asc" | "desc" = "asc"): StepEvent[] {
  const a = src.slice()
  const steps: StepEvent[] = []
  const cmp = (x: number, y: number) => (order === "asc" ? x < y : x > y)

  function partition(lo: number, hi: number): number {
    const pivot = a[hi]
    let i = lo
    for (let j = lo; j < hi; j++) {
      steps.push({ type: "compare", indices: [j, hi] })
      if (cmp(a[j], pivot)) {
        if (i !== j) {
          ;[a[i], a[j]] = [a[j], a[i]]
          steps.push({ type: "swap", indices: [i, j], array: a.slice() })
        }
        i++
      }
    }
    ;[a[i], a[hi]] = [a[hi], a[i]]
    steps.push({ type: "swap", indices: [i, hi], array: a.slice() })
    steps.push({ type: "partition", pivot: i, range: [lo, hi] })
    return i
  }

  function sort(lo: number, hi: number) {
    if (lo >= hi) return
    const p = partition(lo, hi)
    sort(lo, p - 1)
    sort(p + 1, hi)
  }

  sort(0, a.length - 1)
  steps.push({ type: "done", array: a.slice() })
  return steps
}

/* Searching generators */
function stepsLinear(src: number[], target?: number): StepEvent[] {
  const a = src.slice()
  const steps: StepEvent[] = []
  if (target == null) return steps
  for (let i = 0; i < a.length; i++) {
    steps.push({ type: "probe", index: i })
    if (a[i] === target) {
      steps.push({ type: "found", index: i })
      return steps
    }
  }
  steps.push({ type: "not_found" })
  return steps
}

function stepsBinary(src: number[], target?: number): StepEvent[] {
  const a = src.slice()
  const steps: StepEvent[] = []
  if (target == null) return steps
  let lo = 0
  let hi = a.length - 1
  while (lo <= hi) {
    steps.push({ type: "range", range: [lo, hi] })
    const mid = Math.floor((lo + hi) / 2)
    steps.push({ type: "probe", index: mid })
    if (a[mid] === target) {
      steps.push({ type: "found", index: mid })
      return steps
    }
    if (a[mid] < target) lo = mid + 1
    else hi = mid - 1
  }
  steps.push({ type: "not_found" })
  return steps
}

function stepsJump(src: number[], target?: number): StepEvent[] {
  const a = src.slice()
  const steps: StepEvent[] = []
  if (target == null) return steps
  const n = a.length
  const step = Math.max(1, Math.floor(Math.sqrt(n)))
  let start = 0
  let end = Math.min(step, n) - 1

  while (start < n && a[Math.min(end, n - 1)] < target) {
    steps.push({ type: "range", range: [start, Math.min(end, n - 1)] })
    steps.push({ type: "probe", index: Math.min(end, n - 1) })
    start = end + 1
    end = Math.min(start + step - 1, n - 1)
  }

  // linear scan in block
  steps.push({ type: "range", range: [start, Math.min(end, n - 1)] })
  for (let i = start; i <= Math.min(end, n - 1); i++) {
    steps.push({ type: "probe", index: i })
    if (a[i] === target) {
      steps.push({ type: "found", index: i })
      return steps
    }
    if (a[i] > target) break
  }
  steps.push({ type: "not_found" })
  return steps
}

export function generateSteps(
  algorithm: AlgorithmId,
  array: number[],
  options: GenerateOptions = {},
): { steps: StepEvent[] } {
  const order = options.order ?? "asc"
  switch (algorithm) {
    // sorting
    case "bubble":
      return { steps: stepsBubble(array, order) }
    case "selection":
      return { steps: stepsSelection(array, order) }
    case "insertion":
      return { steps: stepsInsertion(array, order) }
    case "merge":
      return { steps: stepsMerge(array, order) }
    case "quick":
      return { steps: stepsQuick(array, order) }
    // searching
    case "linear":
      return { steps: stepsLinear(array, options.target) }
    case "binary":
      return { steps: stepsBinary(array, options.target) }
    case "jump":
      return { steps: stepsJump(array, options.target) }
    default:
      return { steps: [] }
  }
}
