export default function LogoCloud() {
  const logos = [
    { name: "Company A", src: "/images/logo-1.svg" },
    { name: "Company B", src: "/images/logo-2.svg" },
    { name: "Company C", src: "/images/logo-3.svg" },
    { name: "Company D", src: "/images/logo-4.svg" },
    { name: "Company E", src: "/images/logo-5.svg" },
  ];

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-center text-base font-semibold leading-8 text-[var(--vb-neutral-600)]">
          Trusted by teams building distribution centers and robotics-enabled facilities
        </h2>
        <div className="mx-auto mt-10 grid max-w-lg grid-cols-3 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-5 sm:gap-x-10 lg:mx-0 lg:max-w-none">
          {logos.map((logo) => (
            <div key={logo.name} className="flex items-center justify-center">
              <div className="h-12 w-24 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs text-gray-400">{logo.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
