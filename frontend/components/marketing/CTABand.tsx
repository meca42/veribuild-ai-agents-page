import { Button } from "@/components/ui/button";

export default function CTABand() {
  return (
    <section id="demo" className="bg-[var(--vb-primary)] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Transform Your Construction Workflow?
          </h2>
          <p className="mt-4 text-lg leading-8 text-white/90">
            See how VeriBuild can streamline your projects and empower your teams.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg"
              className="bg-[var(--vb-accent)] hover:bg-[var(--vb-accent)]/90 text-white text-base px-8"
              asChild
            >
              <a href="#get-demo">Get a demo</a>
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-base px-8 border-white text-white hover:bg-white hover:text-[var(--vb-primary)]"
              asChild
            >
              <a href="#contact-sales">Contact sales</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
