"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Till salu", href: "/till-salu" },
  { name: "Sålda", href: "/salda" },
  { name: "Om oss", href: "/om-oss" },
  { name: "Marknad", href: "/marknad" },
  { name: "Kontakt", href: "/kontakt" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-full gold-gradient flex items-center justify-center">
              <span className="text-black font-display font-bold text-lg">M</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl tracking-wide text-white group-hover:text-gold transition-colors">
                MAISON
              </span>
              <span className="text-[10px] tracking-[0.3em] text-gold uppercase">
                Private Estates
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm text-gray-300 hover:text-gold transition-colors tracking-wide"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Button variant="ghost" size="sm" className="gap-2">
              <Phone className="h-4 w-4" />
              <span className="text-xs">08-123 45 67</span>
            </Button>
            <Link href="/boka-vardering">
              <Button size="sm" className="gap-2">
                <Calendar className="h-4 w-4" />
                Boka värdering
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-gray-300 hover:text-gold"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-300",
          mobileOpen ? "max-h-96 border-t border-gold/10" : "max-h-0"
        )}
      >
        <div className="px-4 py-6 space-y-4 bg-black/95">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block text-base text-gray-300 hover:text-gold"
              onClick={() => setMobileOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-3">
            <Link href="/boka-vardering" onClick={() => setMobileOpen(false)}>
              <Button className="w-full">Boka värdering</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
