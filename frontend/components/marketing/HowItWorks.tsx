import { Database, Settings, Zap } from "lucide-react";

const steps = [
  {
    name: "Centralize",
    description: "Connect your storage, import drawings, specs, and BOMs. Set up projects and phases in minutes.",
    icon: Database,
  },
  {
    name: "Configure Agents",
    description: "Enable tools like search drawings, create RFI, query inventory. Define policies and permissions.",
    icon: Settings,
  },
  {
    name: "Execute",
    description: "Field teams use natural language. Agents return citations, drafts, and actions instantly.",
    icon: Zap,
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--vb-neutral-900)] sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg leading-8 text-[var(--vb-neutral-600)]">
            Get up and running in three simple steps
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.name} className="relative flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--vb-accent)] text-white text-2xl font-bold mb-4">
                  {index + 1}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--vb-primary)] mb-4">
                  <step.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--vb-neutral-900)] mb-2">
                  {step.name}
                </h3>
                <p className="text-base text-[var(--vb-neutral-600)]">
                  {step.description}
                </p>
                {index < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-8 left-[calc(50%+4rem)] w-[calc(100%-8rem)] h-0.5 bg-gray-200" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
