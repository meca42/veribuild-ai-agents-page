import { Shield, Lock, Users, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

const securityFeatures = [
  { name: "SOC-Ready", icon: Shield },
  { name: "Encryption at Rest & Transit", icon: Lock },
  { name: "SSO & OAuth", icon: Users },
  { name: "Project & Org Isolation", icon: Database },
];

export default function SecurityBand() {
  return (
    <section className="bg-[var(--vb-neutral-900)] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Security & Compliance
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-300">
            Enterprise-grade security built for construction workflows
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4">
          {securityFeatures.map((feature) => (
            <div
              key={feature.name}
              className="flex flex-col items-center gap-2 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <span className="text-sm font-medium text-white">{feature.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button 
            variant="outline" 
            className="border-white text-white hover:bg-white hover:text-[var(--vb-neutral-900)]"
            asChild
          >
            <a href="#security-overview">View Security Overview</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
