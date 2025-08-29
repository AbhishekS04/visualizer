export default function AboutPage() {
  const teammates = ["Member One", "Member Two", "Member Three", "Member Four", "Member Five"]
  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-200">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-semibold mb-6">About This Project</h1>
        <div className="rounded-2xl border border-neutral-800 bg-white/5 backdrop-blur-xl p-6">
          <p className="text-neutral-300 mb-6">
            This is a template page. Replace the placeholders below with your team information, roles, links, and
            credits.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {teammates.map((name, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-neutral-800 bg-white/10 backdrop-blur-md p-4 hover:bg-white/15 transition-colors"
              >
                <span className="block text-lg font-semibold text-white">{name}</span>
                <p className="text-sm text-neutral-300 mb-3">Role: TBD</p>
                <div className="flex items-center gap-3">
                  <a href="#" className="text-cyan-400 hover:text-cyan-300 text-sm underline underline-offset-4">
                    GitHub
                  </a>
                  <a href="#" className="text-emerald-400 hover:text-emerald-300 text-sm underline underline-offset-4">
                    LinkedIn
                  </a>
                  <a href="#" className="text-amber-400 hover:text-amber-300 text-sm underline underline-offset-4">
                    Twitter
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-neutral-800 bg-white/10 backdrop-blur-md p-4">
            <h2 className="text-xl font-semibold text-white mb-2">Project Overview</h2>
            <p className="text-neutral-300">
              Briefly describe your goals, the algorithms covered, and any acknowledgements. You can also add links to
              your repository and demo here.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
