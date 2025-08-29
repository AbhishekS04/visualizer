from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Literal, Optional, Union, Tuple

Algorithm = Literal["bubble","selection","insertion","merge","quick","linear","binary","jump"]

class Options(BaseModel):
    target: Optional[int] = None
    order: Literal["asc","desc"] = "asc"

class RequestBody(BaseModel):
    algorithm: Algorithm
    array: List[int] = Field(min_length=5, max_length=256)
    options: Optional[Options] = None

# Step events
class Compare(BaseModel):
    type: Literal["compare"]
    indices: Tuple[int,int]

class Swap(BaseModel):
    type: Literal["swap"]
    indices: Tuple[int,int]
    array: List[int]

class Overwrite(BaseModel):
    type: Literal["overwrite"]
    index: int
    value: int
    array: List[int]

class Partition(BaseModel):
    type: Literal["partition"]
    pivot: int
    range: Tuple[int,int]

class Merge(BaseModel):
    type: Literal["merge"]
    range: Tuple[int,int,int]
    array: List[int]

class Done(BaseModel):
    type: Literal["done"]
    array: List[int]

class Probe(BaseModel):
    type: Literal["probe"]
    index: int

class Check(BaseModel):
    type: Literal["check"]
    index: int

class Range(BaseModel):
    type: Literal["range"]
    range: Tuple[int,int]

class Found(BaseModel):
    type: Literal["found"]
    index: int

class NotFound(BaseModel):
    type: Literal["not_found"]

StepEvent = Union[Compare, Swap, Overwrite, Partition, Merge, Done, Probe, Check, Range, Found, NotFound]

app = FastAPI()

def bubble_steps(a: List[int]) -> List[StepEvent]:
    arr = a[:]
    steps: List[StepEvent] = []
    n = len(arr)
    swapped = True
    while swapped:
        swapped = False
        for i in range(1, n):
            steps.append(Compare(type="compare", indices=(i-1, i)))
            if arr[i-1] > arr[i]:
                arr[i-1], arr[i] = arr[i], arr[i-1]
                steps.append(Swap(type="swap", indices=(i-1, i), array=arr[:]))
                swapped = True
        n -= 1
    steps.append(Done(type="done", array=arr[:]))
    return steps

def selection_steps(a: List[int]) -> List[StepEvent]:
    arr = a[:]
    steps: List[StepEvent] = []
    n = len(arr)
    for i in range(n-1):
        m = i
        for j in range(i+1, n):
            steps.append(Compare(type="compare", indices=(m, j)))
            if arr[j] < arr[m]:
                m = j
        if m != i:
            arr[i], arr[m] = arr[m], arr[i]
            steps.append(Swap(type="swap", indices=(i, m), array=arr[:]))
    steps.append(Done(type="done", array=arr[:]))
    return steps

def insertion_steps(a: List[int]) -> List[StepEvent]:
    arr = a[:]
    steps: List[StepEvent] = []
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            steps.append(Compare(type="compare", indices=(j, j+1)))
            arr[j+1] = arr[j]
            steps.append(Overwrite(type="overwrite", index=j+1, value=arr[j+1], array=arr[:]))
            j -= 1
        arr[j+1] = key
        steps.append(Overwrite(type="overwrite", index=j+1, value=key, array=arr[:]))
    steps.append(Done(type="done", array=arr[:]))
    return steps

def merge_steps(a: List[int]) -> List[StepEvent]:
    arr = a[:]
    aux = arr[:]
    steps: List[StepEvent] = []

    def merge(lo: int, mid: int, hi: int):
        for k in range(lo, hi+1):
            aux[k] = arr[k]
        i, j = lo, mid + 1
        for k in range(lo, hi+1):
            if i > mid:
                arr[k] = aux[j]; j += 1
            elif j > hi:
                arr[k] = aux[i]; i += 1
            elif aux[j] < aux[i]:
                steps.append(Compare(type="compare", indices=(i, j)))
                arr[k] = aux[j]; j += 1
            else:
                steps.append(Compare(type="compare", indices=(i, j)))
                arr[k] = aux[i]; i += 1
            steps.append(Merge(type="merge", range=(lo, mid, hi), array=arr[:]))

    def sort(lo: int, hi: int):
        if hi <= lo: return
        mid = (lo + hi) // 2
        sort(lo, mid)
        sort(mid+1, hi)
        merge(lo, mid, hi)

    sort(0, len(arr)-1)
    steps.append(Done(type="done", array=arr[:]))
    return steps

