import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <a href="/" className="-m-1.5 flex items-center gap-2 p-1.5">
            <img src="/veribuild-logo.png" alt="VeriBuild" className="h-8 w-8 object-contain" />
            <span className="text-xl font-bold text-[var(--vb-neutral-900)]">VeriBuild</span>
          </a>
        </div>
        
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-[var(--vb-neutral-600)]"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="hidden lg:flex lg:gap-x-8">
          <a href="#product" className="text-sm font-semibold leading-6 text-[var(--vb-neutral-600)] hover:text-[var(--vb-primary)] transition-colors">
            Product
          </a>
          <a href="#solutions" className="text-sm font-semibold leading-6 text-[var(--vb-neutral-600)] hover:text-[var(--vb-primary)] transition-colors">
            Solutions
          </a>
          <a href="#pricing" className="text-sm font-semibold leading-6 text-[var(--vb-neutral-600)] hover:text-[var(--vb-primary)] transition-colors">
            Pricing
          </a>
          <a href="#resources" className="text-sm font-semibold leading-6 text-[var(--vb-neutral-600)] hover:text-[var(--vb-primary)] transition-colors">
            Resources
          </a>
          <a href="#contact" className="text-sm font-semibold leading-6 text-[var(--vb-neutral-600)] hover:text-[var(--vb-primary)] transition-colors">
            Contact
          </a>
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <a href="/login" className="text-sm font-semibold leading-6 text-[var(--vb-neutral-600)] hover:text-[var(--vb-primary)] transition-colors">
            Log in
          </a>
          <Button 
            asChild
            className="bg-[var(--vb-accent)] hover:bg-[var(--vb-accent)]/90 text-white"
          >
            <a href="#demo">Get a demo</a>
          </Button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <a href="/" className="-m-1.5 flex items-center gap-2 p-1.5">
                <img src="/veribuild-logo.png" alt="VeriBuild" className="h-8 w-8 object-contain" />
                <span className="text-xl font-bold text-[var(--vb-neutral-900)]">VeriBuild</span>
              </a>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-[var(--vb-neutral-600)]"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  <a
                    href="#product"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-[var(--vb-neutral-900)] hover:bg-gray-50"
                  >
                    Product
                  </a>
                  <a
                    href="#solutions"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-[var(--vb-neutral-900)] hover:bg-gray-50"
                  >
                    Solutions
                  </a>
                  <a
                    href="#pricing"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-[var(--vb-neutral-900)] hover:bg-gray-50"
                  >
                    Pricing
                  </a>
                  <a
                    href="#resources"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-[var(--vb-neutral-900)] hover:bg-gray-50"
                  >
                    Resources
                  </a>
                  <a
                    href="#contact"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-[var(--vb-neutral-900)] hover:bg-gray-50"
                  >
                    Contact
                  </a>
                </div>
                <div className="py-6 space-y-2">
                  <a
                    href="/login"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-[var(--vb-neutral-900)] hover:bg-gray-50"
                  >
                    Log in
                  </a>
                  <Button 
                    asChild
                    className="w-full bg-[var(--vb-accent)] hover:bg-[var(--vb-accent)]/90 text-white"
                  >
                    <a href="#demo">Get a demo</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
