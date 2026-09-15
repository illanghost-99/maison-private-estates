import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Phone, Calendar, GraduationCap, MapPin, Award, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";

export default function HomePage() {
  return (
    <>
      <section className="pt-28 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <FadeIn direction="left">
              <div className="relative aspect-[3/4] max-h-[720px] rounded-2xl overflow-hidden border border-gold/20 luxury-shadow">
                <Image
                  src="/images/broker.jpg"
                  alt="Erfan Irandost – registrerad fastighetsmäklare i Sollentuna"
                  fill
                  priority
                  quality={95}
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="font-display text-2xl text-white">Erfan Irandost</p>
                  <p className="text-gold text-sm mt-1">Reg. Fastighetsmäklare · Sollentuna</p>
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="right" delay={0.1}>
              <div>
                <p className="text-gold text-sm tracking-[0.2em] uppercase mb-4">
                  Personlig mäklare i Sollentuna
                </p>
                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-white leading-tight mb-6">
                  Kunden i centrum.
                  <br />
                  <span className="gold-text-gradient">Hela vägen.</span>
                </h1>
                <p className="text-gray-400 leading-relaxed mb-5">
                  Jag heter Erfan Irandost och är registrerad fastighetsmäklare
                  i Sollentuna. Med över nio års erfarenhet inom försäljning och
                  service – och utbildning från KTH – hjälper jag dig att sälja
                  eller köpa bostad med struktur, omsorg och tydligt resultat.
                </p>
                <p className="text-gray-400 leading-relaxed mb-8">
                  Varje uppdrag är ett förtroende. Jag tar helhetsansvar från
                  första samtalet till genomförd affär och uppföljning efteråt.
                  Vill du boka ett möte, en visning eller en värdering? Hör av
                  dig – jag svarar personligen.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <Link href="/boka-vardering">
                    <Button size="lg" className="gap-2 min-w-[200px]">
                      <Calendar className="h-4 w-4" />
                      Boka möte
                    </Button>
                  </Link>
                  <a href="tel:+46736334641">
                    <Button variant="outline" size="lg" className="gap-2 min-w-[200px]">
                      <Phone className="h-4 w-4" />
                      073-633 46 41
                    </Button>
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: GraduationCap, title: "KTH", text: "Utbildning och struktur" },
                    { icon: Award, title: "9+ år", text: "Försäljning och service" },
                    { icon: MapPin, title: "Sollentuna", text: "Lokal kunskap" },
                    { icon: Shield, title: "Helhetsansvar", text: "Från möte till affär" },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-xl border border-gold/15 bg-black-card p-4 flex gap-3"
                    >
                      <div className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                        <item.icon className="h-4 w-4 text-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="py-20 border-y border-gold/10 bg-black-soft">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <FadeIn>
            <p className="font-display text-2xl sm:text-3xl text-white leading-relaxed mb-6">
              ”Jag ser varje uppdrag som ett förtroende som ska genomföras med
              stor omsorg och professionalism.”
            </p>
            <p className="text-gold text-sm tracking-wide">— Erfan Irandost</p>
          </FadeIn>
        </div>
      </section>

      <section id="kontakt" className="py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <FadeIn>
            <p className="text-gold text-sm tracking-[0.2em] uppercase mb-4">
              Kontakt
            </p>
            <h2 className="font-display text-3xl sm:text-5xl text-white mb-5">
              Boka möte, visning eller värdering
            </h2>
            <p className="text-gray-400 mb-10 max-w-2xl mx-auto">
              Skriv i chatten längst ner till höger, fyll i bokningsformuläret
              eller ring. Vid seriösa förfrågningar aviseras jag direkt.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/boka-vardering">
                <Button size="lg" className="gap-2">
                  Boka möte
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/kontakt">
                <Button variant="outline" size="lg">
                  Skicka meddelande
                </Button>
              </Link>
              <a href="tel:+46736334641">
                <Button variant="ghost" size="lg" className="gap-2">
                  <Phone className="h-4 w-4" />
                  Ring Erfan
                </Button>
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
