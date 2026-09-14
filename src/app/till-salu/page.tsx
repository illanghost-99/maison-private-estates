import { PropertyCard } from "@/components/property/property-card";
import { mockProperties } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Till salu | Maison Private Estates",
  description: "Aktuella exklusiva bostäder till salu i Stockholm och omnejd.",
};

export default function TillSaluPage() {
  const properties = mockProperties.filter((p) => p.status === "for_sale" || p.status === "coming_soon");

  return (
    <div className="pt-28 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <p className="text-gold text-sm tracking-[0.2em] uppercase mb-3">
            Portfolio
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-white mb-4">
            Till salu
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Ett urval av Stockholms mest eftertraktade bostäder. Varje objekt är
            handplockat och presenterat med största omsorg.
          </p>
        </div>

        {/* Filters (visual) */}
        <div className="flex flex-wrap gap-3 mb-10">
          {["Alla", "Lägenhet", "Villa", "Radhus", "Östermalm", "Djursholm", "Södermalm"].map(
            (filter, i) => (
              <button
                key={filter}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  i === 0
                    ? "bg-gold text-black border-gold"
                    : "border-gold/20 text-gray-400 hover:border-gold/50 hover:text-gold"
                }`}
              >
                {filter}
              </button>
            )
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center gap-3 mb-8">
          <Badge variant="gold">{properties.length} objekt</Badge>
          <span className="text-sm text-gray-500">sorterat efter relevans</span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </div>
  );
}
