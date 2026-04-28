import Link from "next/link";
import { FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg-soft">
      <div className="max-w-7xl mx-auto px-6 py-16 grid gap-12 md:grid-cols-4">

        {/* BRAND */}
        <div>
          <h2 className="text-xl font-bold text-primary tracking-tight">
            F.L.O.R.A
          </h2>

          <p className="mt-4 text-sm text-muted leading-relaxed">
            Smart accounting platform for modern businesses. Manage invoices,
            inventory, expenses, and financial reports with clarity and confidence.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="font-semibold mb-4 text-text">
            Quick Links
          </h3>

          <div className="flex flex-col gap-3 text-sm">
            {[
              { href: "/about", label: "About" },
              { href: "/contact", label: "Contact" },
              { href: "/faq", label: "FAQ" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted transition-all duration-200 
                  hover:text-primary hover:translate-x-1 active:scale-95"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* LEGAL */}
        <div>
          <h3 className="font-semibold mb-4 text-text">
            Legal
          </h3>

          <div className="flex flex-col gap-3 text-sm">
            {[
              { href: "/privacy", label: "Privacy Policy" },
              { href: "/terms", label: "Terms of Service" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted transition-all duration-200 
                  hover:text-primary hover:translate-x-1 active:scale-95"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* SOCIAL */}
        <div>
          <h3 className="font-semibold mb-4 text-text">
            Connect
          </h3>

          <div className="flex gap-4">
            {[
              { icon: FaTwitter, href: "https://twitter.com" },
              { icon: FaGithub, href: "https://github.com" },
              { icon: FaLinkedin, href: "https://linkedin.com" },
            ].map(({ icon: Icon, href }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-muted transition-all duration-200
                  hover:text-primary hover:bg-primary-light
                  active:scale-90"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-border py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} F.L.O.R.A — Built for modern finance teams.
      </div>
    </footer>
  );
}