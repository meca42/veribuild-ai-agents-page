import { Play } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg
          className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-[var(--vb-gray-200)] dark:stroke-white/5 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="hero-pattern"
              width={200}
              height={200}
              x="50%"
              y={-1}
              patternUnits="userSpaceOnUse"
            >
              <path d="M100 200V.5M.5 .5H200" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" strokeWidth={0} fill="url(#hero-pattern)" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--vb-gray-800)] dark:text-white sm:text-5xl md:text-6xl">
            Build AI-powered construction workflows with VeriBuild
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-[var(--vb-gray-600)] dark:text-slate-300">
            Centralize drawings, documents, and agents—designed for speed and clarity. Automate RFIs, track materials, and empower field teams.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-medium text-white bg-[var(--vb-accent)]
                         shadow-[var(--vb-shadow-lg)] ring-1 ring-black/5 transition-all duration-150
                         hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(2,6,23,0.18)]
                         active:translate-y-0 active:shadow-[var(--vb-shadow-md)]
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vb-accent)] focus-visible:ring-offset-2"
            >
              Get started
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-medium gap-2
                         bg-white dark:bg-white/5 text-[var(--vb-gray-800)] dark:text-white
                         shadow-[var(--vb-shadow-sm)] ring-1 ring-black/5 dark:ring-white/10
                         transition-all duration-150
                         hover:shadow-[var(--vb-shadow-md)] hover:bg-[var(--vb-gray-100)] dark:hover:bg-white/10
                         active:shadow-[var(--vb-shadow-sm)]
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vb-accent)] focus-visible:ring-offset-2"
            >
              <Play className="h-4 w-4" />
              See features
            </a>
          </div>
        </div>

        <div className="mt-16 flow-root sm:mt-24">
          <div className="relative -m-2 rounded-xl bg-white/60 dark:bg-white/5 p-2 ring-1 ring-inset ring-slate-200/60 dark:ring-white/10 backdrop-blur-sm lg:-m-4 lg:rounded-2xl lg:p-4 shadow-[var(--vb-shadow-md)]">
            <img
              src="/images/product-hero.png"
              alt="VeriBuild Platform Interface"
              className="rounded-md shadow-2xl ring-1 ring-slate-200/60 dark:ring-white/10"
              loading="eager"
              width={2432}
              height={1442}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
