// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Mic, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultTasks } from "@/lib/admin-data";
import type { WorkTask, CalEvent, CrmPerson } from "@/lib/admin-data";

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
  const [hint, setHint] = useState("Skriv eller håll inne mikrofonen");
  const [input, setInput] = useState("");
  const [holding, setHolding] = useState(false);
  const [lines, setLines] = useState<{ who: string; text: string }[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const histRef = useRef<{ role: string; content: string }[]>([]);

  useEffect(() => {
    if (sessionStorage.getItem("maison_admin") === "1") setAuthed(true);
  }, []);

  function playClip(text: string) {
    const clip =
      /bokar|bokat|möte/i.test(text) ? "/audio/bokat.mp3" :
      /mejlen|skickar/i.test(text) ? "/audio/skickar.mp3" :
      /inne|kund/i.test(text) ? "/audio/inlagd.mp3" :
      /tjena|lyssnar|här/i.test(text) ? "/audio/greet.mp3" :
      "/audio/vad.mp3";
    const a = new Audio(clip);
    a.play().catch(() => {});
  }

  async function ask(payload: Record<string, unknown>) {
    setHint("Tänker...");
    const tasks = load<WorkTask[]>("maison_tasks", defaultTasks);
    const p1 = tasks.filter((x) => x.priority === 1 && x.status !== "done").map((x) => x.title);
    const res = await fetch("/api/konferens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, p1, history: histRef.current }),
    });
    const data = await res.json();
    const reply = data.reply || "Okej.";
    if (data.action === "book") {
      const events = load<CalEvent[]>("maison_events", []);
      events.push({
        id: "e" + Date.now(),
        title: "Möte via konferens",
        start: new Date(Date.now() + 86400000).toISOString(),
        end: new Date(Date.now() + 90000000).toISOString(),
        type: "möte",
        notes: String(payload.text || ""),
      });
      save("maison_events", events);
    }
    if (data.action === "crm") {
      const crm = load<CrmPerson[]>("maison_crm", []);
      crm.unshift({
        id: "c" + Date.now(),
        firstName: "Kund",
        lastName: "",
        phone: "",
        email: "",
        stage: "ny",
        intent: "okänt",
        score: 70,
        area: "Konferens",
        lastTouch: "Nu",
        nextStep: "Ring",
        notes: String(payload.text || ""),
        source: "Konferens",
        flag: "📳",
      });
      save("maison_crm", crm.slice(0, 80));
    }
    histRef.current = [...histRef.current, { role: "assistant", content: reply }].slice(-10);
    setLines((l) => [...l, { who: "Agent", text: reply }]);
    setHint("Skriv eller håll inne mikrofonen");
    playClip(reply);
  }

  async function sendText() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setLines((l) => [...l, { who: "Du", text }]);
    histRef.current = [...histRef.current, { role: "user", content: text }].slice(-10);
    await ask({ text });
  }

  async function holdStart(e: any) {
    e.preventDefault();
    try {
      const stream = streamRef.current || (await navigator.mediaDevices.getUserMedia({ audio: true }));
      streamRef.current = stream;
      chunksRef.current = [];
      const mime = MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : "audio/webm";
      const mr = new MediaRecorder(stream, { mimeType: mime });
      recRef.current = mr;
      mr.ondataavailable = (ev) => {
        if (ev.data && ev.data.size) chunksRef.current.push(ev.data);
      };
      mr.start(200);
      setHolding(true);
      setHint("Pratar... släpp för att skicka");
    } catch {
      setHint("Tillåt mikrofonen, eller skriv i stället.");
    }
  }

  function holdEnd(e: any) {
    e.preventDefault();
    setHolding(false);
    const mr = recRef.current;
    if (!mr || mr.state === "inactive") return;
    mr.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/mp4" });
      if (blob.size < 600) {
        setHint("För kort. Håll längre eller skriv.");
        return;
      }
      setLines((l) => [...l, { who: "Du", text: "(röst)" }]);
      const buf = await blob.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let bin = "";
      for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      await ask({ audio: btoa(bin), mime: mr.mimeType || "audio/mp4" });
    };
    try { mr.stop(); } catch {}
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
      <h1 className="font-display text-3xl text-white text-center mt-2 mb-4">Prata med agenten</h1>
      <p className="text-center text-gray-500 text-xs mb-4">{hint}</p>

      <div className="h-56 overflow-y-auto rounded-xl border border-gold/15 p-3 mb-5 space-y-2">
        {lines.length === 0 && (
          <p className="text-gray-600 text-sm">Inget ännu. Skriv “boka möte” eller håll inne mikrofonen.</p>
        )}
        {lines.map((m, i) => (
          <p key={i} className={m.who === "Agent" ? "text-gold text-sm" : "text-white text-sm"}>
            <span className="text-gray-600 mr-2">{m.who}</span>
            {m.text}
          </p>
        ))}
      </div>

      <button
        type="button"
        className={"mx-auto mb-5 h-28 w-28 rounded-full flex items-center justify-center text-black " + (holding ? "bg-white scale-105" : "gold-gradient")}
        style={{ touchAction: "none" }}
        onPointerDown={holdStart}
        onPointerUp={holdEnd}
        onPointerCancel={holdEnd}
        onTouchStart={holdStart}
        onTouchEnd={holdEnd}
      >
        <Mic className="h-10 w-10" />
      </button>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendText()}
          placeholder="Skriv här om rösten strular"
          className="flex-1 rounded-lg bg-white/5 border border-gold/20 px-3 py-3 text-white text-sm"
        />
        <Button type="button" onClick={sendText} className="shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-center mt-6">
        <Link href="/admin" className="text-xs text-gray-500">Tillbaka till admin</Link>
      </div>
    </div>
  );
}
