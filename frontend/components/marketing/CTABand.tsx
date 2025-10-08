export default function CTABand() {
  return (
    <section id="demo" className="bg-[var(--vb-accent)] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Ready to Transform Your Construction Workflow?
          </h2>
          <p className="mt-4 text-lg leading-8 text-white/90">
            See how VeriBuild can streamline your projects and empower your teams.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-medium
                         bg-white text-[var(--vb-accent)]
                         shadow-[var(--vb-shadow-lg)] ring-1 ring-black/5 transition-all duration-150
                         hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(2,6,23,0.3)]
                         active:translate-y-0 active:shadow-[var(--vb-shadow-md)]
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--vb-accent)]"
            >
              Get a demo
            </a>
            <a
              href="#contact-sales"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-medium
                         bg-transparent text-white
                         shadow-[var(--vb-shadow-sm)] ring-2 ring-white/40 transition-all duration-150
                         hover:shadow-[var(--vb-shadow-md)] hover:bg-white/10 hover:ring-white/60
                         active:shadow-[var(--vb-shadow-sm)]
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--vb-accent)]"
            >
              Contact sales
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
