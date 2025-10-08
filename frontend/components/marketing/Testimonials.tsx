const testimonials = [
  {
    content: "VeriBuild transformed how we manage drawings and RFIs. Our superintendents can now find answers in seconds instead of hours.",
    author: "Sarah Chen",
    role: "VP of Operations",
    company: "Modern Build Co.",
  },
  {
    content: "The AI agents have been a game changer for our field teams. We've cut submittal turnaround time by 60%.",
    author: "Michael Rodriguez",
    role: "Senior Project Manager",
    company: "Robotics Facilities Group",
  },
  {
    content: "Finally, a platform that understands construction workflows. The materials tracking alone has saved us countless delays.",
    author: "Jennifer Williams",
    role: "Construction Director",
    company: "Distribution Center Partners",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-[var(--vb-gray-100)] dark:bg-[var(--vb-gray-100)] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--vb-gray-800)] dark:text-white sm:text-4xl">
            Trusted by Construction Leaders
          </h2>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="flex flex-col justify-between rounded-2xl bg-white dark:bg-white/5 p-8 
                         border border-slate-200/60 dark:border-white/10
                         shadow-[var(--vb-shadow-sm)] hover:shadow-[var(--vb-shadow-md)]
                         transition-all duration-150 will-change-transform hover:-translate-y-0.5"
            >
              <blockquote className="text-base leading-7 text-[var(--vb-gray-600)] dark:text-slate-300">
                <p>"{testimonial.content}"</p>
              </blockquote>
              <div className="mt-6 border-t border-slate-200/60 dark:border-white/10 pt-6">
                <div className="font-semibold text-[var(--vb-gray-800)] dark:text-white">
                  {testimonial.author}
                </div>
                <div className="mt-1 text-sm text-[var(--vb-gray-600)] dark:text-slate-400">
                  {testimonial.role}, {testimonial.company}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