def quick_steps(a: List[int]) -> List[StepEvent]:
    arr = a[:]
    steps: List[StepEvent] = []

    def partition(lo: int, hi: int) -> int:
        pivot = arr[hi]
        i = lo
        for j in range(lo, hi):
            steps.append(Compare(type="compare", indices=(j, hi)))
            if arr[j] < pivot:
                if i != j:
                    arr[i], arr[j] = arr[j], arr[i]
                    steps.append(Swap(type="swap", indices=(i, j), array=arr[:]))
                i += 1
        arr[i], arr[hi] = arr[hi], arr[i]
        steps.append(Swap(type="swap", indices=(i, hi), array=arr[:]))
        return i

    def sort(lo: int, hi: int):
        if lo >= hi: return
        steps.append(Partition(type="partition", pivot=hi, range=(lo, hi)))
        p = partition(lo, hi)
        sort(lo, p-1)
        sort(p+1, hi)

    sort(0, len(arr)-1)
    steps.append(Done(type="done", array=arr[:]))
    return steps

def linear_steps(a: List[int], target: int) -> List[StepEvent]:
    steps: List[StepEvent] = []
    for i, v in enumerate(a):
        steps.append(Probe(type="probe", index=i))
        if v == target:
            steps.append(Found(type="found", index=i))
            return steps
    steps.append(NotFound(type="not_found"))
    return steps

def binary_steps(a: List[int], target: int) -> List[StepEvent]:
    steps: List[StepEvent] = []
    arr = sorted(a)
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        steps.append(Range(type="range", range=(lo, hi)))
        mid = (lo + hi) // 2
        steps.append(Probe(type="probe", index=mid))
        if arr[mid] == target:
            steps.append(Found(type="found", index=mid))
            return steps
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    steps.append(NotFound(type="not_found"))
    return steps

def jump_steps(a: List[int], target: int) -> List[StepEvent]:
    import math
    steps: List[StepEvent] = []
    arr = sorted(a)
    n = len(arr)
    step = max(1, int(math.sqrt(n)))
    prev = 0
    curr = 0
    while curr < n and arr[curr] < target:
        steps.append(Range(type="range", range=(curr, min(curr+step-1, n-1))))
        prev = curr
        curr = min(n - 1, curr + step)
    steps.append(Range(type="range", range=(prev, curr)))
    for i in range(prev, curr+1):
        steps.append(Probe(type="probe", index=i))
        if arr[i] == target:
            steps.append(Found(type="found", index=i))
            return steps
    steps.append(NotFound(type="not_found"))
    return steps

@app.post("/api/steps")
def get_steps(body: RequestBody):
    arr = body.array
    if any((not isinstance(x, int)) for x in arr):
        raise HTTPException(status_code=400, detail="Array must contain integers")
    algo = body.algorithm
    steps: List[StepEvent]
    if algo == "bubble":
        steps = bubble_steps(arr)
    elif algo == "selection":
        steps = selection_steps(arr)
    elif algo == "insertion":
        steps = insertion_steps(arr)
    elif algo == "merge":
        steps = merge_steps(arr)
    elif algo == "quick":
        steps = quick_steps(arr)
    elif algo == "linear":
        steps = linear_steps(arr, (body.options or Options()).target or 0)
    elif algo == "binary":
        steps = binary_steps(arr, (body.options or Options()).target or 0)
    elif algo == "jump":
        steps = jump_steps(arr, (body.options or Options()).target or 0)
    else:
        raise HTTPException(status_code=400, detail="Unknown algorithm")
    summary = {
        "comparisons": len([s for s in steps if s.__dict__.get("type") in ("compare","probe","check")]),
        "writes": len([s for s in steps if s.__dict__.get("type") in ("swap","overwrite","merge")]),
        "foundIndex": next((s.index for s in reversed(steps) if getattr(s, "type", "") == "found"), None)
    }
    return {"steps": [s.__dict__ for s in steps], "summary": summary}
