from __future__ import annotations
import random
from typing import List, Callable, Dict, Any
try:
    from .algorithms.sorting import (
        bubble_sort_steps,
        selection_sort_steps,
        insertion_sort_steps,
        merge_sort_steps,
        quick_sort_steps,
    )
    from .algorithms.searching import (
        linear_search_steps,
        binary_search_steps,
        jump_search_steps,
    )
except Exception:
    from scripts.algorithms.sorting import (
        bubble_sort_steps,
        selection_sort_steps,
        insertion_sort_steps,
        merge_sort_steps,
        quick_sort_steps,
    )
    from scripts.algorithms.searching import (
        linear_search_steps,
        binary_search_steps,
        jump_search_steps,
    )

def simulate_last_array(steps: List[Dict[str, Any]], initial: List[int]) -> List[int]:
    # Reconstruct array state by applying steps that include "array"
    a = list(initial)
    for e in steps:
        arr = e.get("array")
        if arr is not None:
            a = list(arr)
    return a

def test_sort_algo(name: str, fn: Callable, trials: int = 50) -> None:
    for _ in range(trials):
        n = random.randint(0, 50)
        a = [random.randint(-1000, 1000) for _ in range(n)]
        order = random.choice(["asc", "desc"])
        res = fn(a, order=order)
        steps = res["steps"]
        final_arr = simulate_last_array(steps, a)
        assert final_arr == sorted(a, reverse=(order=="desc")), f"{name} failed: {a} -> {final_arr}"
    print(f"[OK] {name} passed {trials} trials")

def test_search_algo(name: str, fn: Callable, must_sort: bool, trials: int = 50) -> None:
    for _ in range(trials):
        n = random.randint(0, 80)
        a = [random.randint(-200, 200) for _ in range(n)]
        a_sorted = sorted(a)
        target_pool = a_sorted if (len(a_sorted) > 0) else [0]
        target = random.choice(target_pool) if random.random() < 0.5 else random.randint(-200, 200)

        search_array = a_sorted if must_sort else a
        res = fn(search_array, target)
        steps = res["steps"]
        found_index = res["summary"].get("foundIndex", None)

        # Compute the expected index in the exact array we searched
        try:
            expected_index = search_array.index(target)
        except ValueError:
            expected_index = None

        if expected_index is None:
            if found_index is not None:
                raise AssertionError(f"{name} incorrectly found index for {target} in {search_array}")
        else:
            if found_index is None:
                raise AssertionError(f"{name} failed to find {target} in {search_array}")
            # Bounds and value check
            if not (0 <= found_index < len(search_array)):
                raise AssertionError(f"{name} returned out-of-bounds index {found_index} for {search_array}")
            if search_array[found_index] != target:
                raise AssertionError(f"{name} found wrong index: expected value {target} at {expected_index}, got {found_index}")
    print(f"[OK] {name} passed {trials} trials")

def main():
    random.seed(42)
    # Sorting tests
    test_sort_algo("bubble_sort_steps", bubble_sort_steps)
    test_sort_algo("selection_sort_steps", selection_sort_steps)
    test_sort_algo("insertion_sort_steps", insertion_sort_steps)
    test_sort_algo("merge_sort_steps", merge_sort_steps)
    test_sort_algo("quick_sort_steps", quick_sort_steps)
    # Searching tests
    test_search_algo("linear_search_steps", linear_search_steps, must_sort=False)
    test_search_algo("binary_search_steps", binary_search_steps, must_sort=True)
    test_search_algo("jump_search_steps", jump_search_steps, must_sort=True)

if __name__ == "__main__":
    # The execution environment captures prints as logs.
    main()
    print("[DONE] All algorithm validations completed successfully.")
