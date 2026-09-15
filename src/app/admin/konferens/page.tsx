"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Mic, Square, PhoneOff, Calendar, Mail, Users, ListTodo, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultTasks } from "@/lib/admin-data";
import type { WorkTask, CalEvent } from "@/lib/admin-data";

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
  const [muted, setMuted] = useState(false);
  const recRef = useRef<any>(null);
  const speakingRef = useRef(false);
  const liveRef = useRef(false);
  const mutedRef = useRef(false);
  const historyRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);
  const wakeRef = useRef<any>(null);

  useEffect(() => {
    if (sessionStorage.getItem("maison_admin") === "1") setAuthed(true);
    const warm = () => window.speechSynthesis?.getVoices();
    warm();
    if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = warm;
    return () => { if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const startListenRef = useRef<() => void>(() => {});

  const speak = useCallback((text: string, after?: () => void) => {
    speakingRef.current = true;
    mutedRef.current = true;
    setMuted(true);
    setScene("talk");
    setHint("Agenten svarar");
    const src = /tjena chefen/i.test(text)
      ? "/audio/greet.mp3"
      : "/api/tts?q=" + encodeURIComponent(text);
    const audio = new Audio(src);
    audio.volume = 1;
    const done = () => {
      speakingRef.current = false;
      mutedRef.current = false;
      setMuted(false);
      setHint("Din tur – prata");
      setScene("listen");
      after?.();
    };
    audio.onended = done;
    audio.onerror = done;
    audio.play().catch(() => done());
  }, []);

  const startListen = useCallback(() => {
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setError("Lyssning saknas. Använd Safari eller Chrome.");
      return;
    }
    const rec = new SR();
    rec.lang = "sv-SE";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.onstart = () => {
      setScene("listen");
      setHint("Lyssnar");
    };
    rec.onend = () => {
      if (liveRef.current) {
        try { rec.start(); } catch {}
      }
    };
    rec.onerror = (ev: any) => {
      if (liveRef.current && ev?.error !== "aborted") {
        try { rec.start(); } catch {}
      }
    };
    rec.onresult = (e: any) => {
      if (mutedRef.current || speakingRef.current) return;
      const last = e.results[e.results.length - 1];
      if (!last?.isFinal) return;
      const text = String(last[0]?.transcript || "").trim();
      if (!text) return;
      setHint("Hörde dig");
      historyRef.current = [...historyRef.current, { role: "user", content: text }].slice(-10);
      const tasks = load<WorkTask[]>("maison_tasks", defaultTasks);
      const p1 = tasks.filter((x) => x.priority === 1 && x.status !== "done").map((x) => x.title);
      fetch("/api/konferens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, p1, history: historyRef.current }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.action === "book") {
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
          } else if (data.action === "mail") setScene("mejl");
          else if (data.action === "crm") setScene("crm");
          const reply = data.reply || "Okej.";
          historyRef.current = [...historyRef.current, { role: "assistant", content: reply }].slice(-10);
          speak(reply);
        })
        .catch(() => speak("Säg igen."));
    };
    recRef.current = rec;
    try { rec.start(); } catch { setError("Kunde inte starta mikrofon. Tryck start igen."); }
  }, [speak]);

  startListenRef.current = startListen;

  const start = () => {
    setError("");
    liveRef.current = true;
    setLive(true);
    setScene("uppgifter");
    speak("Tjena chefen. Jag lyssnar.", startListen);
    navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {
      setError("Tillåt mikrofonen.");
    });
    navigator.wakeLock?.request("screen").then((s: any) => {
      wakeRef.current = s;
    }).catch(() => {});
  };

  const stop = () => {
    liveRef.current = false;
    setLive(false);
    setScene("idle");
    try { recRef.current?.stop(); } catch {}
    try { wakeRef.current?.release(); } catch {}
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
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={live ? stop : start}
          className="h-14 w-14 rounded-full border border-gold/40 text-gold inline-flex items-center justify-center"
        >
          {live ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>
        {live && (
          <button
            onClick={() => {
              const next = !muted;
              mutedRef.current = next;
              setMuted(next);
              setHint(next ? "Ljud av – agenten svarar" : "Din tur – prata");
              setScene(next ? "talk" : "listen");
            }}
            className={
              "h-14 w-14 rounded-full inline-flex items-center justify-center transition-all " +
              (muted
                ? "gold-gradient text-black shadow-lg shadow-gold/40"
                : "border border-white/20 text-gray-500")
            }
            aria-label={muted ? "Ljud av" : "Öppna mikrofon"}
          >
            {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
        )}
      </div>
      {live && (
        <p className="text-[11px] text-gray-600 mt-2">
          {muted ? "Mikrofon av – agenten pratar ostört" : "Mikrofon på – prata nu"}
        </p>
      )}
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/admin"><Button variant="outline" size="sm">Admin</Button></Link>
        {live && <Button variant="ghost" size="sm" className="gap-2" onClick={stop}><PhoneOff className="h-4 w-4" />Avsluta</Button>}
      </div>
    </div>
  );
}
