try:
    from .sorting import (
        bubble_sort_steps,
        selection_sort_steps,
        insertion_sort_steps,
        merge_sort_steps,
        quick_sort_steps,
    )
    from .searching import (
        linear_search_steps,
        binary_search_steps,
        jump_search_steps,
    )
except Exception:
    # Fallback if executed differently
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


def main():
    print("[algorithms] Running minimal self-tests...")
    # Basic smoke checks to ensure functions execute and return step structures
    bubble_sort_steps([3, 1, 2], order="asc")
    selection_sort_steps([3, 1, 2], order="asc")
    insertion_sort_steps([3, 1, 2], order="asc")
    merge_sort_steps([3, 1, 2], order="asc")
    quick_sort_steps([3, 1, 2], order="asc")

    linear_search_steps([1, 3, 2], 3)
    binary_search_steps([1, 2, 3, 4, 5], 4)
    jump_search_steps([1, 2, 3, 4, 5], 4)
    print("[algorithms] OK")


if __name__ == "__main__":
    main()
