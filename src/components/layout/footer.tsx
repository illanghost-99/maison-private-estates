import Link from "next/link";
import { Mail, Phone, MapPin, Instagram, Linkedin } from "lucide-react";
import { EmailTrigger } from "@/components/contact/email-modal";

export function Footer() {
  return (
    <footer className="border-t border-gold/10 bg-black-soft">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full gold-gradient flex items-center justify-center">
                <span className="text-black font-display font-bold text-lg">M</span>
              </div>
              <div>
                <span className="font-display text-xl text-white">MAISON</span>
                <p className="text-[10px] tracking-[0.3em] text-gold uppercase">
                  Private Estates
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Personlig mäklartjänst i Sollentuna. Erfan Irandost –
              registrerad fastighetsmäklare med fokus på trygga affärer.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-medium text-gold mb-4 tracking-wide">
              NAVIGATION
            </h4>
            <ul className="space-y-3">
              {[
                { name: "Om Erfan", href: "/om-oss" },
                { name: "Boka möte", href: "/boka-vardering" },
                { name: "Kontakt", href: "/kontakt" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-medium text-gold mb-4 tracking-wide">
              KONTAKT
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                <span>Kungsvägen 26<br />191 45 Sollentuna</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Phone className="h-4 w-4 text-gold shrink-0" />
                <a href="tel:+46736334641" className="hover:text-gold transition-colors">073-633 46 41</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Mail className="h-4 w-4 text-gold shrink-0" />
                <EmailTrigger className="text-sm text-gray-400" />
              </li>
            </ul>
          </div>

          {/* Social + Legal */}
          <div>
            <h4 className="text-sm font-medium text-gold mb-4 tracking-wide">
              FÖLJ OSS
            </h4>
            <div className="flex gap-4 mb-8">
              <a
                href="#"
                className="h-10 w-10 rounded-full border border-gold/20 flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold/50 transition-all"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full border border-gold/20 flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold/50 transition-all"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Registrerad fastighetsmäklare.<br />
              Ansvarsförsäkring finns.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gold/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Maison Private Estates. Alla rättigheter förbehållna.
          </p>
          <div className="flex gap-6 text-xs text-gray-600">
            <Link href="/integritet" className="hover:text-gold transition-colors">
              Integritetspolicy
            </Link>
            <Link href="/villkor" className="hover:text-gold transition-colors">
              Villkor
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
