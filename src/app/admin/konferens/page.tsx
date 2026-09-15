"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Mic, Square, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultTasks } from "@/lib/admin-data";
import type { WorkTask, CrmPerson, CalEvent } from "@/lib/admin-data";
import type { Followup } from "@/lib/followups";

const GREETS = [
  "Tjena chefen.",
  "Hej boss.",
  "Hej världens bästa mäklare.",
  "Tjena topp säljaren.",
  "Hej Erfan. Körläge igång.",
];

function load<T>(key: string, fallback: T): T {
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

function pickMaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const sv = voices.filter((v) => /sv/i.test(v.lang));
  const maleHint = /oskar|erik|male|man|daniel|mattias|stefan|google svenska/i;
  return (
    sv.find((v) => maleHint.test(v.name)) ||
    voices.find((v) => maleHint.test(v.name)) ||
    sv[0] ||
    voices.find((v) => /sv/i.test(v.lang)) ||
    null
  );
}

export default function KonferensPage() {
  const [authed, setAuthed] = useState(false);
  const [live, setLive] = useState(false);
  const [listening, setListening] = useState(false);
  const [log, setLog] = useState<{ who: "agent" | "du"; text: string }[]>([]);
  const [status, setStatus] = useState("Redo");
  const recRef = useRef<SpeechRecognition | null>(null);
  const speakingRef = useRef(false);
  const wakeRef = useRef<WakeLockSentinel | null>(null);
  const liveRef = useRef(false);

  useEffect(() => {
    if (sessionStorage.getItem("maison_admin") === "1") setAuthed(true);
  }, []);

  const speak = useCallback((text: string, after?: () => void) => {
    if (!window.speechSynthesis) {
      after?.();
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "sv-SE";
    u.rate = 1.05;
    u.pitch = 0.85;
    const voice = pickMaleVoice();
    if (voice) u.voice = voice;
    speakingRef.current = true;
    u.onend = () => {
      speakingRef.current = false;
      after?.();
    };
    window.speechSynthesis.speak(u);
  }, []);

  const addLog = (who: "agent" | "du", text: string) => {
    setLog((prev) => [...prev.slice(-24), { who, text }]);
  };

  const briefing = () => {
    const tasks = load<WorkTask[]>("maison_tasks", defaultTasks);
    const p1 = tasks.filter((t) => t.priority === 1 && t.status !== "done");
    const p3 = tasks.filter((t) => t.priority === 3 && t.status !== "done");
    const fu = load<Followup[]>("maison_followups", []);
    const pendingMail = fu.filter((f) => f.status === "scheduled" || f.status === "ready");
    let text = GREETS[Math.floor(Math.random() * GREETS.length)] + " ";
    if (p1.length) {
      text += "Viktigast idag: " + p1.map((t) => t.title).slice(0, 3).join(". ") + ". ";
    } else text += "Inga P1 just nu. ";
    if (p3.length || pendingMail.length) {
      text +=
        "Jag kan ta " +
        p3.length +
        " enklare saker och " +
        pendingMail.length +
        " uppföljningsmejl. Säg till om jag ska skicka dagens mejl, lägga in en kund eller boka ett möte.";
    } else {
      text += "Säg vad jag ska göra. Jag ringer och smsar inte åt dig.";
    }
    return text;
  };

  const handleCommand = (raw: string) => {
    const t = raw.toLowerCase();
    addLog("du", raw);

    if (/skicka.*(mejl|mail|uppfölj)/.test(t) || /skicka alla/.test(t)) {
      const fu = load<Followup[]>("maison_followups", []);
      const toSend = fu.filter((f) => f.status !== "sent" && f.status !== "skipped");
      const next = fu.map((f) =>
        f.status === "sent" || f.status === "skipped" ? f : { ...f, status: "sent" as const }
      );
      save("maison_followups", next);
      toSend.forEach((f) => {
        fetch("/api/followups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(f),
        }).catch(() => {});
      });
      const reply = toSend.length
        ? "Klart. Jag skickar " + toSend.length + " uppföljningsmejl nu."
        : "Inga mejl i kön just nu.";
      addLog("agent", reply);
      speak(reply, startListen);
      return;
    }

    if (/boka|lägg in möte|nytt möte/.test(t)) {
      const phone = raw.match(/(\+46|0)[\d\s-]{7,}/)?.[0] || "";
      const email = raw.match(/[\w.+-]+@[\w.-]+\.\w+/)?.[0] || "";
      const events = load<CalEvent[]>("maison_events", []);
      const ev: CalEvent = {
        id: "e" + Date.now(),
        title: "Möte via konferens",
        start: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        end: new Date(Date.now() + 25 * 3600 * 1000).toISOString(),
        type: "möte",
        person: raw.slice(0, 80),
        notes: raw,
      };
      save("maison_events", [...events, ev]);
      if (phone) {
        const crm = load<CrmPerson[]>("maison_crm", []);
        crm.unshift({
          id: "conf-" + Date.now(),
          firstName: raw.split(" ")[0] || "Kund",
          lastName: "",
          phone,
          email,
          stage: "möte",
          intent: "okänt",
          score: 80,
          area: "Konferens",
          lastTouch: "Nu",
          nextStep: "Bekräfta tid",
          notes: raw,
          source: "Konferens",
          flag: "✅",
        });
        save("maison_crm", crm.slice(0, 80));
      }
      const reply = "Bokat. Mötet ligger i kalendern" + (phone ? " och kunden i CRM." : ".");
      addLog("agent", reply);
      speak(reply, startListen);
      return;
    }

    if (/lägg in kund|ny kund|lägg till kund/.test(t)) {
      const phone = raw.match(/(\+46|0)[\d\s-]{7,}/)?.[0] || "saknas";
      const email = raw.match(/[\w.+-]+@[\w.-]+\.\w+/)?.[0] || "";
      const crm = load<CrmPerson[]>("maison_crm", []);
      crm.unshift({
        id: "conf-" + Date.now(),
        firstName: "Kund",
        lastName: "Konferens",
        phone,
        email,
        stage: "ny",
        intent: "okänt",
        score: 70,
        area: "Konferens",
        lastTouch: "Nu",
        nextStep: "Ring",
        notes: raw,
        source: "Konferens",
        flag: "📳",
      });
      save("maison_crm", crm.slice(0, 80));
      const reply = "Kunden är inne i CRM.";
      addLog("agent", reply);
      speak(reply, startListen);
      return;
    }

    if (/vad ska jag|briefing|vad har jag|dagens/.test(t)) {
      const text = briefing();
      addLog("agent", text);
      speak(text, startListen);
      return;
    }

    if (/ring|sms/.test(t)) {
      const reply = "Det ringer och smsar du. Jag tar mejl, kalender och CRM.";
      addLog("agent", reply);
      speak(reply, startListen);
      return;
    }

    const reply =
      "Hörde det. Säg till exempel: skicka dagens mejl. Boka möte med Svensson imorgon. Eller lägg in kund.";
    addLog("agent", reply);
    speak(reply, startListen);
  };

  const startListen = useCallback(() => {
    const w = window as unknown as {
      webkitSpeechRecognition?: new () => SpeechRecognition;
      SpeechRecognition?: new () => SpeechRecognition;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setStatus("Röstigenkänning saknas. Använd Safari eller Chrome.");
      return;
    }
    const rec = new SR();
    rec.lang = "sv-SE";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onstart = () => {
      setListening(true);
      setStatus("Lyssnar");
    };
    rec.onend = () => {
      setListening(false);
      if (liveRef.current && !speakingRef.current) {
        try {
          rec.start();
        } catch {}
      }
    };
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const text = e.results[0][0].transcript;
      handleCommand(text);
    };
    recRef.current = rec;
    try {
      rec.start();
    } catch {}
  }, []);

  const start = async () => {
    liveRef.current = true;
    setLive(true);
    setStatus("Konferens igång");
    try {
      wakeRef.current = (await navigator.wakeLock?.request("screen")) || null;
    } catch {}
    const text = briefing();
    addLog("agent", text);
    speak(text, startListen);
  };

  const stop = () => {
    liveRef.current = false;
    setLive(false);
    setListening(false);
    recRef.current?.stop();
    window.speechSynthesis?.cancel();
    wakeRef.current?.release();
    setStatus("Pausad");
  };

  if (!authed) {
    return (
      <div className="pt-32 pb-20 text-center text-gray-400">
        <p className="mb-4">Logga in i admin först.</p>
        <Link href="/admin" className="text-gold">
          Till admin
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16 min-h-screen bg-black px-4">
      <div className="mx-auto max-w-lg text-center">
        <p className="text-gold text-xs tracking-[0.25em] uppercase mb-2">Körläge</p>
        <h1 className="font-display text-4xl text-white mb-2">Konferens</h1>
        <p className="text-gray-500 text-sm mb-8">{status}</p>
        <button
          onClick={live ? stop : start}
          className={
            "mx-auto h-36 w-36 rounded-full flex items-center justify-center text-black " +
            (listening ? "gold-gradient scale-105" : "gold-gradient")
          }
        >
          {live ? <Square className="h-10 w-10" /> : <Mic className="h-12 w-12" />}
        </button>
        <p className="text-sm text-gray-400 mt-4">
          {live ? (listening ? "Prata nu" : "Agenten pratar") : "Tryck för att starta"}
        </p>
        <div className="mt-8 text-left space-y-2 max-h-72 overflow-y-auto">
          {log.map((m, i) => (
            <p key={i} className={m.who === "agent" ? "text-gold text-sm" : "text-white text-sm"}>
              <span className="text-gray-600 mr-2">{m.who === "agent" ? "Agent" : "Du"}</span>
              {m.text}
            </p>
          ))}
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              Tillbaka till admin
            </Button>
          </Link>
          {live && (
            <Button variant="ghost" size="sm" className="gap-2" onClick={stop}>
              <PhoneOff className="h-4 w-4" /> Avsluta
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
