from __future__ import annotations
from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional, Tuple, Union

# Shared schema types for both sorting and searching steps.
# These are serialized to dict via to_dict() to match a JSON-friendly payload.

@dataclass
class StepEvent:
    type: str
    # Optional fields used by different step types
    indices: Optional[List[int]] = None
    index: Optional[int] = None
    array: Optional[List[int]] = None
    value: Optional[int] = None
    pivot: Optional[int] = None
    range: Optional[List[int]] = None  # [lo, hi] or [lo, mid, hi]

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        # prune None to keep payload small
        return {k: v for k, v in d.items() if v is not None}

@dataclass
class Summary:
    comparisons: int = 0
    writes: int = 0
    swaps: int = 0
    foundIndex: Optional[int] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "comparisons": self.comparisons,
            "writes": self.writes,
            "swaps": self.swaps if self.swaps else 0,
            "foundIndex": self.foundIndex if self.foundIndex is not None else None,
        }

def clone_array(a: List[int]) -> List[int]:
    return list(a)

def ensure_order(order: str) -> int:
    # returns multiplier to compare values; 1 for asc, -1 for desc
    if order not in ("asc", "desc"):
        raise ValueError("order must be 'asc' or 'desc'")
    return 1 if order == "asc" else -1
