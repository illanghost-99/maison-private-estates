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
  ListTodo,
  Plus,
  Bot,
} from "lucide-react";
import { mockStats } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  defaultTasks,
  defaultCrm,
  defaultWeekEvents,
  type WorkTask,
  type CrmPerson,
  type CalEvent,
  type Priority,
} from "@/lib/admin-data";

const ADMIN_PIN = "2580";
type Tab = "oversikt" | "uppgifter" | "kalender" | "crm" | "agent" | "inbox";

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
function logActivity(text: string) {
  const prev = load<{ t: string; text: string }[]>("maison_activity", []);
  prev.unshift({ t: new Date().toISOString(), text });
  save("maison_activity", prev.slice(0, 40));
}
function buildIcsHref(m: { id: string; title: string; start: string; end: string; location?: string }) {
  const fmt = (iso: string) =>
    new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Maison Private Estates//SV",
    "BEGIN:VEVENT",
    "UID:" + m.id + "@maison-private-estates",
    "DTSTAMP:" + fmt(new Date().toISOString()),
    "DTSTART:" + fmt(m.start),
    "DTEND:" + fmt(m.end),
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
  const [tasks, setTasks] = useState<WorkTask[]>([]);
  const [crm, setCrm] = useState<CrmPerson[]>([]);
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [activity, setActivity] = useState<{ t: string; text: string }[]>([]);
  const [localInbox, setLocalInbox] = useState<
    { id: string; name: string; email: string; phone: string; message: string; score: number; serious: boolean; telegram?: boolean; createdAt: string }[]
  >([]);
  const [draftOpen, setDraftOpen] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({ title: "", person: "", when: "", type: "möte" as CalEvent["type"] });

  useEffect(() => {
    if (sessionStorage.getItem("maison_admin") === "1") setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetch("/api/reminders").catch(() => {});
    setTasks(load("maison_tasks", defaultTasks));
    setCrm(load("maison_crm", defaultCrm));
    setEvents(load("maison_events", defaultWeekEvents()));
    setActivity(load("maison_activity", []));
    setLocalInbox(load("maison_inbox", []));
    logActivity("Öppnade adminpanelen");
    setActivity(load("maison_activity", []));
  }, [authed]);

  useEffect(() => {
    if (authed) save("maison_tasks", tasks);
  }, [tasks, authed]);
  useEffect(() => {
    if (authed) save("maison_crm", crm);
  }, [crm, authed]);
  useEffect(() => {
    if (authed) save("maison_events", events);
  }, [events, authed]);

  const unlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem("maison_admin", "1");
      setAuthed(true);
    } else setError("Fel kod. Försök igen.");
  };

  const p1 = tasks.filter((t) => t.priority === 1 && t.status !== "done");
  const p2 = tasks.filter((t) => t.priority === 2 && t.status !== "done");
  const p3 = tasks.filter((t) => t.priority === 3 && t.status !== "done");
  const hotLeads = [...crm].sort((a, b) => b.score - a.score);

  const markDone = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "done" } : t)));
    logActivity("Markerade uppgift som klar: " + id);
    setActivity(load("maison_activity", []));
  };

  const addEvent = () => {
    if (!newEvent.title || !newEvent.when) return;
    const start = new Date(newEvent.when).toISOString();
    const endD = new Date(newEvent.when);
    endD.setHours(endD.getHours() + 1);
    const ev: CalEvent = {
      id: "e" + Date.now(),
      title: newEvent.title,
      start,
      end: endD.toISOString(),
      type: newEvent.type,
      person: newEvent.person,
    };
    setEvents((prev) => [...prev, ev].sort((a, b) => a.start.localeCompare(b.start)));
    logActivity("Lade till kalenderhändelse: " + newEvent.title);
    setActivity(load("maison_activity", []));
    setNewEvent({ title: "", person: "", when: "", type: "möte" });
  };

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.start.localeCompare(b.start)),
    [events]
  );

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
          <p className="text-sm text-gray-500 text-center mb-6">Ange PIN för kalender, CRM och AI-uppgifter.</p>
          <form onSubmit={unlock} className="space-y-4">
            <input
              type="password"
              inputMode="numeric"
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
            <h1 className="font-display text-3xl text-white">Arbetsyta</h1>
            <p className="text-gray-500 text-sm mt-1">
              Du tar det viktigaste. Agenten tar resten och lär sig av hur du arbetar.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="tel:+46736334641">
              <Button variant="outline" size="sm">073-633 46 41</Button>
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
            ["uppgifter", "Att göra", ListTodo],
            ["kalender", "Kalender", Calendar],
            ["crm", "CRM", Users],
            ["agent", "Agenten", Bot],
            ["inbox", "Inbox", Inbox],
          ] as const).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => {
                setTab(id);
                logActivity("Öppnade flik: " + label);
                setActivity(load("maison_activity", []));
              }}
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
            <div className="rounded-xl border border-gold/20 bg-black-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-gold" />
                <h2 className="font-display text-xl text-white">Dagens briefing</h2>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Fokusera på samtal, möten och fotografering. Agenten sköter utkast, påminnelser och utvärderingar.
              </p>
              <ol className="space-y-2 text-sm text-gray-200">
                {p1.slice(0, 3).map((t, i) => (
                  <li key={t.id} className="flex gap-2">
                    <span className="text-gold">{i + 1}.</span>
                    <span>{t.title}</span>
                  </li>
                ))}
                {p1.length === 0 && <li className="text-gray-500">Inga P1-uppgifter just nu.</li>}
              </ol>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "P1 – du gör", value: p1.length, icon: Target },
                { label: "Agenten tar", value: p3.length, icon: Bot },
                { label: "Varma leads", value: crm.filter((c) => c.score >= 80).length, icon: TrendingUp },
                { label: "Kommande möten", value: sortedEvents.length, icon: Calendar },
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
                <h2 className="font-display text-lg text-white mb-4">Nästa i kalendern</h2>
                <div className="space-y-3">
                  {sortedEvents.slice(0, 4).map((m) => (
                    <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-black border border-white/5">
                      <div className="w-16 shrink-0">
                        <p className="text-[10px] text-gold">
                          {new Date(m.start).toLocaleDateString("sv-SE", { day: "numeric", month: "short" })}
                        </p>
                        <p className="text-xs text-white">
                          {new Date(m.start).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{m.title}</p>
                        <p className="text-xs text-gray-500">{m.person || m.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-black-card border border-gold/15 p-6">
                <h2 className="font-display text-lg text-white mb-4">Agenten har lärt sig</h2>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-gold shrink-0 mt-0.5" /> Du prioriterar samtal före mejl.</li>
                  <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-gold shrink-0 mt-0.5" /> Leads i Edsviken/Viby får högst score.</li>
                  <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-gold shrink-0 mt-0.5" /> Tackmejl efter möte ökar återkoppling.</li>
                  <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-gold shrink-0 mt-0.5" /> Utvärdering efter möte gör nästa samtal kortare.</li>
                </ul>
                <p className="text-xs text-gray-600 mt-4">
                  Senaste aktivitet: {activity[0] ? new Date(activity[0].t).toLocaleString("sv-SE") + " – " + activity[0].text : "Ingen ännu"}
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === "uppgifter" && (
          <div className="space-y-8">
            <PriorityBlock
              label="P1 – Gör själv (viktigast)"
              hint="Samtal och möten. Det som vinner affärer."
              items={p1}
              onDone={markDone}
              onDraft={setDraftOpen}
              draftOpen={draftOpen}
            />
            <PriorityBlock
              label="P2 – Du eller agenten"
              hint="Förberedelse. Agenten kan ta fram underlag."
              items={p2}
              onDone={markDone}
              onDraft={setDraftOpen}
              draftOpen={draftOpen}
            />
            <PriorityBlock
              label="P3 – Agenten tar (minst bråttom)"
              hint="Mejl, påminnelser och utvärderingar. Godkänn utkastet."
              items={p3}
              onDone={markDone}
              onDraft={setDraftOpen}
              draftOpen={draftOpen}
            />
          </div>
        )}

        {tab === "kalender" && (
          <div className="space-y-6">
            <div className="rounded-xl bg-black-card border border-white/5 p-6">
              <h2 className="font-display text-xl text-white mb-4">Lägg till i kalendern</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Titel"
                  className="bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                />
                <input
                  value={newEvent.person}
                  onChange={(e) => setNewEvent({ ...newEvent, person: e.target.value })}
                  placeholder="Kund"
                  className="bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                />
                <input
                  type="datetime-local"
                  value={newEvent.when}
                  onChange={(e) => setNewEvent({ ...newEvent, when: e.target.value })}
                  className="bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                />
                <select
                  value={newEvent.type}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, type: e.target.value as CalEvent["type"] })
                  }
                  className="bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="möte">Möte</option>
                  <option value="visning">Visning</option>
                  <option value="värdering">Värdering</option>
                  <option value="fotografering">Fotografering</option>
                  <option value="uppföljning">Uppföljning</option>
                </select>
                <Button onClick={addEvent} className="gap-2">
                  <Plus className="h-4 w-4" /> Spara
                </Button>
              </div>
              <p className="text-xs text-gray-600 mt-3">
                Ladda ner .ics för iPhone-kalendern. Full Apple-synk kräver senare kalender-API.
              </p>
            </div>
            <div className="space-y-3">
              {sortedEvents.map((m) => (
                <div key={m.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-black-card border border-white/5">
                  <div className="sm:w-44 shrink-0">
                    <p className="text-sm text-gold">
                      {new Date(m.start).toLocaleString("sv-SE", {
                        weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{m.type}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{m.title}</p>
                    <p className="text-sm text-gray-500">{m.person} {m.location ? "· " + m.location : ""}</p>
                  </div>
                  <a href={buildIcsHref(m)} download={m.id + ".ics"}>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Download className="h-3.5 w-3.5" /> iPhone
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "crm" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Pipeline: ny → kontaktad → möte → aktiv → vunnen. Hög score = ring först.
            </p>
            {hotLeads.map((c) => (
              <div key={c.id} className="rounded-xl bg-black-card border border-white/5 p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <p className="text-white font-medium">
                      {c.firstName} {c.lastName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {c.area} · {c.intent} · senast {c.lastTouch}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">{c.notes}</p>
                    <p className="text-xs text-gold mt-2">Nästa steg: {c.nextStep}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={c.score >= 80 ? "gold" : "outline"}>Score {c.score}</Badge>
                    <Badge variant="outline">{c.stage}</Badge>
                    <div className="flex gap-2">
                      <a href={"tel:" + c.phone}>
                        <Button size="sm" variant="outline" className="gap-1">
                          <Phone className="h-3 w-3" /> Ring
                        </Button>
                      </a>
                      <select
                        value={c.stage}
                        onChange={(e) => {
                          const stage = e.target.value as CrmPerson["stage"];
                          setCrm((prev) => prev.map((x) => (x.id === c.id ? { ...x, stage } : x)));
                          logActivity("Uppdaterade " + c.firstName + " till " + stage);
                          setActivity(load("maison_activity", []));
                        }}
                        className="bg-black border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                      >
                        {["ny", "kontaktad", "möte", "aktiv", "vunnen", "pausad"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "agent" && (
          <div className="space-y-6">
            <div className="rounded-xl bg-black-card border border-gold/15 p-6">
              <h2 className="font-display text-xl text-white mb-2">Så lär sig agenten</h2>
              <p className="text-sm text-gray-400 mb-4">
                När du öppnar flikar, markerar uppgifter och flyttar leads i CRM loggas det lokalt.
                Agenten använder det för att prioritera nästa briefing.
              </p>
              <ul className="space-y-2 text-sm text-gray-400 mb-6">
                <li className="flex gap-2"><AlertCircle className="h-4 w-4 text-gold shrink-0 mt-0.5" /> Du tar P1: ring, boka, stäng affär.</li>
                <li className="flex gap-2"><AlertCircle className="h-4 w-4 text-gold shrink-0 mt-0.5" /> Agenten tar P3: utkast till mejl, påminnelser, utvärdering.</li>
                <li className="flex gap-2"><AlertCircle className="h-4 w-4 text-gold shrink-0 mt-0.5" /> Godkänn utkast under Att göra – då lär den din ton.</li>
              </ul>
              <h3 className="text-sm text-gold mb-2">Aktivitetslogg</h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {activity.slice(0, 12).map((a, i) => (
                  <p key={i} className="text-xs text-gray-500">
                    {new Date(a.t).toLocaleString("sv-SE")} – {a.text}
                  </p>
                ))}
                {activity.length === 0 && <p className="text-xs text-gray-600">Ingen aktivitet ännu.</p>}
              </div>
            </div>
            <div className="rounded-xl bg-black-card border border-white/5 p-6">
              <h2 className="font-display text-lg text-white mb-3">Förbättringar som ger fler affärer</h2>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Svara varma leads inom 2 timmar – det är den enskilt största hävstången.</li>
                <li>• Ett kort tack efter varje möte. Agenten skriver, du skickar.</li>
                <li>• En mening utvärdering efter mötet: mål, signal, nästa steg.</li>
                <li>• Lägg mötet i iPhone-kalendern direkt så inget glöms.</li>
                <li>• Håll CRM-steget uppdaterat. Då vet agenten vad som är P1 imorgon.</li>
              </ul>
              <p className="text-xs text-gray-600 mt-4">
                Indikativ konvertering i panelen: {mockStats.conversionRate}% · pipeline {formatPrice(mockStats.monthlyRevenue)}
              </p>
            </div>
          </div>
        )}

        {tab === "inbox" && (
          <div className="rounded-xl bg-black-card border border-white/5 p-6">
            <h2 className="font-display text-xl text-white mb-2">Inbox från hemsidan</h2>
            <p className="text-sm text-gray-500 mb-6">
              Formulär och chattbokningar. Seriösa leads ska också ha gått till Telegram.
            </p>
            {localInbox.length === 0 && (
              <p className="text-sm text-gray-500">Inga formulärmeddelanden i den här webbläsaren ännu.</p>
            )}
            <div className="space-y-3">
              {localInbox.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-black border border-white/5">
                  <div className="flex justify-between gap-3 mb-2">
                    <p className="text-sm text-white font-medium">{item.name}</p>
                    <Badge variant={item.serious ? "gold" : "outline"}>Score {item.score}</Badge>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{item.message}</p>
                  <div className="flex gap-2">
                    {item.phone && (
                      <a href={"tel:" + item.phone}>
                        <Button size="sm" variant="outline">{item.phone}</Button>
                      </a>
                    )}
                    {item.email && (
                      <a href={"mailto:" + item.email}>
                        <Button size="sm" variant="ghost">{item.email}</Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PriorityBlock({
  label,
  hint,
  items,
  onDone,
  onDraft,
  draftOpen,
}: {
  label: string;
  hint: string;
  items: WorkTask[];
  onDone: (id: string) => void;
  onDraft: (id: string | null) => void;
  draftOpen: string | null;
}) {
  return (
    <section>
      <h2 className="font-display text-xl text-white mb-1">{label}</h2>
      <p className="text-xs text-gray-500 mb-4">{hint}</p>
      <div className="space-y-3">
        {items.length === 0 && <p className="text-sm text-gray-600">Inget just nu.</p>}
        {items.map((t) => (
          <div key={t.id} className="rounded-xl bg-black-card border border-white/5 p-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={t.priority === 1 ? "gold" : "outline"}>P{t.priority}</Badge>
                  <Badge variant="outline">{t.owner === "erfan" ? "Du" : "Agent"}</Badge>
                  {t.due && <span className="text-[11px] text-gray-500">{t.due}</span>}
                </div>
                <p className="text-white text-sm font-medium">{t.title}</p>
                <p className="text-xs text-gray-500 mt-1">{t.why}</p>
              </div>
              <div className="flex gap-2">
                {t.agentDraft && (
                  <Button size="sm" variant="outline" onClick={() => onDraft(draftOpen === t.id ? null : t.id)}>
                    Visa utkast
                  </Button>
                )}
                <Button size="sm" onClick={() => onDone(t.id)}>Klar</Button>
              </div>
            </div>
            {draftOpen === t.id && t.agentDraft && (
              <pre className="mt-3 whitespace-pre-wrap text-xs text-gray-300 bg-black border border-white/5 rounded-lg p-3">
                {t.agentDraft}
              </pre>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
