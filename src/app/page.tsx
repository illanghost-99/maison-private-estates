import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Award, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/property/property-card";
import { mockProperties } from "@/lib/mock-data";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/ui/fade-in";

export default function HomePage() {
  const forSale = mockProperties
    .filter((p) => p.status === "for_sale")
    .slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2000&q=80"
            alt="Exklusiv bostad"
            fill
            priority
            className="object-cover scale-105 animate-[slow-zoom_20s_ease-in-out_infinite_alternate]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
          <FadeIn delay={0.1} direction="none">
            <p className="text-gold text-sm tracking-[0.3em] uppercase mb-6 font-medium">
              Private Estates · Sollentuna
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white leading-[1.05] mb-8">
              Där elegansen
              <br />
              <span className="gold-text-gradient">möter hemmet</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.35}>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Vi förmedlar utvalda bostäder i Sollentuna och omnejd med
              diskretion, expertis och personlig service – dygnet runt med AI.
            </p>
          </FadeIn>
          <FadeIn delay={0.5}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/till-salu">
                <Button size="lg" className="min-w-[180px]">
                  Se aktuella objekt
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/boka-vardering">
                <Button variant="outline" size="lg" className="min-w-[180px]">
                  Boka värdering
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-[10px] tracking-[0.2em] text-gray-500 uppercase">
            Utforska
          </span>
          <div className="h-10 w-px bg-gradient-to-b from-gold/60 to-transparent" />
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-gold/10 bg-black-soft">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <StaggerChildren className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                icon: Award,
                label: "Toppmäklare",
                sub: "flest kundmöten",
              },
              {
                icon: Shield,
                label: "Full diskretion",
                sub: "i varje affär",
              },
              {
                icon: Clock,
                label: "Snabb process",
                sub: "från möte till affär",
              },
              {
                icon: Sparkles,
                label: "AI-assisterad",
                sub: "service dygnet runt",
              },
            ].map((item) => (
              <StaggerItem key={item.label}>
                <div className="flex flex-col items-center text-center gap-2">
                  <item.icon className="h-6 w-6 text-gold mb-1" />
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.sub}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div>
                <p className="text-gold text-sm tracking-[0.2em] uppercase mb-3">
                  Utvalda objekt · Sollentuna
                </p>
                <h2 className="font-display text-4xl sm:text-5xl text-white">
                  Aktuella bostäder
                </h2>
              </div>
              <Link href="/till-salu">
                <Button variant="outline" className="gap-2">
                  Visa alla
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </FadeIn>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forSale.map((property) => (
              <StaggerItem key={property.id}>
                <PropertyCard property={property} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* About teaser */}
      <section className="py-24 bg-black-soft border-y border-gold/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="left">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-gold/15">
                <Image
                  src="/images/broker.jpg"
                  alt="Grundare och ansvarig mäklare – Maison Private Estates"
                  fill
                  quality={95}
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
            </FadeIn>
            <FadeIn direction="right" delay={0.15}>
              <div>
                <p className="text-gold text-sm tracking-[0.2em] uppercase mb-4">
                  Erfan Irandost · Reg. Fastighetsmäklare
                </p>
                <h2 className="font-display text-4xl sm:text-5xl text-white mb-6 leading-tight">
                  Kunden i centrum.
                  <br />
                  Hela vägen.
                </h2>
                <p className="text-gray-400 leading-relaxed mb-6">
                  Med över nio års erfarenhet och utbildning från KTH hjälper
                  Erfan dig att hitta eller sälja ditt hem i Sollentuna. Varje
                  uppdrag ses som ett förtroende – med struktur, engagemang och
                  fokus på rätt slutresultat.
                </p>
                <p className="text-gray-400 leading-relaxed mb-8">
                  AI-assistenten arbetar dygnet runt. Erfan tar de viktiga
                  mötena personligen. Tillsammans får du både snabb service och
                  en trygg, professionell process.
                </p>
                <Link href="/om-oss">
                  <Button variant="outline" className="gap-2">
                    Läs mer om oss
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <FadeIn>
          <div className="mx-auto max-w-4xl px-4 text-center">
            <p className="text-gold text-sm tracking-[0.2em] uppercase mb-4">
              Kostnadsfri värdering
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-white mb-6">
              Nyfiken på vad din bostad är värd?
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
              Boka en diskret och professionell värdering. Vi återkommer inom 24
              timmar med ett första utlåtande.
            </p>
            <Link href="/boka-vardering">
              <Button size="lg" className="min-w-[220px]">
                Boka värdering nu
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </FadeIn>
      </section>
    </>
  );
}
