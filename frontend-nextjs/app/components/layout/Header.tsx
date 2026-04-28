"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
          <div className="w-8 h-8 rounded-lg bg-primary" />
          F.L.O.R.A
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition relative hover:text-primary ${
                  active ? "text-primary" : "text-muted"
                }`}
              >
                {link.label}

                {/* active underline */}
                <span
                  className={`absolute left-0 -bottom-1 h-[2px] bg-primary transition-all ${
                    active ? "w-full" : "w-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl border border-border hover:border-primary transition"
          >
            Login
          </Link>

          <Link
            href="/login"
            className="px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary-dark transition"
          >
            Get Started
          </Link>
        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg border border-border"
        >
          ☰
        </button>
      </div>

      {/* MOBILE DROPDOWN */}
      {open && (
        <div className="md:hidden border-t bg-white px-6 py-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block text-sm ${
                  active
                    ? "text-primary font-medium"
                    : "text-muted"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="pt-3 flex gap-2">
            <Link
              href="/login"
              className="flex-1 text-center px-3 py-2 border rounded-lg"
            >
              Login
            </Link>
            <Link
              href="/login"
              className="flex-1 text-center px-3 py-2 bg-primary text-white rounded-lg"
            >
              Start
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}