import { EmailTrigger } from "@/components/contact/email-modal";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Kontakt | Maison Private Estates",
  description: "Kontakta Maison Private Estates i Stockholm.",
};

export default function KontaktPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <p className="text-gold text-sm tracking-[0.2em] uppercase mb-3">
            Kontakta oss
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-white mb-4">
            Vi finns här för dig
          </h1>
          <p className="text-gray-400 max-w-xl">
            Oavsett om du har en fråga om ett objekt, vill boka värdering eller
            bara vill prata marknad – hör av dig.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <div className="space-y-8">
            <div className="rounded-2xl bg-black-card border border-white/5 p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white mb-1">Kontor</p>
                  <p className="text-sm text-gray-400">
                    Kungsvägen 26<br />
                    191 45 Sollentuna
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white mb-1">Telefon</p>
                  <a href="tel:+46736334641" className="text-sm text-gray-400 hover:text-gold transition-colors">
                    073-633 46 41
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white mb-1">E-post</p>
                  <EmailTrigger className="text-sm text-gray-400" />
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white mb-1">
                    Öppettider
                  </p>
                  <p className="text-sm text-gray-400">
                    Mån–Fre 09:00–18:00
                    <br />
                    Lör 11:00–15:00
                    <br />
                    <span className="text-gold/80">
                      AI-assistenten svarar dygnet runt
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <Link href="/boka-vardering">
              <Button size="lg" className="w-full sm:w-auto">
                Boka värdering istället
              </Button>
            </Link>
          </div>

          {/* Simple contact form visual */}
          <div className="rounded-2xl bg-black-card border border-gold/15 p-8">
            <h2 className="font-display text-2xl text-white mb-6">
              Skicka meddelande
            </h2>
            <form className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Namn</label>
                <input
                  type="text"
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-gold/40 transition-colors"
                  placeholder="Ditt namn"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">E-post</label>
                <input
                  type="email"
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-gold/40 transition-colors"
                  placeholder="namn@email.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Meddelande
                </label>
                <textarea
                  rows={5}
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-gold/40 transition-colors resize-none"
                  placeholder="Hur kan vi hjälpa dig?"
                />
              </div>
              <Button type="submit" className="w-full">
                Skicka
              </Button>
              <p className="text-[11px] text-gray-600 text-center">
                Vi behandlar dina uppgifter enligt vår integritetspolicy.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
