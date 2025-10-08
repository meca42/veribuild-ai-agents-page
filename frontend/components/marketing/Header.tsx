import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/70 backdrop-blur-md
                       border-b border-slate-200/60 dark:border-white/10
                       shadow-[var(--vb-shadow-sm)]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 h-16 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <a href="/" className="-m-1.5 flex items-center gap-2 p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vb-accent)] rounded-md">
            <img src="/veribuild-logo.png" alt="VeriBuild" className="h-8 w-8 object-contain" />
            <span className="text-xl font-bold text-[var(--vb-gray-800)] dark:text-white">VeriBuild</span>
          </a>
        </div>
        
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-[var(--vb-gray-600)] hover:bg-[var(--vb-gray-100)] dark:hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="hidden lg:flex lg:gap-x-8">
          <a 
            href="#features" 
            className="text-sm font-semibold leading-6 text-[var(--vb-gray-600)] dark:text-slate-300 
                       hover:text-[var(--vb-accent)] dark:hover:text-[var(--vb-accent)] 
                       transition-colors underline-offset-4 hover:underline
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vb-accent)] rounded-sm"
          >
            Product
          </a>
          <a 
            href="#solutions" 
            className="text-sm font-semibold leading-6 text-[var(--vb-gray-600)] dark:text-slate-300
                       hover:text-[var(--vb-accent)] dark:hover:text-[var(--vb-accent)]
                       transition-colors underline-offset-4 hover:underline
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vb-accent)] rounded-sm"
          >
            Solutions
          </a>
          <a 
            href="#pricing" 
            className="text-sm font-semibold leading-6 text-[var(--vb-gray-600)] dark:text-slate-300
                       hover:text-[var(--vb-accent)] dark:hover:text-[var(--vb-accent)]
                       transition-colors underline-offset-4 hover:underline
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vb-accent)] rounded-sm"
          >
            Pricing
          </a>
          <a 
            href="#contact" 
            className="text-sm font-semibold leading-6 text-[var(--vb-gray-600)] dark:text-slate-300
                       hover:text-[var(--vb-accent)] dark:hover:text-[var(--vb-accent)]
                       transition-colors underline-offset-4 hover:underline
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vb-accent)] rounded-sm"
          >
            Contact
          </a>
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 lg:items-center">
          <a 
            href="/login" 
            className="text-sm font-semibold leading-6 text-[var(--vb-gray-600)] dark:text-slate-300
                       hover:text-[var(--vb-accent)] dark:hover:text-[var(--vb-accent)]
                       transition-colors underline-offset-4 hover:underline
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vb-accent)] rounded-sm"
          >
            Log in
          </a>
          <a
            href="/signup"
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white bg-[var(--vb-accent)]
                       shadow-[var(--vb-shadow-sm)] ring-1 ring-black/5 transition-all duration-150
                       hover:-translate-y-0.5 hover:shadow-[var(--vb-shadow-md)]
                       active:translate-y-0 active:shadow-[var(--vb-shadow-sm)]
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vb-accent)] focus-visible:ring-offset-2"
          >
            Get started
          </a>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-slate-950 px-6 py-6 sm:max-w-sm shadow-[var(--vb-shadow-lg)] ring-1 ring-slate-200/60 dark:ring-white/10">
            <div className="flex items-center justify-between">
              <a href="/" className="-m-1.5 flex items-center gap-2 p-1.5">
                <img src="/veribuild-logo.png" alt="VeriBuild" className="h-8 w-8 object-contain" />
                <span className="text-xl font-bold text-[var(--vb-gray-800)] dark:text-white">VeriBuild</span>
              </a>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-[var(--vb-gray-600)] dark:text-slate-300 hover:bg-[var(--vb-gray-100)] dark:hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-slate-200/60 dark:divide-white/10">
                <div className="space-y-2 py-6">
                  <a
                    href="#features"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-[var(--vb-gray-800)] dark:text-white hover:bg-[var(--vb-gray-100)] dark:hover:bg-white/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Product
                  </a>
                  <a
                    href="#solutions"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-[var(--vb-gray-800)] dark:text-white hover:bg-[var(--vb-gray-100)] dark:hover:bg-white/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Solutions
                  </a>
                  <a
                    href="#pricing"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-[var(--vb-gray-800)] dark:text-white hover:bg-[var(--vb-gray-100)] dark:hover:bg-white/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Pricing
                  </a>
                  <a
                    href="#contact"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-[var(--vb-gray-800)] dark:text-white hover:bg-[var(--vb-gray-100)] dark:hover:bg-white/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact
                  </a>
                </div>
                <div className="py-6 space-y-2">
                  <a
                    href="/login"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-[var(--vb-gray-800)] dark:text-white hover:bg-[var(--vb-gray-100)] dark:hover:bg-white/10"
                  >
                    Log in
                  </a>
                  <a
                    href="/signup"
                    className="flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-base font-medium text-white bg-[var(--vb-accent)]
                               shadow-[var(--vb-shadow-md)] ring-1 ring-black/5 transition-all duration-150
                               hover:shadow-[var(--vb-shadow-lg)]
                               active:shadow-[var(--vb-shadow-md)]"
                  >
                    Get started
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
