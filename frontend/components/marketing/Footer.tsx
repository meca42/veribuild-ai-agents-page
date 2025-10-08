import { Facebook, Twitter, Linkedin, Github } from "lucide-react";

const navigation = {
  product: [
    { name: "Features", href: "#features" },
    { name: "Integrations", href: "#integrations" },
    { name: "Security", href: "#security" },
    { name: "Pricing", href: "#pricing" },
  ],
  solutions: [
    { name: "Project Managers", href: "#solutions" },
    { name: "Field Teams", href: "#solutions" },
    { name: "Materials Management", href: "#solutions" },
    { name: "Owners & GCs", href: "#solutions" },
  ],
  resources: [
    { name: "Documentation", href: "#docs" },
    { name: "API Reference", href: "#api" },
    { name: "Case Studies", href: "#cases" },
    { name: "Blog", href: "#blog" },
  ],
  company: [
    { name: "About", href: "#about" },
    { name: "Careers", href: "#careers" },
    { name: "Contact", href: "#contact" },
    { name: "Partners", href: "#partners" },
  ],
  legal: [
    { name: "Privacy", href: "#privacy" },
    { name: "Terms", href: "#terms" },
    { name: "Security", href: "#security-overview" },
  ],
};

const socialLinks = [
  { name: "Facebook", href: "#", icon: Facebook },
  { name: "Twitter", href: "#", icon: Twitter },
  { name: "LinkedIn", href: "#", icon: Linkedin },
  { name: "GitHub", href: "#", icon: Github },
];

export default function Footer() {
  return (
    <footer className="mt-16 bg-white dark:bg-slate-950 border-t border-slate-200/60 dark:border-white/10 shadow-[var(--vb-shadow-sm)]" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <img src="/veribuild-logo.png" alt="VeriBuild" className="h-8 w-8 object-contain" />
              <span className="text-xl font-bold text-[var(--vb-gray-800)] dark:text-white">VeriBuild</span>
            </div>
            <p className="text-sm leading-6 text-[var(--vb-gray-600)] dark:text-slate-300">
              AI-powered construction management for modern builders.
            </p>
            <div className="flex space-x-6">
              {socialLinks.map((item) => (
                <a 
                  key={item.name} 
                  href={item.href} 
                  className="text-[var(--vb-gray-600)] dark:text-slate-400 hover:text-[var(--vb-accent)] dark:hover:text-[var(--vb-accent)] transition-colors
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vb-accent)] rounded-sm"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-[var(--vb-gray-800)] dark:text-white">Product</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.product.map((item) => (
                    <li key={item.name}>
                      <a 
                        href={item.href} 
                        className="text-sm leading-6 text-[var(--vb-gray-600)] dark:text-slate-300 
                                   hover:text-[var(--vb-accent)] dark:hover:text-[var(--vb-accent)] 
                                   transition-colors underline-offset-4 hover:underline
                                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vb-accent)] rounded-sm"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-[var(--vb-gray-800)] dark:text-white">Solutions</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.solutions.map((item) => (
                    <li key={item.name}>
                      <a 
                        href={item.href} 
                        className="text-sm leading-6 text-[var(--vb-gray-600)] dark:text-slate-300
                                   hover:text-[var(--vb-accent)] dark:hover:text-[var(--vb-accent)]
                                   transition-colors underline-offset-4 hover:underline
                                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vb-accent)] rounded-sm"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-[var(--vb-gray-800)] dark:text-white">Resources</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.resources.map((item) => (
                    <li key={item.name}>
                      <a 
                        href={item.href} 
                        className="text-sm leading-6 text-[var(--vb-gray-600)] dark:text-slate-300
                                   hover:text-[var(--vb-accent)] dark:hover:text-[var(--vb-accent)]
                                   transition-colors underline-offset-4 hover:underline
                                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vb-accent)] rounded-sm"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-[var(--vb-gray-800)] dark:text-white">Company</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <a 
                        href={item.href} 
                        className="text-sm leading-6 text-[var(--vb-gray-600)] dark:text-slate-300
                                   hover:text-[var(--vb-accent)] dark:hover:text-[var(--vb-accent)]
                                   transition-colors underline-offset-4 hover:underline
                                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vb-accent)] rounded-sm"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-slate-200/60 dark:border-white/10 pt-8 sm:mt-20 lg:mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {navigation.legal.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-sm leading-6 text-[var(--vb-gray-600)] dark:text-slate-300
                             hover:text-[var(--vb-accent)] dark:hover:text-[var(--vb-accent)]
                             transition-colors underline-offset-4 hover:underline
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vb-accent)] rounded-sm"
                >
                  {item.name}
                </a>
              ))}
            </div>
            <p className="text-sm leading-5 text-[var(--vb-gray-600)] dark:text-slate-400">
              &copy; {new Date().getFullYear()} VeriBuild. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
