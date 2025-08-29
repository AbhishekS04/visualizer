"use client"

type Props = {
  current: string
  history: string[]
  allSteps?: string[] // optional full list of step descriptions
}

export function StepLog({ current, history, allSteps = [] }: Props) {
  return (
    <aside className="w-full bg-neutral-900/80 backdrop-blur rounded-md p-4 border border-neutral-800">
      {/* Live step */}
      <h3 className="text-sm text-neutral-400 mb-2">Live Step</h3>
      <p className="text-neutral-100 font-medium mb-3">{current || "Idle"}</p>

      <div className="h-px bg-neutral-800 my-3" />

      {/* Recent steps (what has actually run) */}
      <h4 className="text-xs text-neutral-400 mb-2">Recent Steps</h4>
      <ul className="space-y-1 max-h-48 overflow-auto pr-1">
        {history
          .slice(-50)
          .reverse()
          .map((s, idx) => (
            <li key={idx} className="text-xs text-neutral-300">
              {s}
            </li>
          ))}
      </ul>

      {/* Full step list (precomputed) */}
      {allSteps.length > 0 && (
        <>
          <div className="h-px bg-neutral-800 my-3" />
          <h4 className="text-xs text-neutral-400 mb-2">All Steps ({allSteps.length})</h4>
          <ol className="list-decimal list-inside space-y-1 max-h-48 overflow-auto pr-1">
            {allSteps.map((s, i) => (
              <li key={i} className="text-xs text-neutral-300">
                {s}
              </li>
            ))}
          </ol>
        </>
      )}
    </aside>
  )
}

export default StepLog
