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
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--vb-neutral-900)] sm:text-4xl">
            Trusted by Construction Leaders
          </h2>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="flex flex-col justify-between rounded-2xl bg-[var(--vb-neutral-50)] p-8 shadow-sm ring-1 ring-gray-200"
            >
              <blockquote className="text-base leading-7 text-[var(--vb-neutral-600)]">
                <p>"{testimonial.content}"</p>
              </blockquote>
              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="font-semibold text-[var(--vb-neutral-900)]">
                  {testimonial.author}
                </div>
                <div className="mt-1 text-sm text-[var(--vb-neutral-600)]">
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
