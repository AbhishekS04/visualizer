from __future__ import annotations
from typing import List, Dict, Any, Optional
from .steps import StepEvent, Summary

def linear_search_steps(arr: List[int], target: int) -> Dict[str, Any]:
    steps: List[StepEvent] = []
    s = Summary()
    for i, v in enumerate(arr):
        s.comparisons += 1
        steps.append(StepEvent(type="probe", index=i))
        if v == target:
            s.foundIndex = i
            steps.append(StepEvent(type="found", index=i))
            return {"steps": [e.to_dict() for e in steps], "summary": s.to_dict()}
    steps.append(StepEvent(type="not_found"))
    s.foundIndex = None
    return {"steps": [e.to_dict() for e in steps], "summary": s.to_dict()}

def binary_search_steps(arr: List[int], target: int, must_be_sorted: bool = True) -> Dict[str, Any]:
    # For correctness, we require a sorted array by default.
    a = list(arr)
    if not must_be_sorted:
        a = sorted(a)
    steps: List[StepEvent] = []
    s = Summary()
    lo, hi = 0, len(a) - 1
    if hi >= 0:
        steps.append(StepEvent(type="range", range=[lo, hi]))
    while lo <= hi:
        mid = (lo + hi) // 2
        steps.append(StepEvent(type="probe", index=mid))
        s.comparisons += 1
        if a[mid] == target:
            s.foundIndex = mid
            steps.append(StepEvent(type="found", index=mid))
            return {"steps": [e.to_dict() for e in steps], "summary": s.to_dict()}
        elif a[mid] < target:
            lo = mid + 1
            if lo <= hi:
                steps.append(StepEvent(type="range", range=[lo, hi]))
        else:
            hi = mid - 1
            if lo <= hi:
                steps.append(StepEvent(type="range", range=[lo, hi]))
    steps.append(StepEvent(type="not_found"))
    s.foundIndex = None
    return {"steps": [e.to_dict() for e in steps], "summary": s.to_dict()}

def jump_search_steps(arr: List[int], target: int) -> Dict[str, Any]:
    # Requires sorted array
    from math import sqrt
    a = list(arr)
    steps: List[StepEvent] = []
    s = Summary()
    n = len(a)
    if n == 0:
        steps.append(StepEvent(type="not_found"))
        return {"steps": [e.to_dict() for e in steps], "summary": s.to_dict()}
    step = int(sqrt(n)) or 1
    prev = 0
    idx = min(step, n) - 1
    # jump in blocks
    while idx < n and a[idx] < target:
        s.comparisons += 1
        steps.append(StepEvent(type="probe", index=idx))
        prev = idx + 1
        idx = min(prev + step - 1, n - 1)
        if prev < n:
            steps.append(StepEvent(type="range", range=[prev, idx]))
        else:
            break
    # linear search in the identified block
    for i in range(prev, min(idx + 1, n)):
        s.comparisons += 1
        steps.append(StepEvent(type="probe", index=i))
        if a[i] == target:
            s.foundIndex = i
            steps.append(StepEvent(type="found", index=i))
            return {"steps": [e.to_dict() for e in steps], "summary": s.to_dict()}
    steps.append(StepEvent(type="not_found"))
    s.foundIndex = None
    return {"steps": [e.to_dict() for e in steps], "summary": s.to_dict()}
