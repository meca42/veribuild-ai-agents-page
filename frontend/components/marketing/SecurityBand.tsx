import { Shield, Lock, Users, Database } from "lucide-react";

const securityFeatures = [
  { name: "SOC-Ready", icon: Shield },
  { name: "Encryption at Rest & Transit", icon: Lock },
  { name: "SSO & OAuth", icon: Users },
  { name: "Project & Org Isolation", icon: Database },
];

export default function SecurityBand() {
  return (
    <section id="security" className="bg-[var(--vb-gray-800)] dark:bg-[var(--vb-gray-200)] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Security & Compliance
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-300">
            Enterprise-grade security built for construction workflows
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4">
          {securityFeatures.map((feature) => (
            <div
              key={feature.name}
              className="flex flex-col items-center gap-2 text-center p-4 rounded-lg
                         bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
                <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <span className="text-sm font-medium text-white">{feature.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <a
            href="#security-overview"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-medium
                       bg-transparent text-white
                       shadow-[var(--vb-shadow-sm)] ring-2 ring-white/40 transition-all duration-150
                       hover:shadow-[var(--vb-shadow-md)] hover:bg-white/10 hover:ring-white/60
                       active:shadow-[var(--vb-shadow-sm)]
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--vb-gray-800)]"
          >
            View Security Overview
          </a>
        </div>
      </div>
    </section>
  );
}
