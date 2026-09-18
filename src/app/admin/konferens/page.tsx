// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Mic, Send, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultTasks } from "@/lib/admin-data";
import type { WorkTask, CalEvent } from "@/lib/admin-data";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
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
  const [hint, setHint] = useState("Tryck på mikrofonen och prata");
  const [live, setLive] = useState(false);
  const [listening, setListening] = useState(false);
  const [draft, setDraft] = useState("");
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<{ who: string; text: string }[]>([]);
  const liveRef = useRef(false);
  const recRef = useRef<any>(null);
  const busyRef = useRef(false);
  const histRef = useRef<{ role: string; content: string }[]>([]);

  useEffect(() => {
    if (sessionStorage.getItem("maison_admin") === "1") setAuthed(true);
  }, []);

  function speakOut(text: string, after?: () => void) {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      after?.();
    };
    setTimeout(finish, 4000);
    try { window.speechSynthesis?.cancel(); } catch {}
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "sv-SE";
    u.rate = 1.08;
    u.pitch = 0.85;
    const voices = window.speechSynthesis?.getVoices?.() || [];
    const sv = voices.find((v) => /sv/i.test(v.lang));
    if (sv) u.voice = sv;
    u.onend = finish;
    u.onerror = finish;
    try { window.speechSynthesis?.speak(u); } catch { finish(); }
  }

  async function sendToAgent(text: string) {
    if (!text || busyRef.current) return;
    busyRef.current = true;
    setDraft("");
    setLines((l) => [...l, { who: "Du", text }]);
    histRef.current = [...histRef.current, { role: "user", content: text }].slice(-10);
    setHint("Skickar till agenten...");
    const tasks = load<WorkTask[]>("maison_tasks", defaultTasks);
    const p1 = tasks.filter((x) => x.priority === 1 && x.status !== "done").map((x) => x.title);
    try {
      const res = await fetch("/api/konferens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, p1, history: histRef.current }),
      });
      const data = await res.json();
      const reply = data.reply || "Okej.";
      if (data.action === "book") {
        const events = load<CalEvent[]>("maison_events", []);
        events.push({
          id: "e" + Date.now(),
          title: data.event?.title || "Möte via konferens",
          start: new Date(Date.now() + 86400000).toISOString(),
          end: new Date(Date.now() + 90000000).toISOString(),
          type: "möte",
          notes: text,
        });
        save("maison_events", events);
      }
      if (data.action === "task") {
        const all = load<WorkTask[]>("maison_tasks", defaultTasks);
        all.unshift({
          id: "k" + Date.now(),
          title: data.taskTitle || text.slice(0, 80),
          why: "Från konferens",
          priority: (data.taskPriority === 1 || data.taskPriority === 2 ? data.taskPriority : 3) as 1 | 2 | 3,
          owner: data.taskPriority === 1 ? "erfan" : "agent",
          status: "open",
        });
        save("maison_tasks", all);
      }
      histRef.current = [...histRef.current, { role: "assistant", content: reply }].slice(-10);
      setLines((l) => [...l, { who: "Agent", text: reply }]);
      setHint("Svarar...");
      speakOut(reply, () => {
        busyRef.current = false;
        if (liveRef.current) startListen();
        else setHint("Tryck på mikrofonen");
      });
    } catch {
      busyRef.current = false;
      setHint("Fel. Försök igen.");
    }
  }

  function startListen() {
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setHint("Ingen diktering. Använd tangentbordets mikrofon i fältet.");
      return;
    }
    try { recRef.current?.stop(); } catch {}
    const rec = new SR();
    rec.lang = "sv-SE";
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.onstart = () => {
      setListening(true);
      setHint("Lyssnar");
    };
    rec.onresult = (e: any) => {
      let said = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        said += e.results[i][0].transcript;
      }
      said = said.trim();
      setDraft(said);
      const last = e.results[e.results.length - 1];
      if (last?.isFinal && said) {
        try { rec.stop(); } catch {}
        sendToAgent(said);
      }
    };
    rec.onend = () => {
      setListening(false);
    };
    rec.onerror = () => {
      setListening(false);
      setHint("Hörde inte. Tryck igen eller använd tangentbordets mikrofon.");
    };
    recRef.current = rec;
    try { rec.start(); } catch {
      setHint("Tryck igen.");
    }
  }

  function toggle() {
    if (listening) {
      try { recRef.current?.stop(); } catch {}
      if (draft) sendToAgent(draft);
      return;
    }
    liveRef.current = true;
    setLive(true);
    startListen();
  }

  function endCall() {
    liveRef.current = false;
    setLive(false);
    setListening(false);
    try { recRef.current?.stop(); } catch {}
    try { window.speechSynthesis?.cancel(); } catch {}
    setHint("Avslutat");
  }

  if (!authed) {
    return (
      <div className="pt-32 text-center">
        <Link href="/admin" className="text-gold">Logga in i admin först</Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-8 min-h-screen bg-black px-4 max-w-md mx-auto">
      <p className="text-gold text-xs tracking-[0.25em] uppercase text-center">Konferens</p>
      <h1 className="font-display text-3xl text-white text-center mt-2 mb-3">Prata med agenten</h1>
      <p className="text-center text-gray-500 text-xs mb-3">{hint}</p>

      <div className="h-48 overflow-y-auto rounded-xl border border-gold/15 p-3 mb-5 space-y-2">
        {lines.length === 0 && (
          <p className="text-gray-600 text-sm text-center">Tryck på mikrofonen. Prata. Agenten svarar.</p>
        )}
        {lines.map((m, i) => (
          <p key={i} className={m.who === "Agent" ? "text-gold text-sm" : "text-white text-sm"}>
            <span className="text-gray-600 mr-2">{m.who}</span>{m.text}
          </p>
        ))}
      </div>

      <button
        type="button"
        onClick={toggle}
        className={"mx-auto mb-2 h-24 w-24 rounded-full flex items-center justify-center " + (listening ? "bg-white text-black" : "gold-gradient text-black")}
        style={{ touchAction: "manipulation" }}
      >
        <Mic className="h-9 w-9" />
      </button>
      <p className="text-center text-[11px] text-gray-600 mb-4">
        {listening ? "Spelar in – tryck igen för att skicka" : "Tryck för att diktera"}
      </p>

      {live && (
        <div className="text-center mb-4">
          <Button type="button" variant="ghost" size="sm" onClick={endCall} className="gap-2">
            <PhoneOff className="h-4 w-4" /> Avsluta
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) {
              sendToAgent(input.trim());
              setInput("");
            }
          }}
          placeholder="Skriv bara om du måste"
          className="flex-1 rounded-lg bg-white/5 border border-gold/20 px-3 py-3 text-white text-sm"
          inputMode="text"
          autoComplete="off"
        />
        <Button type="button" onClick={() => { if (input.trim()) { sendToAgent(input.trim()); setInput(""); } }}>
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-center mt-6">
        <Link href="/admin" className="text-xs text-gray-500">Tillbaka till admin</Link>
      </div>
    </div>
  );
}
