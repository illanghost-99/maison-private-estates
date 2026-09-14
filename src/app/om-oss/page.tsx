import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, Shield, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Om oss | Maison Private Estates",
  description:
    "Maison Private Estates – exklusiv fastighetsförmedling i Stockholm med fokus, diskretion och AI-driven service.",
};

export default function OmOssPage() {
  return (
    <div className="pt-28 pb-20">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-20">
        <div className="max-w-3xl">
          <p className="text-gold text-sm tracking-[0.2em] uppercase mb-4">
            Om Maison
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-white mb-6 leading-tight">
            Vi säljer inte bara bostäder.
            <br />
            <span className="gold-text-gradient">Vi skapar hem.</span>
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed">
            Maison Private Estates är en boutique-mäklare specialiserad på
            Stockholms mest eftertraktade adresser. Vi kombinerar djup lokal
            expertis med modern teknik för att ge dig en upplevelse som är både
            personlig och exceptionellt effektiv.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-black-soft border-y border-gold/10 py-20 mb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              {
                icon: Award,
                title: "Expertis",
                text: "Över 15 års erfarenhet av premiumsegmentet i Stockholm. Vi känner varje kvarter.",
              },
              {
                icon: Shield,
                title: "Diskretion",
                text: "Många av våra kunder värdesätter integritet. Vi arbetar alltid med största diskretion.",
              },
              {
                icon: Users,
                title: "Nätverk",
                text: "Ett starkt nätverk av köpare och säljare ger dig tillgång till möjligheter innan de når marknaden.",
              },
              {
                icon: Sparkles,
                title: "AI-driven service",
                text: "Vår digitala assistent arbetar dygnet runt så att du får svar och support när du behöver det.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center md:text-left">
                <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center mb-4 mx-auto md:mx-0">
                  <item.icon className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-display text-xl text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80"
              alt="Maison kontor"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div>
            <p className="text-gold text-sm tracking-[0.2em] uppercase mb-4">
              Vår filosofi
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-white mb-6">
              Mindre volym.
              <br />
              Högre precision.
            </h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              Vi tar medvetet färre uppdrag än genomsnittsmäklaren. Det ger oss
              tid att verkligen förstå varje bostad, varje kund och varje
              marknadsmöjlighet. Resultatet är högre slutpriser, snabbare
              processer och en upplevelse som våra kunder återkommer till.
            </p>
            <p className="text-gray-400 leading-relaxed mb-8">
              Med vår AI-assistent får du dessutom tillgång till support,
              marknadsinsikter och bokning dygnet runt – utan att tappa den
              personliga kontakten med din ansvarige mäklare.
            </p>
            <Link href="/boka-vardering">
              <Button className="gap-2">
                Boka ett möte
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">
          Redo att ta nästa steg?
        </h2>
        <p className="text-gray-400 mb-8">
          Oavsett om du funderar på att sälja eller köpa – vi finns här.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/boka-vardering">
            <Button size="lg">Boka värdering</Button>
          </Link>
          <Link href="/till-salu">
            <Button variant="outline" size="lg">
              Se aktuella objekt
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
