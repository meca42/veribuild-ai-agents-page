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
    <section id="solutions" className="bg-[var(--vb-neutral-50)] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--vb-neutral-900)] sm:text-4xl">
            Built for Every Role
          </h2>
          <p className="mt-4 text-lg leading-8 text-[var(--vb-neutral-600)]">
            Tailored solutions for everyone on your construction team
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:max-w-none lg:grid-cols-4">
          {roles.map((role) => (
            <div
              key={role.title}
              className="flex flex-col items-start gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--vb-accent)]">
                <role.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--vb-neutral-900)]">
                {role.title}
              </h3>
              <p className="text-sm text-[var(--vb-neutral-600)]">
                {role.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
