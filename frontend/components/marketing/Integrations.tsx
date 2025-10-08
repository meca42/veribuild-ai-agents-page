const integrations = [
  { name: "Procore", logo: "/images/integrations/procore.svg" },
  { name: "Fieldwire", logo: "/images/integrations/fieldwire.svg" },
  { name: "Google Drive", logo: "/images/integrations/google-drive.svg" },
  { name: "SharePoint", logo: "/images/integrations/sharepoint.svg" },
  { name: "Dropbox", logo: "/images/integrations/dropbox.svg" },
  { name: "QuickBooks", logo: "/images/integrations/quickbooks.svg" },
  { name: "Supabase", logo: "/images/integrations/supabase.svg" },
  { name: "AWS S3", logo: "/images/integrations/aws-s3.svg" },
];

export default function Integrations() {
  return (
    <section id="integrations" className="bg-[var(--vb-gray-100)] dark:bg-[var(--vb-gray-100)] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--vb-gray-800)] dark:text-white sm:text-4xl">
            Integrations
          </h2>
          <p className="mt-4 text-lg leading-8 text-[var(--vb-gray-600)] dark:text-slate-300">
            Secure APIs and webhooks to fit your stack
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-4">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="flex items-center justify-center rounded-lg bg-white dark:bg-white/5 p-6 
                         border border-slate-200/60 dark:border-white/10
                         shadow-[var(--vb-shadow-sm)] hover:shadow-[var(--vb-shadow-md)]
                         transition-all duration-150 will-change-transform hover:-translate-y-0.5"
            >
              <div className="h-12 w-20 bg-[var(--vb-gray-200)] dark:bg-white/5 rounded flex items-center justify-center">
                <span className="text-xs text-[var(--vb-gray-600)] dark:text-slate-400 font-medium">{integration.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
