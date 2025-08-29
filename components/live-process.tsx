"use client"

type LiveProcessProps = {
  title?: string
  current?: string | null
  all?: string[]
}

export function LiveProcess({ title = "Live Process", current, all = [] }: LiveProcessProps) {
  return (
    <section className="mt-4 w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-md p-4 text-slate-300">
      <header className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
        <span className="text-xs text-slate-400">{all.length} steps</span>
      </header>

      <div className="mb-3 rounded-md bg-white/10 p-3">
        <div className="text-xs uppercase tracking-wide text-slate-400">Current</div>
        <p className="mt-1 text-sm text-slate-100 min-h-5">{current || "—"}</p>
      </div>

      <div className="max-h-48 overflow-auto rounded-md border border-white/10">
        <ul className="divide-y divide-white/10">
          {all.length === 0 ? (
            <li className="p-3 text-sm text-slate-400">No steps yet.</li>
          ) : (
            all.map((s, i) => (
              <li key={i} className="p-3 text-sm text-slate-300">
                <span className="mr-2 text-xs text-slate-500">#{i + 1}</span>
                {s}
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  )
}
