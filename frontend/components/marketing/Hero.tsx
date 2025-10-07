import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[var(--vb-neutral-50)] to-white py-20 sm:py-28">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg
          className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-gray-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]"
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
          <h1 className="text-4xl font-bold tracking-tight text-[var(--vb-neutral-900)] sm:text-6xl">
            AI Agents for Construction—Drawings, RFIs, Inventory, and Field Ops in One Place
          </h1>
          <p className="mt-6 text-lg leading-8 text-[var(--vb-neutral-600)]">
            Centralize your drawings and documentation. Automate RFIs and submittals. Track BOMs and deliveries. Empower your field teams with natural-language agents that understand your projects.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg"
              className="bg-[var(--vb-accent)] hover:bg-[var(--vb-accent)]/90 text-white text-base px-8"
              asChild
            >
              <a href="#demo">Get a demo</a>
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-base px-8 border-[var(--vb-neutral-600)] text-[var(--vb-neutral-600)] hover:bg-gray-50"
              asChild
            >
              <a href="#overview" className="flex items-center justify-center gap-2">
                <Play className="h-4 w-4" />
                Watch overview
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-16 flow-root sm:mt-24">
          <div className="relative -m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
            <img
              src="/images/product-hero.png"
              alt="VeriBuild Platform Interface"
              className="rounded-md shadow-2xl ring-1 ring-gray-900/10"
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
