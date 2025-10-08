import { FileText, Bot, ListChecks, Package } from "lucide-react";

const features = [
  {
    name: "Drawings & Documents",
    description: "Versioned PDFs, IFC models, as-builts, and discipline-specific filters for instant reference at every step.",
    icon: FileText,
    kicker: "Document Management",
    capabilities: [
      "Version control for all drawing revisions",
      "IFC and as-built model support",
      "Discipline-specific filtering and search",
    ],
  },
  {
    name: "AI Agents",
    description: "Tool-calling agents that search drawings, answer spec questions, draft RFIs and submittals, and query inventory in natural language.",
    icon: Bot,
    kicker: "Intelligent Automation",
    capabilities: [
      "Natural language queries across all documents",
      "Automated RFI and submittal generation",
      "Real-time inventory and materials queries",
    ],
  },
  {
    name: "Phases & Steps",
    description: "Simple project-to-phase-to-step execution with assignments, checklists, and contextual references.",
    icon: ListChecks,
    kicker: "Project Planning",
    capabilities: [
      "Hierarchical project and phase organization",
      "Step-level assignments and checklists",
      "Reference links to drawings and specs",
    ],
  },
  {
    name: "Materials & Inventory",
    description: "BOM ingestion, delivery logging from photos, lot counts by zone—query \"Do we have part X?\" instantly.",
    icon: Package,
    kicker: "Supply Chain",
    capabilities: [
      "Automated BOM import and tracking",
      "Photo-based delivery logging",
      "Real-time lot counts and zone-based inventory",
    ],
  },
];

export default function FeatureCards() {
  return (
    <section id="features" className="bg-white/90 dark:bg-black/30 backdrop-blur supports-[backdrop-filter]:backdrop-blur py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--vb-gray-800)] dark:text-white sm:text-4xl">
            Everything your team needs to build faster
          </h2>
          <p className="mt-4 text-lg leading-8 text-[var(--vb-gray-600)] dark:text-slate-300">
            Centralize information, automate workflows, and empower every role on your project.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2 lg:max-w-none lg:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="rounded-2xl bg-white dark:bg-white/5 p-6 border border-slate-200/60 dark:border-white/10
                         shadow-[var(--vb-shadow-sm)] hover:shadow-[var(--vb-shadow-md)]
                         transition-all duration-150 will-change-transform hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--vb-accent)]/10 dark:bg-[var(--vb-accent)]/20 ring-1 ring-[var(--vb-accent)]/20">
                  <feature.icon className="h-6 w-6 text-[var(--vb-accent)]" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-[var(--vb-accent)] uppercase tracking-wide">
                    {feature.kicker}
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--vb-gray-800)] dark:text-white mt-0.5">
                    {feature.name}
                  </h3>
                </div>
              </div>
              <p className="text-base leading-7 text-[var(--vb-gray-600)] dark:text-slate-300 mb-4">
                {feature.description}
              </p>
              <ul className="space-y-2">
                {feature.capabilities.map((capability) => (
                  <li key={capability} className="flex gap-3 text-sm text-[var(--vb-gray-600)] dark:text-slate-400">
                    <svg
                      className="h-5 w-5 flex-none text-[var(--vb-accent)]"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {capability}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
