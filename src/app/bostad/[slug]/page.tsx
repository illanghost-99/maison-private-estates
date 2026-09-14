import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  BedDouble,
  Maximize,
  Calendar,
  ArrowLeft,
  Share2,
  Heart,
  Phone,
  Mail,
} from "lucide-react";
import { mockProperties } from "@/lib/mock-data";
import { formatPrice, formatArea } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return mockProperties.map((p) => ({ slug: p.slug }));
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params;
  const property = mockProperties.find((p) => p.slug === slug);

  if (!property) notFound();

  const primaryImage =
    property.images.find((img) => img.isPrimary) || property.images[0];

  return (
    <div className="pt-20">
      {/* Gallery */}
      <div className="relative h-[60vh] min-h-[400px] max-h-[700px]">
        {primaryImage && (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />

        {/* Top actions */}
        <div className="absolute top-6 left-0 right-0 z-10">
          <div className="mx-auto max-w-7xl px-4 flex items-center justify-between">
            <Link href="/till-salu">
              <Button variant="secondary" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Tillbaka
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button variant="secondary" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-10">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {property.status === "for_sale" && (
                <Badge variant="gold">Till salu</Badge>
              )}
              {property.bidStatus && (
                <Badge variant="outline">{property.bidStatus}</Badge>
              )}
              {property.energyClass && (
                <Badge variant="outline">Energiklass {property.energyClass}</Badge>
              )}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-white mb-3 max-w-3xl">
              {property.title}
            </h1>
            <div className="flex items-center gap-2 text-gray-300">
              <MapPin className="h-4 w-4 text-gold" />
              <span>
                {property.address}, {property.area}, {property.city}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Key facts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  icon: BedDouble,
                  label: "Rum",
                  value: `${property.rooms} rok`,
                },
                {
                  icon: Maximize,
                  label: "Boarea",
                  value: formatArea(property.livingArea),
                },
                {
                  icon: Calendar,
                  label: "Byggår",
                  value: property.yearBuilt?.toString() || "–",
                },
                {
                  icon: MapPin,
                  label: "Våning",
                  value: property.floor
                    ? `${property.floor} av ${property.totalFloors}`
                    : "–",
                },
              ].map((fact) => (
                <div
                  key={fact.label}
                  className="rounded-xl bg-black-card border border-white/5 p-4 text-center"
                >
                  <fact.icon className="h-5 w-5 text-gold mx-auto mb-2" />
                  <p className="text-xs text-gray-500 mb-1">{fact.label}</p>
                  <p className="text-sm font-medium text-white">{fact.value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h2 className="font-display text-2xl text-white mb-4">
                Om bostaden
              </h2>
              <p className="text-gray-400 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Features */}
            <div>
              <h2 className="font-display text-2xl text-white mb-4">
                Egenskaper
              </h2>
              <div className="flex flex-wrap gap-2">
                {property.features.map((feature) => (
                  <Badge key={feature} variant="outline" className="px-3 py-1">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Costs */}
            {(property.monthlyFee || property.operatingCost) && (
              <div>
                <h2 className="font-display text-2xl text-white mb-4">
                  Kostnader
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {property.monthlyFee !== undefined && property.monthlyFee > 0 && (
                    <div className="rounded-xl bg-black-card border border-white/5 p-4">
                      <p className="text-xs text-gray-500 mb-1">Månadsavgift</p>
                      <p className="text-lg text-white">
                        {formatPrice(property.monthlyFee)}
                      </p>
                    </div>
                  )}
                  {property.operatingCost && (
                    <div className="rounded-xl bg-black-card border border-white/5 p-4">
                      <p className="text-xs text-gray-500 mb-1">Driftkostnad</p>
                      <p className="text-lg text-white">
                        {formatPrice(property.operatingCost)}/år
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price card */}
            <div className="rounded-2xl bg-black-card border border-gold/20 p-6 sticky top-28">
              <p className="text-sm text-gray-400 mb-1">
                {property.price > 0 ? "Utgångspris" : "Pris"}
              </p>
              <p className="font-display text-3xl text-white mb-1">
                {property.price > 0 ? formatPrice(property.price) : "På begäran"}
              </p>
              {property.pricePerSqm && property.price > 0 && (
                <p className="text-sm text-gray-500 mb-6">
                  {formatPrice(property.pricePerSqm)} / m²
                </p>
              )}
              {property.price <= 0 && <div className="mb-6" />}

              <div className="space-y-3">
                <Button className="w-full gap-2">
                  <Calendar className="h-4 w-4" />
                  Boka visning
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Phone className="h-4 w-4" />
                  Ring mäklaren
                </Button>
                <Button variant="ghost" className="w-full gap-2">
                  <Mail className="h-4 w-4" />
                  Skicka meddelande
                </Button>
              </div>

              {property.viewingDates && property.viewingDates.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/5">
                  <p className="text-sm text-gold mb-3">Kommande visningar</p>
                  <ul className="space-y-2">
                    {property.viewingDates.map((date) => (
                      <li
                        key={date}
                        className="text-sm text-gray-400 flex items-center gap-2"
                      >
                        <Calendar className="h-3.5 w-3.5 text-gold/60" />
                        {new Date(date).toLocaleString("sv-SE", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
