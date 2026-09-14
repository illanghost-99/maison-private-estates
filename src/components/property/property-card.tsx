"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Maximize, BedDouble } from "lucide-react";
import { Property } from "@/types";
import { formatPrice, formatArea, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface PropertyCardProps {
  property: Property;
  className?: string;
}

export function PropertyCard({ property, className }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const primaryImage = property.images.find((img) => img.isPrimary) || property.images[0];

  return (
    <Link
      href={`/bostad/${property.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl bg-black-card border border-white/5 transition-all duration-500 hover:border-gold/30 hover:shadow-2xl hover:shadow-gold/5",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {primaryImage && (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

        {/* Status badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {property.status === "sold" && (
            <Badge variant="danger">Såld</Badge>
          )}
          {property.status === "for_sale" && property.bidStatus && (
            <Badge variant="gold">{property.bidStatus}</Badge>
          )}
          {property.isFeatured && property.status === "for_sale" && (
            <Badge variant="gold">Utvalt</Badge>
          )}
        </div>

        {/* Favorite */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-4 right-4 h-9 w-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isFavorite ? "fill-gold text-gold" : "text-white"
            )}
          />
        </button>

        {/* Price overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <p className="font-display text-2xl text-white tracking-wide">
            {property.status === "sold" && property.finalPrice
              ? formatPrice(property.finalPrice)
              : property.price > 0
              ? formatPrice(property.price)
              : "Pris på begäran"}
          </p>
          {property.pricePerSqm && property.price > 0 && (
            <p className="text-xs text-gray-300 mt-0.5">
              {formatPrice(property.pricePerSqm)} / m²
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-5">
        <div>
          <h3 className="font-display text-lg text-white group-hover:text-gold transition-colors line-clamp-1">
            {property.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5 text-gray-400">
            <MapPin className="h-3.5 w-3.5 text-gold/70" />
            <span className="text-sm">
              {property.area}, {property.city}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1.5">
            <BedDouble className="h-4 w-4 text-gold/60" />
            <span>{property.rooms} rok</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize className="h-4 w-4 text-gold/60" />
            <span>{formatArea(property.livingArea)}</span>
          </div>
          {property.monthlyFee !== undefined && property.monthlyFee > 0 && (
            <div className="text-xs text-gray-500">
              Avgift {formatPrice(property.monthlyFee)}/mån
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
