import { PropertyCard } from "@/components/property/property-card";
import { mockProperties } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Sålda bostäder | Maison Private Estates",
  description: "Ett urval av nyligen förmedlade exklusiva bostäder.",
};

export default function SaldaPage() {
  const sold = mockProperties.filter((p) => p.status === "sold");

  return (
    <div className="pt-28 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <p className="text-gold text-sm tracking-[0.2em] uppercase mb-3">
            Referenser
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-white mb-4">
            Sålda bostäder
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Ett urval av nyligen genomförda affärer. Varje försäljning är ett
            bevis på vår förmåga att maximera värdet för våra kunder.
          </p>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <Badge variant="gold">{sold.length} objekt</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sold.length > 0 ? (
            sold.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center py-20">
              Inga sålda objekt att visa just nu.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
