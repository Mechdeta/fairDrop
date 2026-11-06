const principles = [
  {
    number: "01",
    title: "Verify the person",
    description:
      "Attendees will prove unique-human eligibility through the official World ID flow.",
  },
  {
    number: "02",
    title: "Protect each event",
    description:
      "A verified participant gets one claim per event, enforced by the FairDrop backend.",
  },
  {
    number: "03",
    title: "Make the result clear",
    description:
      "The attendee sees whether verification and registration succeeded or why they were rejected.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-10">
      <header className="flex items-center justify-between border-b border-white/10 pb-6">
        <a href="/" className="flex items-center gap-3" aria-label="FairDrop home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500 text-lg font-black text-white">
            F
          </span>
          <span className="text-lg font-semibold tracking-tight">FairDrop</span>
        </a>
        <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-xs font-medium text-violet-200">
          World-first MVP
        </span>
      </header>

      <section className="grid flex-1 items-center gap-14 py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-violet-300">
            The bot-proof ticket marketplace
          </p>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
            A fairer shot at the tickets you{" "}
            <span className="text-violet-300">actually want.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">
            FairDrop is building a more accountable way to distribute limited
            event tickets. We are starting with unique-human verification and
            one claim per person, per event.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <span className="rounded-xl bg-violet-400 px-5 py-3 text-sm font-semibold text-slate-950">
              World verification — coming in Phase 1
            </span>
            <span className="rounded-xl border border-white/15 px-5 py-3 text-sm text-slate-200">
              Demo scaffold
            </span>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            World ID is not connected yet. No verification or ticket claim is
            performed by this scaffold.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-violet-950/20 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Phase 1 build status</p>
              <h2 className="mt-1 text-2xl font-semibold">World-first flow</h2>
            </div>
            <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs text-amber-200">
              In progress
            </span>
          </div>
          <div className="mt-8 space-y-5">
            {principles.map((item) => (
              <div key={item.number} className="flex gap-4">
                <span className="pt-0.5 text-sm font-semibold text-violet-300">
                  {item.number}
                </span>
                <div>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Next milestone</span>
              <span className="font-medium text-violet-200">Proof verification</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/4 rounded-full bg-violet-400" />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Project foundation only — integration work has not started.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-5 text-xs text-slate-500">
        FairDrop · ETHGlobal Mumbai 2026 · Built in phases, with people first.
      </footer>
    </main>
  );
}
