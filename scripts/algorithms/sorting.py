from __future__ import annotations
from typing import List, Dict, Any, Tuple
from .steps import StepEvent, Summary, clone_array, ensure_order

def bubble_sort_steps(arr: List[int], order: str = "asc") -> Dict[str, Any]:
    a = clone_array(arr)
    n = len(a)
    steps: List[StepEvent] = []
    s = Summary()
    m = ensure_order(order)

    for i in range(n):
        swapped = False
        # after i passes, last i elements are in place
        for j in range(0, n - i - 1):
            s.comparisons += 1
            steps.append(StepEvent(type="compare", indices=[j, j + 1]))
            if (a[j] - a[j + 1]) * m > 0:
                a[j], a[j + 1] = a[j + 1], a[j]
                s.swaps += 1
                s.writes += 2
                steps.append(StepEvent(type="swap", indices=[j, j + 1], array=clone_array(a)))
                swapped = True
        if not swapped:
            break
    steps.append(StepEvent(type="done", array=clone_array(a)))
    return {"steps": [e.to_dict() for e in steps], "summary": s.to_dict()}

def selection_sort_steps(arr: List[int], order: str = "asc") -> Dict[str, Any]:
    a = clone_array(arr)
    n = len(a)
    steps: List[StepEvent] = []
    s = Summary()
    m = ensure_order(order)

    for i in range(n):
        sel = i
        for j in range(i + 1, n):
            s.comparisons += 1
            steps.append(StepEvent(type="compare", indices=[sel, j]))
            if (a[sel] - a[j]) * m > 0:
                sel = j
        if sel != i:
            a[i], a[sel] = a[sel], a[i]
            s.swaps += 1
            s.writes += 2
            steps.append(StepEvent(type="swap", indices=[i, sel], array=clone_array(a)))
    steps.append(StepEvent(type="done", array=clone_array(a)))
    return {"steps": [e.to_dict() for e in steps], "summary": s.to_dict()}

def insertion_sort_steps(arr: List[int], order: str = "asc") -> Dict[str, Any]:
    a = clone_array(arr)
    n = len(a)
    steps: List[StepEvent] = []
    s = Summary()
    m = ensure_order(order)

    for i in range(1, n):
        key = a[i]
        j = i - 1
        # visualize initial probe of key
        steps.append(StepEvent(type="check", index=i))
        while j >= 0:
            s.comparisons += 1
            steps.append(StepEvent(type="compare", indices=[j, j + 1]))
            if (a[j] - key) * m > 0:
                a[j + 1] = a[j]
                s.writes += 1
                steps.append(StepEvent(type="overwrite", index=j + 1, value=a[j + 1], array=clone_array(a)))
                j -= 1
            else:
                break
        a[j + 1] = key
        s.writes += 1
        steps.append(StepEvent(type="overwrite", index=j + 1, value=key, array=clone_array(a)))
    steps.append(StepEvent(type="done", array=clone_array(a)))
    return {"steps": [e.to_dict() for e in steps], "summary": s.to_dict()}

def _merge(a: List[int], l: int, m: int, r: int, mdir: int, steps: List[StepEvent], s: Summary) -> None:
    n1 = m - l + 1
    n2 = r - m
    L = a[l : m + 1]
    R = a[m + 1 : r + 1]
    i = j = 0
    k = l
    steps.append(StepEvent(type="merge", range=[l, m, r], array=None))
    while i < n1 and j < n2:
        s.comparisons += 1
        steps.append(StepEvent(type="compare", indices=[l + i, m + 1 + j]))
        if (L[i] - R[j]) * mdir <= 0:
            a[k] = L[i]
            s.writes += 1
            steps.append(StepEvent(type="overwrite", index=k, value=a[k], array=clone_array(a)))
            i += 1
        else:
            a[k] = R[j]
            s.writes += 1
            steps.append(StepEvent(type="overwrite", index=k, value=a[k], array=clone_array(a)))
            j += 1
        k += 1
    while i < n1:
        a[k] = L[i]
        s.writes += 1
        steps.append(StepEvent(type="overwrite", index=k, value=a[k], array=clone_array(a)))
        i += 1
        k += 1
    while j < n2:
        a[k] = R[j]
        s.writes += 1
        steps.append(StepEvent(type="overwrite", index=k, value=a[k], array=clone_array(a)))
        j += 1
        k += 1

def _merge_sort(a: List[int], l: int, r: int, mdir: int, steps: List[StepEvent], s: Summary) -> None:
    if l >= r:
        return
    mid = (l + r) // 2
    _merge_sort(a, l, mid, mdir, steps, s)
    _merge_sort(a, mid + 1, r, mdir, steps, s)
    _merge(a, l, mid, r, mdir, steps, s)

def merge_sort_steps(arr: List[int], order: str = "asc") -> Dict[str, Any]:
    a = clone_array(arr)
    steps: List[StepEvent] = []
    s = Summary()
    mdir = ensure_order(order)
    _merge_sort(a, 0, len(a) - 1, mdir, steps, s)
    steps.append(StepEvent(type="done", array=clone_array(a)))
    return {"steps": [e.to_dict() for e in steps], "summary": s.to_dict()}

def _partition(a: List[int], lo: int, hi: int, mdir: int, steps: List[StepEvent], s: Summary) -> int:
    pivot = a[hi]
    i = lo - 1
    steps.append(StepEvent(type="partition", pivot=hi, range=[lo, hi]))
    for j in range(lo, hi):
        s.comparisons += 1
        steps.append(StepEvent(type="compare", indices=[j, hi]))
        if (a[j] - pivot) * mdir <= 0:
            i += 1
            if i != j:
                a[i], a[j] = a[j], a[i]
                s.swaps += 1
                s.writes += 2
                steps.append(StepEvent(type="swap", indices=[i, j], array=clone_array(a)))
    if i + 1 != hi:
        a[i + 1], a[hi] = a[hi], a[i + 1]
        s.swaps += 1
        s.writes += 2
        steps.append(StepEvent(type="swap", indices=[i + 1, hi], array=clone_array(a)))
    return i + 1

def _quick_sort(a: List[int], lo: int, hi: int, mdir: int, steps: List[StepEvent], s: Summary) -> None:
    if lo < hi:
        p = _partition(a, lo, hi, mdir, steps, s)
        _quick_sort(a, lo, p - 1, mdir, steps, s)
        _quick_sort(a, p + 1, hi, mdir, steps, s)

def quick_sort_steps(arr: List[int], order: str = "asc") -> Dict[str, Any]:
    a = clone_array(arr)
    steps: List[StepEvent] = []
    s = Summary()
    mdir = ensure_order(order)
    _quick_sort(a, 0, len(a) - 1, mdir, steps, s)
    steps.append(StepEvent(type="done", array=clone_array(a)))
    return {"steps": [e.to_dict() for e in steps], "summary": s.to_dict()}
