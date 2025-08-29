import type { StepEvent } from "./algorithms"

export function bubbleSteps(arr: number[]): StepEvent[] {
  const steps: StepEvent[] = []
  let n = arr.length
  let swapped = true
  while (swapped) {
    swapped = false
    for (let i = 1; i < n; i++) {
      steps.push({ type: "compare", indices: [i - 1, i] })
      if (arr[i - 1] > arr[i]) {
        ;[arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]
        steps.push({ type: "swap", indices: [i - 1, i], array: arr.slice() })
        swapped = true
      }
    }
    n--
  }
  steps.push({ type: "done", array: arr.slice() })
  return steps
}

export function selectionSteps(arr: number[]): StepEvent[] {
  const steps: StepEvent[] = []
  const n = arr.length
  for (let i = 0; i < n - 1; i++) {
    let min = i
    for (let j = i + 1; j < n; j++) {
      steps.push({ type: "compare", indices: [min, j] })
      if (arr[j] < arr[min]) min = j
    }
    if (min !== i) {
      ;[arr[i], arr[min]] = [arr[min], arr[i]]
      steps.push({ type: "swap", indices: [i, min], array: arr.slice() })
    }
  }
  steps.push({ type: "done", array: arr.slice() })
  return steps
}

export function insertionSteps(arr: number[]): StepEvent[] {
  const steps: StepEvent[] = []
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i]
    let j = i - 1
    while (j >= 0 && arr[j] > key) {
      steps.push({ type: "compare", indices: [j, j + 1] })
      arr[j + 1] = arr[j]
      steps.push({ type: "overwrite", index: j + 1, value: arr[j + 1], array: arr.slice() })
      j--
    }
    arr[j + 1] = key
    steps.push({ type: "overwrite", index: j + 1, value: key, array: arr.slice() })
  }
  steps.push({ type: "done", array: arr.slice() })
  return steps
}

export function mergeSteps(arr: number[]): StepEvent[] {
  const steps: StepEvent[] = []
  const aux = arr.slice()

  function merge(lo: number, mid: number, hi: number) {
    for (let k = lo; k <= hi; k++) aux[k] = arr[k]
    let i = lo,
      j = mid + 1
    for (let k = lo; k <= hi; k++) {
      if (i > mid) arr[k] = aux[j++]
      else if (j > hi) arr[k] = aux[i++]
      else if (aux[j] < aux[i]) {
        steps.push({ type: "compare", indices: [i, j] })
        arr[k] = aux[j++]
      } else {
        steps.push({ type: "compare", indices: [i, j] })
        arr[k] = aux[i++]
      }
      steps.push({ type: "merge", range: [lo, mid, hi], array: arr.slice() })
    }
  }

  function sort(lo: number, hi: number) {
    if (hi <= lo) return
    const mid = Math.floor(lo + (hi - lo) / 2)
    sort(lo, mid)
    sort(mid + 1, hi)
    merge(lo, mid, hi)
  }

  sort(0, arr.length - 1)
  steps.push({ type: "done", array: arr.slice() })
  return steps
}

export function quickSteps(arr: number[]): StepEvent[] {
  const steps: StepEvent[] = []

  function partition(lo: number, hi: number) {
    const pivot = arr[hi]
    let i = lo
    for (let j = lo; j < hi; j++) {
      steps.push({ type: "compare", indices: [j, hi] })
      if (arr[j] < pivot) {
        if (i !== j) {
          ;[arr[i], arr[j]] = [arr[j], arr[i]]
          steps.push({ type: "swap", indices: [i, j], array: arr.slice() })
        }
        i++
      }
    }
    ;[arr[i], arr[hi]] = [arr[hi], arr[i]]
    steps.push({ type: "swap", indices: [i, hi], array: arr.slice() })
    return i
  }

  function sort(lo: number, hi: number) {
    if (lo >= hi) return
    steps.push({ type: "partition", pivot: hi, range: [lo, hi] })
    const p = partition(lo, hi)
    sort(lo, p - 1)
    sort(p + 1, hi)
  }

  sort(0, arr.length - 1)
  steps.push({ type: "done", array: arr.slice() })
  return steps
}

export function linearSteps(arr: number[], target: number): StepEvent[] {
  const steps: StepEvent[] = []
  for (let i = 0; i < arr.length; i++) {
    steps.push({ type: "probe", index: i })
    if (arr[i] === target) {
      steps.push({ type: "found", index: i })
      return steps
    }
  }
  steps.push({ type: "not_found" })
  return steps
}

export function binarySteps(arr: number[], target: number): StepEvent[] {
  const steps: StepEvent[] = []
  let lo = 0,
    hi = arr.length - 1
  while (lo <= hi) {
    steps.push({ type: "range", range: [lo, hi] })
    const mid = Math.floor((lo + hi) / 2)
    steps.push({ type: "probe", index: mid })
    if (arr[mid] === target) {
      steps.push({ type: "found", index: mid })
      return steps
    } else if (arr[mid] < target) {
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  steps.push({ type: "not_found" })
  return steps
}

export function jumpSteps(arr: number[], target: number): StepEvent[] {
  const steps: StepEvent[] = []
  const n = arr.length
  const step = Math.max(1, Math.floor(Math.sqrt(n)))
  let prev = 0
  let curr = 0
  while (curr < n && arr[curr] < target) {
    steps.push({ type: "range", range: [curr, Math.min(curr + step - 1, n - 1)] })
    prev = curr
    curr = Math.min(n - 1, curr + step)
  }
  steps.push({ type: "range", range: [prev, curr] })
  for (let i = prev; i <= curr; i++) {
    steps.push({ type: "probe", index: i })
    if (arr[i] === target) {
      steps.push({ type: "found", index: i })
      return steps
    }
  }
  steps.push({ type: "not_found" })
  return steps
}
