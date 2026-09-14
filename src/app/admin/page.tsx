"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Inbox,
  BarChart3,
  Sparkles,
  Lock,
  Download,
  Phone,
  Mail,
  Clock,
  Users,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  mockMeetings,
  mockLeads,
  mockStats,
  mockRecommendations,
  mockProperties,
} from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ADMIN_PIN = "2580";

type Tab = "oversikt" | "kalender" | "inbox" | "ai";

function buildIcsHref(m: {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location?: string;
}) {
  const fmt = (iso: string) =>
    new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Maison Private Estates//SV",
    "BEGIN:VEVENT",
    "UID:" + m.id + "@maison-private-estates",
    "DTSTAMP:" + fmt(new Date().toISOString()),
    "DTSTART:" + fmt(m.startTime),
    "DTEND:" + fmt(m.endTime),
    "SUMMARY:" + m.title,
    m.location ? "LOCATION:" + m.location : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
  return "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("oversikt");
  const [localInbox, setLocalInbox] = useState<
    { id: string; name: string; email: string; phone: string; message: string; score: number; serious: boolean; telegram?: boolean; createdAt: string }[]
  >([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("maison_inbox");
      if (raw) setLocalInbox(JSON.parse(raw));
    } catch {}
  }, [tab]);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("maison_admin") === "1") {
      setAuthed(true);
    }
  }, []);

  const unlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem("maison_admin", "1");
      setAuthed(true);
      setError("");
    } else {
      setError("Fel kod. Försök igen.");
    }
  };

  const meetings = useMemo(
    () =>
      [...mockMeetings].sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      ),
    []
  );

  const inbox = useMemo(() => {
    const fromLeads = mockLeads.map((l) => ({
      id: l.id,
      from: l.name,
      channel: l.source,
      preview: l.message || "",
      score: l.score,
      createdAt: l.createdAt,
      phone: l.phone,
      email: l.email,
    }));
    fromLeads.push({
      id: "msg-chat-1",
      from: "Webbchatt",
      channel: "AI-agent",
      preview: "Kund frågade om Aspvägen 27D och ville bli uppringd angående visning.",
      score: 88,
      createdAt: new Date().toISOString(),
      phone: undefined as string | undefined,
      email: undefined as string | undefined,
    });
    return fromLeads.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, []);

  const activeListings = mockProperties.filter(
    (p) => p.status === "for_sale" || p.status === "coming_soon"
  ).length;
  const soldCount = mockProperties.filter((p) => p.status === "sold").length;

  if (!authed) {
    return (
      <div className="min-h-screen pt-28 pb-20 flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-gold/20 bg-black-card p-8">
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 rounded-full bg-gold/15 flex items-center justify-center">
              <Lock className="h-5 w-5 text-gold" />
            </div>
          </div>
          <h1 className="font-display text-2xl text-white text-center mb-2">Mäklaradmin</h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Ange din kod. Face ID kräver native app – PIN är enklast på webben.
          </p>
          <form onSubmit={unlock} className="space-y-4">
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN-kod"
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-center text-lg tracking-[0.4em] text-white focus:outline-none focus:border-gold/40"
            />
            {error && <p className="text-xs text-danger text-center">{error}</p>}
            <Button type="submit" className="w-full">Logga in</Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 min-h-screen bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-gold text-sm tracking-[0.2em] uppercase mb-1">Admin · Erfan Irandost</p>
            <h1 className="font-display text-3xl text-white">Mäklarpanel</h1>
            <p className="text-gray-500 text-sm mt-1">Kalender, inbox, statistik och AI-observationer</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="tel:+46736334641">
              <Button variant="outline" size="sm" className="gap-2">
                <Phone className="h-3.5 w-3.5" />
                073-633 46 41
              </Button>
            </a>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                sessionStorage.removeItem("maison_admin");
                setAuthed(false);
              }}
            >
              Logga ut
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 border-b border-white/5 pb-4">
          {([
            ["oversikt", "Översikt", BarChart3],
            ["kalender", "Kalender", Calendar],
            ["inbox", "Inbox", Inbox],
            ["ai", "AI & förbättringar", Sparkles],
          ] as const).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-colors " +
                (tab === id
                  ? "bg-gold text-black border-gold"
                  : "border-gold/20 text-gray-400 hover:border-gold/40 hover:text-gold")
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {tab === "oversikt" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Dagens möten", value: mockStats.todayMeetings, icon: Calendar },
                { label: "Nya leads", value: mockStats.newLeads, icon: Users },
                { label: "Aktiva objekt", value: activeListings, icon: Target },
                { label: "Sålda (ref.)", value: soldCount, icon: TrendingUp },
              ].map((k) => (
                <div key={k.label} className="rounded-xl bg-black-card border border-white/5 p-5">
                  <k.icon className="h-5 w-5 text-gold mb-3" />
                  <p className="text-2xl font-display text-white">{k.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{k.label}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl bg-black-card border border-white/5 p-6">
                <h2 className="font-display text-xl text-white mb-4">Kommande möten</h2>
                <div className="space-y-3">
                  {meetings.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-black border border-white/5">
                      <div className="h-11 w-14 rounded-lg bg-gold/10 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] text-gold">
                          {new Date(m.startTime).toLocaleDateString("sv-SE", { day: "numeric", month: "short" })}
                        </span>
                        <span className="text-xs text-white font-medium">
                          {new Date(m.startTime).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white truncate">{m.title}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {m.location}
                        </p>
                      </div>
                      <a href={buildIcsHref(m)} download={m.id + ".ics"} className="shrink-0">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Download className="h-3.5 w-3.5" />
                          iCal
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-black-card border border-gold/15 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-gold" />
                  <h2 className="font-display text-xl text-white">AI – vad som behövs nu</h2>
                </div>
                <ul className="space-y-3">
                  {mockRecommendations.map((r) => (
                    <li key={r.id} className="p-3 rounded-lg bg-black border border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={r.priority === "high" ? "gold" : "outline"}>
                          {r.priority === "high" ? "Prioritet" : "Tips"}
                        </Badge>
                        <span className="text-sm text-white font-medium">{r.title}</span>
                      </div>
                      <p className="text-xs text-gray-500">{r.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {tab === "kalender" && (
          <div className="rounded-xl bg-black-card border border-white/5 p-6">
            <h2 className="font-display text-xl text-white mb-2">Bokade möten</h2>
            <p className="text-xs text-gray-500 mb-6">
              Ladda ner .ics och öppna i Kalender på iPhone för att synka mötet.
            </p>
            <div className="space-y-3">
              {meetings.map((m) => (
                <div key={m.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-black border border-white/5">
                  <div className="sm:w-40 shrink-0">
                    <p className="text-sm text-gold">
                      {new Date(m.startTime).toLocaleString("sv-SE", {
                        weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xs text-gray-500 capitalize mt-0.5">{m.type}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{m.title}</p>
                    <p className="text-sm text-gray-500">{m.location}</p>
                  </div>
                  <a href={buildIcsHref(m)} download={m.id + ".ics"}>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Download className="h-3.5 w-3.5" />
                      Lägg i iPhone-kalender
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "inbox" && (
          <div className="rounded-xl bg-black-card border border-white/5 p-6">
            <h2 className="font-display text-xl text-white mb-2">Inbox – leads & AI-chatt</h2>
            <p className="text-sm text-gray-500 mb-6">
              Meddelanden från hemsidan och AI-agenten. Telefon:{" "}
              <a href="tel:+46736334641" className="text-gold">073-633 46 41</a>
            </p>
            {localInbox.length > 0 && (
              <div className="space-y-3 mb-6">
                <p className="text-xs text-gold uppercase tracking-wider">Från hemsidans mejl-formulär</p>
                {localInbox.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl bg-black border border-gold/20">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="text-sm font-medium text-white">{item.name}</p>
                        <p className="text-[11px] text-gray-600">
                          Webbformulär · {new Date(item.createdAt).toLocaleString("sv-SE")}
                          {item.telegram ? " · Telegram skickat" : ""}
                        </p>
                      </div>
                      <Badge variant={item.serious ? "gold" : "outline"}>
                        Score {item.score}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{item.message}</p>
                    <div className="flex flex-wrap gap-2">
                      <a href={"tel:" + item.phone}>
                        <Button size="sm" variant="outline" className="gap-1">
                          <Phone className="h-3 w-3" /> {item.phone}
                        </Button>
                      </a>
                      <a href={"mailto:" + item.email}>
                        <Button size="sm" variant="ghost" className="gap-1">
                          <Mail className="h-3 w-3" /> {item.email}
                        </Button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-3">
              {inbox.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-black border border-white/5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm font-medium text-white">{item.from}</p>
                      <p className="text-[11px] text-gray-600">
                        {item.channel} · {new Date(item.createdAt).toLocaleString("sv-SE")}
                      </p>
                    </div>
                    <Badge variant={item.score >= 85 ? "gold" : "outline"}>Score {item.score}</Badge>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{item.preview}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.phone && (
                      <a href={"tel:" + item.phone}>
                        <Button size="sm" variant="outline" className="gap-1">
                          <Phone className="h-3 w-3" /> Ring
                        </Button>
                      </a>
                    )}
                    {item.email && (
                      <a href={"mailto:" + item.email + "?subject=Angående din förfrågan"}>
                        <Button size="sm" variant="ghost" className="gap-1">
                          <Mail className="h-3 w-3" /> Svara
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "ai" && (
          <div className="space-y-6">
            <div className="rounded-xl bg-black-card border border-gold/15 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-gold" />
                <h2 className="font-display text-xl text-white">Agenten arbetar för dig</h2>
              </div>
              <p className="text-sm text-gray-400 mb-6">
                AI styr samtal mot kundmöten och föreslår nästa steg. För att bli skarpare behövs mer data.
              </p>
              <h3 className="text-sm font-medium text-gold mb-3">Vad agenten behöver av dig</h3>
              <ul className="space-y-3 mb-8">
                {[
                  "Bekräfta eller justera rekommenderade samtal",
                  "Kalenderaccess (Google/Apple) för automatisk bokning",
                  "Koppla e-post eller SMS-API för realtids-inbox",
                  "Markera vilka AI-svar som var bra respektive bör undvikas",
                  "Uppdatera objekt när status ändras på HusmanHagberg",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-gray-300 items-start">
                    <AlertCircle className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <h3 className="text-sm font-medium text-gold mb-3">Observationer just nu</h3>
              <ul className="space-y-3">
                {[
                  "Leads kring Edsviken/Viby har högre score – återkoppla inom 2 timmar.",
                  "Kommande Viby-objekt genererar tidigt intresse.",
                  "Chatten konverterar bäst när den föreslår konkret mötestid.",
                  "Referensförsäljningar stärker förtroende hos säljare.",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-gray-400 items-start">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-black-card border border-white/5 p-6">
              <h2 className="font-display text-lg text-white mb-3">Nyckeltal</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Konvertering</p>
                  <p className="text-white text-lg">{mockStats.conversionRate}%</p>
                </div>
                <div>
                  <p className="text-gray-500">Intäkt (ind.)</p>
                  <p className="text-white text-lg">{formatPrice(mockStats.monthlyRevenue)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Aktiva objekt</p>
                  <p className="text-white text-lg">{activeListings}</p>
                </div>
                <div>
                  <p className="text-gray-500">Referens sålda</p>
                  <p className="text-white text-lg">{soldCount}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
