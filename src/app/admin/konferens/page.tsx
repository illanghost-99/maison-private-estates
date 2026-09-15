"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Mic, Square, PhoneOff, Calendar, Mail, Users, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultTasks } from "@/lib/admin-data";
import type { WorkTask, CalEvent } from "@/lib/admin-data";
import type { Followup } from "@/lib/followups";

const GREETS = ["Tjena chefen.", "Hej boss.", "Tjena topp säljaren.", "Hej Erfan. Körläge igång."];
type Scene = "idle" | "talk" | "listen" | "kalender" | "mejl" | "crm" | "uppgifter";

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

export default function KonferensPage() {
  const [authed, setAuthed] = useState(false);
  const [live, setLive] = useState(false);
  const [scene, setScene] = useState<Scene>("idle");
  const [hint, setHint] = useState("Tryck start och tillåt mikrofon");
  const [error, setError] = useState("");
  const recRef = useRef<SpeechRecognition | null>(null);
  const speakingRef = useRef(false);
  const liveRef = useRef(false);

  useEffect(() => {
    if (sessionStorage.getItem("maison_admin") === "1") setAuthed(true);
    const warm = () => window.speechSynthesis?.getVoices();
    warm();
    window.speechSynthesis?.addEventListener("voiceschanged", warm);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", warm);
  }, []);

  const startListenRef = useRef<() => void>(() => {});

  const speak = useCallback((text: string, after?: () => void) => {
    if (!window.speechSynthesis) {
      setError("Ingen talsyntes. Prova Safari.");
      after?.();
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "sv-SE";
    u.rate = 1;
    u.pitch = 0.8;
    u.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const sv = voices.find((v) => v.lang.toLowerCase().startsWith("sv"));
    if (sv) u.voice = sv;
    speakingRef.current = true;
    setScene("talk");
    u.onend = () => {
      speakingRef.current = false;
      after?.();
    };
    u.onerror = () => {
      speakingRef.current = false;
      after?.();
    };
    window.speechSynthesis.speak(u);
  }, []);

  const startListen = useCallback(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognition;
      webkitSpeechRecognition?: new () => SpeechRecognition;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setError("Lyssning saknas. Använd Safari eller Chrome.");
      return;
    }
    const rec = new SR();
    rec.lang = "sv-SE";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onstart = () => {
      setScene("listen");
      setHint("Lyssnar");
    };
    rec.onend = () => {
      if (liveRef.current && !speakingRef.current) {
        setTimeout(() => {
          try { rec.start(); } catch {}
        }, 300);
      }
    };
    rec.onerror = () => setHint("Hörde inget. Prata igen.");
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const text = e.results[0][0].transcript;
      if (!text) return;
      setHint("Hörde dig");
      const t = text.toLowerCase();
      if (/mejl|mail/.test(t)) {
        setScene("mejl");
        const fu = load<Followup[]>("maison_followups", []);
        save("maison_followups", fu.map((f) => f.status === "sent" || f.status === "skipped" ? f : { ...f, status: "sent" as const }));
        speak("Skickar mejlen.", startListenRef.current);
      } else if (/boka|möte|kalender/.test(t)) {
        setScene("kalender");
        const events = load<CalEvent[]>("maison_events", []);
        events.push({
          id: "e" + Date.now(),
          title: "Möte via konferens",
          start: new Date(Date.now() + 86400000).toISOString(),
          end: new Date(Date.now() + 90000000).toISOString(),
          type: "möte",
          notes: text,
        });
        save("maison_events", events);
        speak("Lagt in i kalendern.", startListenRef.current);
      } else if (/kund|crm/.test(t)) {
        setScene("crm");
        speak("Kunden är inne i CRM.", startListenRef.current);
      } else if (/ring|sms/.test(t)) {
        speak("Det ringer du.", startListenRef.current);
      } else {
        setScene("uppgifter");
        speak("Säg skicka mejl, boka möte eller lägg in kund.", startListenRef.current);
      }
    };
    recRef.current = rec;
    try { rec.start(); } catch { setError("Kunde inte starta mikrofon. Tryck start igen."); }
  }, [speak]);

  startListenRef.current = startListen;

  const start = async () => {
    setError("");
    liveRef.current = true;
    setLive(true);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      s.getTracks().forEach((tr) => tr.stop());
    } catch {
      setError("Tillåt mikrofonen.");
    }
    const tasks = load<WorkTask[]>("maison_tasks", defaultTasks);
    const p1 = tasks.filter((t) => t.priority === 1 && t.status !== "done");
    setScene("uppgifter");
    const text =
      GREETS[Math.floor(Math.random() * GREETS.length)] +
      " " +
      (p1.length ? "Viktigast idag: " + p1[0].title + ". " : "Inga akuta P1. ") +
      "Säg skicka mejl, boka möte eller lägg in kund.";
    speak(text, startListen);
  };

  const stop = () => {
    liveRef.current = false;
    setLive(false);
    setScene("idle");
    try { recRef.current?.stop(); } catch {}
    window.speechSynthesis?.cancel();
    setHint("Pausad");
  };

  if (!authed) {
    return (
      <div className="pt-32 text-center">
        <Link href="/admin" className="text-gold">Logga in i admin först</Link>
      </div>
    );
  }

  const Icon =
    scene === "kalender" ? Calendar : scene === "mejl" ? Mail : scene === "crm" ? Users : scene === "uppgifter" ? ListTodo : Mic;

  return (
    <div className="pt-28 pb-16 min-h-screen bg-black px-4 text-center">
      <p className="text-gold text-xs tracking-[0.25em] uppercase mb-2">Körläge</p>
      <h1 className="font-display text-4xl text-white mb-8">Konferens</h1>
      <div className="relative mx-auto mb-6 h-48 w-48">
        <div className={"absolute inset-0 rounded-full border border-gold/25 " + (live ? "animate-ping opacity-20" : "opacity-0")} />
        <div className="relative h-48 w-48 rounded-full gold-gradient flex items-center justify-center text-black">
          <Icon className="h-16 w-16" />
        </div>
      </div>
      <p className="text-gold text-sm mb-1">
        {scene === "kalender" ? "Kalender" : scene === "mejl" ? "Mejl" : scene === "crm" ? "Kund" : scene === "listen" ? "Lyssnar" : scene === "talk" ? "Pratar" : scene === "uppgifter" ? "Dagens lista" : "Redo"}
      </p>
      <p className="text-gray-500 text-xs mb-4">{hint}</p>
      {error && <p className="text-red-400 text-xs mb-4">{error}</p>}
      <button onClick={live ? stop : start} className="h-14 w-14 rounded-full border border-gold/40 text-gold inline-flex items-center justify-center">
        {live ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </button>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/admin"><Button variant="outline" size="sm">Admin</Button></Link>
        {live && <Button variant="ghost" size="sm" className="gap-2" onClick={stop}><PhoneOff className="h-4 w-4" />Avsluta</Button>}
      </div>
    </div>
  );
}
