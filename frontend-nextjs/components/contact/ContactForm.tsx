// components/contact/ContactForm.tsx

export default function ContactForm() {
  return (
    <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">

      <h2 className="text-2xl font-semibold text-text">
        Send us a message
      </h2>

      <p className="mt-2 text-sm text-muted">
        We typically respond within 24 hours.
      </p>

      <form className="mt-8 space-y-5">

        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Full name"
            className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <input
            type="email"
            placeholder="Email address"
            className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <input
          type="text"
          placeholder="Subject"
          className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <textarea
          rows={5}
          placeholder="Your message..."
          className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}