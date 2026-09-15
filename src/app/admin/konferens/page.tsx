// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Mic, Send, PhoneOff } from "lucide-react";
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
  const [hint, setHint] = useState("Tryck en gång för att starta samtalet");
  const [input, setInput] = useState("");
  const [live, setLive] = useState(false);
  const [recOn, setRecOn] = useState(false);
  const [lines, setLines] = useState<{ who: string; text: string }[]>([]);
  const liveRef = useRef(false);
  const recOnRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const histRef = useRef<{ role: string; content: string }[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (sessionStorage.getItem("maison_admin") === "1") setAuthed(true);
  }, []);

  function playClip(text: string, after?: () => void) {
    const clip =
      /bokar|bokat|möte/i.test(text) ? "/audio/bokat.mp3" :
      /mejlen|skickar/i.test(text) ? "/audio/skickar.mp3" :
      /inne|kund/i.test(text) ? "/audio/inlagd.mp3" :
      /tjena|lyssnar|här/i.test(text) ? "/audio/greet.mp3" :
      "/audio/vad.mp3";
    const a = new Audio(clip);
    a.onended = () => after?.();
    a.onerror = () => after?.();
    a.play().catch(() => after?.());
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
    histRef.current = [...histRef.current, { role: "assistant", content: reply }].slice(-10);
    setLines((l) => [...l, { who: "Agent", text: reply }]);
    setHint("Agenten svarar");
    playClip(reply, () => {
      if (liveRef.current) startRec();
    });
  }

  async function sendText() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setLines((l) => [...l, { who: "Du", text }]);
    histRef.current = [...histRef.current, { role: "user", content: text }].slice(-10);
    await ask({ text });
  }

  async function startRec() {
    if (!liveRef.current || recOnRef.current) return;
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
      mr.onstop = async () => {
        recOnRef.current = false;
        setRecOn(false);
        clearTimeout(timerRef.current);
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/mp4" });
        if (!liveRef.current) return;
        if (blob.size < 800) {
          setHint("Inget tal. Lyssnar igen...");
          if (liveRef.current) setTimeout(() => startRec(), 400);
          return;
        }
        setLines((l) => [...l, { who: "Du", text: "(röst)" }]);
        const buf = await blob.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let bin = "";
        for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
        await ask({ audio: btoa(bin), mime: mr.mimeType || "audio/mp4" });
      };
      mr.start(250);
      recOnRef.current = true;
      setRecOn(true);
      setHint("Lyssnar – prata. Tryck igen för att skicka.");
      timerRef.current = setTimeout(() => {
        if (recRef.current && recRef.current.state === "recording") recRef.current.stop();
      }, 7000);
    } catch {
      setHint("Tillåt mikrofonen, eller skriv.");
    }
  }

  function stopRec() {
    clearTimeout(timerRef.current);
    try {
      if (recRef.current && recRef.current.state === "recording") recRef.current.stop();
    } catch {}
  }

  async function toggle() {
    if (!liveRef.current) {
      liveRef.current = true;
      setLive(true);
      try {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        setHint("Tillåt mikrofonen.");
        return;
      }
      setHint("Samtal igång");
      playClip("Tjena chefen. Jag lyssnar.", () => startRec());
      return;
    }
    if (recOnRef.current) stopRec();
    else startRec();
  }

  function endCall() {
    liveRef.current = false;
    setLive(false);
    stopRec();
    try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
    streamRef.current = null;
    setHint("Avslutat. Tryck för att starta igen.");
  }

  if (!authed) {
    return (
      <div className="pt-32 text-center">
        <Link href="/admin" className="text-gold">Logga in i admin först</Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-8 min-h-screen bg-black px-4 max-w-md mx-auto select-none" style={{ WebkitUserSelect: "none", WebkitTouchCallout: "none" }}>
      <p className="text-gold text-xs tracking-[0.25em] uppercase text-center">Konferens</p>
      <h1 className="font-display text-3xl text-white text-center mt-2 mb-4">Prata med agenten</h1>
      <p className="text-center text-gray-500 text-xs mb-4">{hint}</p>

      <div className="h-52 overflow-y-auto rounded-xl border border-gold/15 p-3 mb-5 space-y-2 select-text" style={{ WebkitUserSelect: "text" }}>
        {lines.length === 0 && (
          <p className="text-gray-600 text-sm">Tryck en gång på knappen. Sen rullar samtalet. Tryck Avsluta när du är klar.</p>
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
        onClick={toggle}
        className={"mx-auto mb-3 h-28 w-28 rounded-full flex items-center justify-center text-black " + (recOn ? "bg-white" : "gold-gradient")}
        style={{ touchAction: "manipulation", WebkitTouchCallout: "none", WebkitUserSelect: "none" }}
      >
        <Mic className="h-10 w-10" />
      </button>
      <p className="text-center text-[11px] text-gray-600 mb-4">
        {live ? (recOn ? "Lyssnar nu" : "Tryck för att prata") : "Tryck för att starta"}
      </p>

      {live && (
        <div className="text-center mb-5">
          <Button type="button" variant="ghost" size="sm" onClick={endCall} className="gap-2">
            <PhoneOff className="h-4 w-4" /> Avsluta samtal
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendText()}
          placeholder="Skriv om du vill"
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
