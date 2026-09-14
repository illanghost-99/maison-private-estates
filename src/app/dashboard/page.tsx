import {
  Calendar,
  Users,
  TrendingUp,
  Home,
  Phone,
  Mail,
  ArrowUpRight,
  Clock,
  Target,
  Sparkles,
} from "lucide-react";
import {
  mockStats,
  mockMeetings,
  mockLeads,
  mockRecommendations,
  mockProperties,
} from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Mäklarpanel | Maison Private Estates",
};

export default function DashboardPage() {
  const stats = mockStats;
  const todayMeetings = mockMeetings.filter((m) => m.status === "scheduled");
  const newLeads = mockLeads.filter((l) => l.status === "new");

  return (
    <div className="pt-28 pb-20 min-h-screen bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-gold text-sm tracking-[0.2em] uppercase mb-1">
              Mäklarpanel
            </p>
            <h1 className="font-display text-3xl sm:text-4xl text-white">
              God morgon
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Lördag 12 september 2026 • Här är din översikt
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              Exportera rapport
            </Button>
            <Button size="sm">Ny lead</Button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: "Dagens möten",
              value: stats.todayMeetings,
              icon: Calendar,
              change: null,
            },
            {
              label: "Nya leads",
              value: stats.newLeads,
              icon: Users,
              change: "+3 sedan igår",
            },
            {
              label: "Aktiva affärer",
              value: stats.activeDeals,
              icon: Target,
              change: null,
            },
            {
              label: "Intäkt denna månad",
              value: formatPrice(stats.monthlyRevenue),
              icon: TrendingUp,
              change: "+12%",
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl bg-black-card border border-white/5 p-5 hover:border-gold/20 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <kpi.icon className="h-5 w-5 text-gold" />
                {kpi.change && (
                  <span className="text-[11px] text-success flex items-center gap-0.5">
                    <ArrowUpRight className="h-3 w-3" />
                    {kpi.change}
                  </span>
                )}
              </div>
              <p className="text-2xl font-display text-white mb-1">
                {kpi.value}
              </p>
              <p className="text-xs text-gray-500">{kpi.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Recommendations */}
            <div className="rounded-xl bg-black-card border border-gold/15 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles className="h-5 w-5 text-gold" />
                <h2 className="font-display text-xl text-white">
                  AI-rekommendationer
                </h2>
              </div>
              <div className="space-y-4">
                {mockRecommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex gap-4 p-4 rounded-lg bg-black border border-white/5 hover:border-gold/20 transition-colors"
                  >
                    <div className="shrink-0 mt-0.5">
                      <Badge
                        variant={
                          rec.priority === "high"
                            ? "gold"
                            : rec.priority === "medium"
                            ? "warning"
                            : "outline"
                        }
                      >
                        {rec.priority === "high"
                          ? "Hög"
                          : rec.priority === "medium"
                          ? "Medium"
                          : "Låg"}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white mb-1">
                        {rec.title}
                      </p>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {rec.description}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="shrink-0">
                      Utför
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's meetings */}
            <div className="rounded-xl bg-black-card border border-white/5 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-xl text-white">
                  Dagens möten
                </h2>
                <Badge variant="gold">{todayMeetings.length}</Badge>
              </div>
              <div className="space-y-3">
                {todayMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-black border border-white/5"
                  >
                    <div className="h-12 w-12 rounded-lg bg-gold/10 flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs text-gold font-medium">
                        {new Date(meeting.startTime).toLocaleTimeString(
                          "sv-SE",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {meeting.title}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {meeting.location}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 capitalize">
                      {meeting.type === "valuation"
                        ? "Värdering"
                        : meeting.type === "viewing"
                        ? "Visning"
                        : "Konsultation"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* New leads */}
            <div className="rounded-xl bg-black-card border border-white/5 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-xl text-white">Nya leads</h2>
                <Badge variant="gold">{newLeads.length}</Badge>
              </div>
              <div className="space-y-4">
                {newLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 rounded-lg bg-black border border-white/5"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-white">
                        {lead.name}
                      </p>
                      <Badge
                        variant={lead.score >= 80 ? "gold" : "outline"}
                      >
                        {lead.score}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                      {lead.message}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-7 px-2">
                        <Phone className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 px-2">
                        <Mail className="h-3 w-3" />
                      </Button>
                      <span className="text-[10px] text-gray-600 ml-auto">
                        {lead.source}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick stats */}
            <div className="rounded-xl bg-black-card border border-white/5 p-6">
              <h2 className="font-display text-xl text-white mb-5">
                Nyckeltal
              </h2>
              <div className="space-y-4">
                {[
                  {
                    label: "Konverteringsgrad",
                    value: `${stats.conversionRate}%`,
                  },
                  {
                    label: "Objekt till salu",
                    value: stats.totalListings,
                  },
                  {
                    label: "Sålda denna månad",
                    value: stats.soldThisMonth,
                  },
                  {
                    label: "Kommande visningar",
                    value: stats.upcomingViewings,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <span className="text-sm font-medium text-white">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active listings mini */}
            <div className="rounded-xl bg-black-card border border-white/5 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Home className="h-5 w-5 text-gold" />
                <h2 className="font-display text-xl text-white">
                  Aktiva objekt
                </h2>
              </div>
              <div className="space-y-3">
                {mockProperties
                  .filter((p) => p.status === "for_sale")
                  .slice(0, 3)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-400 truncate max-w-[160px]">
                        {p.area}
                      </span>
                      <span className="text-white font-medium">
                        {formatPrice(p.price)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
