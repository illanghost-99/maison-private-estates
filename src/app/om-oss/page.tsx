import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Shield,
  Users,
  Sparkles,
  Phone,
  GraduationCap,
  MapPin,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";

export const metadata = {
  title: "Om oss | Erfan Irandost – Maison Private Estates",
  description:
    "Erfan Irandost, registrerad fastighetsmäklare i Sollentuna. Utbildad vid KTH med över nio års erfarenhet inom försäljning och service.",
};

export default function OmOssPage() {
  return (
    <div className="pt-28 pb-20">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16">
        <FadeIn>
          <div className="max-w-3xl">
            <p className="text-gold text-sm tracking-[0.2em] uppercase mb-4">
              Om Maison · Sollentuna
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-white mb-6 leading-tight">
              Erfan Irandost
              <br />
              <span className="gold-text-gradient text-3xl sm:text-4xl md:text-5xl">
                Registrerad fastighetsmäklare
              </span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed">
              Hemma överallt i Sollentuna. Med engagemang, struktur och fokus
              på dig som kund hjälper Erfan dig från första samtal till genomförd
              affär.
            </p>
          </div>
        </FadeIn>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <FadeIn direction="left">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-gold/20 luxury-shadow sticky top-28">
              <Image
                src="/images/broker.jpg"
                alt="Erfan Irandost – registrerad fastighetsmäklare, Sollentuna"
                fill
                priority
                quality={95}
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="font-display text-2xl text-white">Erfan Irandost</p>
                <p className="text-gold text-sm mt-1">
                  Reg. Fastighetsmäklare · Sollentuna
                </p>
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="right" delay={0.1}>
            <div className="space-y-6">
              <div>
                <p className="text-gold text-sm tracking-[0.2em] uppercase mb-3">
                  Profil
                </p>
                <h2 className="font-display text-3xl text-white mb-4">
                  Kunden i centrum – hela vägen
                </h2>
                <div className="space-y-4 text-gray-400 leading-relaxed">
                  <p>
                    Med över nio års erfarenhet inom försäljning och service har
                    Erfan lärt sig vad som verkligen skapar framgång: att alltid
                    sätta kunden i centrum. Han vill hjälpa människor att hitta
                    sitt drömhem i Sollentuna – och ser varje uppdrag som ett
                    förtroende som ska genomföras med omsorg och professionalism.
                  </p>
                  <p>
                    Som fastighetsmäklare med utbildning från{" "}
                    <span className="text-white">KTH</span> kombinerar han
                    affärsmässighet med struktur och gedigen kunskap i varje
                    affär. Från första mötet och planering till genomförd
                    försäljning och uppföljning efteråt tar han helhetsansvar.
                  </p>
                  <p>
                    När du anlitar Erfan investerar du i en trygg och genomtänkt
                    bostadsaffär. Uppgiften är att matcha bostaden med rätt
                    köpare och skapa bästa möjliga förutsättningar för ett starkt
                    slutresultat – med ett nära, transparent och professionellt
                    samarbete.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                  {
                    icon: GraduationCap,
                    title: "Utbildning KTH",
                    text: "Affärsmässighet och struktur",
                  },
                  {
                    icon: Award,
                    title: "9+ års erfarenhet",
                    text: "Försäljning och service",
                  },
                  {
                    icon: MapPin,
                    title: "Sollentuna",
                    text: "Lokal kunskap i varje kvarter",
                  },
                  {
                    icon: Target,
                    title: "Helhetsansvar",
                    text: "Från första möte till uppföljning",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-gold/15 bg-black-card p-4 flex gap-3"
                  >
                    <div className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                      <item.icon className="h-4 w-4 text-gold" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link href="/boka-vardering">
                  <Button className="gap-2">
                    Boka värdering
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/kontakt">
                  <Button variant="outline" className="gap-2">
                    <Phone className="h-4 w-4" />
                    Kontakta Erfan
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-gray-600 pt-2">
                Erfan är knuten till HusmanHagberg i Sollentuna och driver även
                Maison Private Estates för en ännu mer personlig upplevelse.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="bg-black-soft border-y border-gold/10 py-20 mb-20">
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

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-20">
        <FadeIn>
          <div className="text-center mb-12">
            <p className="text-gold text-sm tracking-[0.2em] uppercase mb-3">
              Arbetssätt
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-white">
              Så arbetar vi
            </h2>
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Users,
              title: "Kunden först",
              text: "Varje beslut utgår från dina mål – oavsett om du säljer eller köper.",
            },
            {
              icon: Shield,
              title: "Trygg process",
              text: "Tydlig plan, transparent kommunikation och uppföljning efter affären.",
            },
            {
              icon: MapPin,
              title: "Lokal expertis",
              text: "Djup kunskap om Sollentuna – från Edsviken och Viby till Tureberg och Väsjön.",
            },
            {
              icon: Sparkles,
              title: "AI + personlig service",
              text: "Assistenten arbetar dygnet runt. Erfan tar de viktiga mötena personligen.",
            },
          ].map((item, i) => (
            <FadeIn key={item.title} delay={i * 0.08}>
              <div className="text-center md:text-left">
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
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 text-center">
        <FadeIn>
          <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">
            Funderar du på att sälja eller köpa?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Eller vill du bara ha en pratstund om bostadsmarknaden i Sollentuna?
            Hör av dig – Erfan finns här för att göra din bostadsaffär både
            smidig och trygg.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/boka-vardering">
              <Button size="lg">Boka värdering</Button>
            </Link>
            <Link href="/kontakt">
              <Button variant="outline" size="lg">
                Kontakta oss
              </Button>
            </Link>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
