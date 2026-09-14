import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, Shield, Users, Sparkles, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Om oss | Maison Private Estates",
  description:
    "Maison Private Estates – exklusiv fastighetsförmedling i Stockholm. Grundare och toppmäklare med flest kundmöten i premiumsegmentet.",
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
            Stockholms mest eftertraktade adresser. Vi kombinerar personlig
            expertis med modern AI-teknik för en upplevelse som är både
            diskret och exceptionellt effektiv.
          </p>
        </div>
      </section>

      {/* Founder */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-gold/20 luxury-shadow">
            <Image
              src="/images/broker.jpg"
              alt="Grundare och ansvarig mäklare – Maison Private Estates"
              fill
              priority
              quality={95}
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>

          <div>
            <p className="text-gold text-sm tracking-[0.2em] uppercase mb-3">
              Grundare & ansvarig mäklare
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">
              Toppsäljare med flest kundmöten
            </h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              Bakom Maison Private Estates står en mäklare som konsekvent ligger
              i topp när det gäller antal kundmöten och genomförda affärer i
              premiumsegmentet. Fokus ligger på kvalitet, närvaro och resultat –
              inte volym för volymens skull.
            </p>
            <p className="text-gray-400 leading-relaxed mb-6">
              Varje kund får personlig uppföljning. Vår AI-assistent arbetar
              dygnet runt för att fånga upp intresse, boka möten och se till att
              inget lead går förlorat – medan du alltid har en mänsklig expert
              att vända dig till.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <div className="rounded-lg border border-gold/20 bg-black-card px-4 py-3">
                <p className="text-xs text-gray-500">Fokus</p>
                <p className="text-sm text-white font-medium">Premium Stockholm</p>
              </div>
              <div className="rounded-lg border border-gold/20 bg-black-card px-4 py-3">
                <p className="text-xs text-gray-500">Styrka</p>
                <p className="text-sm text-white font-medium">Flest kundmöten</p>
              </div>
              <div className="rounded-lg border border-gold/20 bg-black-card px-4 py-3">
                <p className="text-xs text-gray-500">Service</p>
                <p className="text-sm text-white font-medium">AI + personlig</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/boka-vardering">
                <Button className="gap-2">
                  Boka möte
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/kontakt">
                <Button variant="outline" className="gap-2">
                  <Phone className="h-4 w-4" />
                  Kontakta oss
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-black-soft border-y border-gold/10 py-20 mb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              {
                icon: Award,
                title: "Toppresultat",
                text: "Konsekvent flest kundmöten och starka avslut i Stockholms premiumsegment.",
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
                title: "AI som når ut",
                text: "När någon visar intresse för ett objekt tar vår AI kontakt – proaktivt, proffsigt och utan att vara påträngande.",
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

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">
          Redo att ta nästa steg?
        </h2>
        <p className="text-gray-400 mb-8">
          Oavsett om du funderar på att sälja eller köpa – vi finns här, med
          både personlig service och AI som arbetar dygnet runt.
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
