import { ClipboardCheck, HardHat, Package, Eye } from "lucide-react";

const roles = [
  {
    title: "Project Managers",
    description: "Streamline submittals and RFIs. Maintain schedule clarity with real-time progress tracking.",
    icon: ClipboardCheck,
  },
  {
    title: "Field Supervisors",
    description: "Access step checklists, references, and get quick answers without leaving the jobsite.",
    icon: HardHat,
  },
  {
    title: "Materials Leads",
    description: "Track deliveries, monitor counts, and identify shortages before they impact timelines.",
    icon: Package,
  },
  {
    title: "Owners & GCs",
    description: "Gain progress visibility and maintain complete audit trails across all projects.",
    icon: Eye,
  },
];

export default function SolutionsByRole() {
  return (
    <section id="solutions" className="bg-white/90 dark:bg-black/30 backdrop-blur supports-[backdrop-filter]:backdrop-blur py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--vb-gray-800)] dark:text-white sm:text-4xl">
            Built for Every Role
          </h2>
          <p className="mt-4 text-lg leading-8 text-[var(--vb-gray-600)] dark:text-slate-300">
            Tailored solutions for everyone on your construction team
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:max-w-none lg:grid-cols-4">
          {roles.map((role) => (
            <div
              key={role.title}
              className="flex flex-col items-start gap-4 rounded-xl bg-white dark:bg-white/5 p-6 
                         border border-slate-200/60 dark:border-white/10
                         shadow-[var(--vb-shadow-sm)] hover:shadow-[var(--vb-shadow-md)]
                         transition-all duration-150 will-change-transform hover:-translate-y-0.5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--vb-accent)]/10 dark:bg-[var(--vb-accent)]/20 ring-1 ring-[var(--vb-accent)]/20">
                <role.icon className="h-6 w-6 text-[var(--vb-accent)]" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--vb-gray-800)] dark:text-white">
                {role.title}
              </h3>
              <p className="text-sm text-[var(--vb-gray-600)] dark:text-slate-300">
                {role.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
