"use client";

import { useEffect, useState } from "react";
import { X, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function EmailModal({ open, onClose }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setDone(false);
      setError("");
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, phone, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Något gick fel");
      try {
        const key = "maison_inbox";
        const prev = JSON.parse(localStorage.getItem(key) || "[]");
        prev.unshift({
          id: Date.now().toString(),
          name: firstName + " " + lastName,
          firstName,
          lastName,
          email,
          phone,
          message,
          score: data.score,
          serious: data.serious,
          telegram: data.telegramSent,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem(key, JSON.stringify(prev.slice(0, 50)));
      } catch {}
      setDone(true);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte skicka");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-gold/20 bg-black-soft shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5"
        >
          <X className="h-4 w-4" />
        </button>

        {done ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-gold mx-auto mb-4" />
            <h3 className="font-display text-xl text-white mb-2">Tack!</h3>
            <p className="text-sm text-gray-400 mb-6">
              Ditt meddelande är mottaget. Vid seriöst intresse kontaktas mäklaren
              direkt så att ni kan komma vidare snabbt.
            </p>
            <Button onClick={onClose}>Stäng</Button>
          </div>
        ) : (
          <>
            <h3 className="font-display text-xl text-white mb-1">Skriv till oss</h3>
            <p className="text-sm text-gray-500 mb-5">
              Lämna dina uppgifter så återkommer vi. AI-assistenten bedömer ärendet
              och vid starkt intresse aviseras mäklaren direkt.
            </p>
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Förnamn"
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-gold/40"
                />
                <input
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Efternamn"
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-gold/40"
                />
              </div>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Din e-post"
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-gold/40"
              />
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Telefonnummer"
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-gold/40"
              />
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Vad kan vi hjälpa dig med?"
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-gold/40 resize-none"
              />
              {error && <p className="text-xs text-danger">{error}</p>}
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                <Send className="h-4 w-4" />
                {loading ? "Skickar…" : "Skicka meddelande"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export function EmailTrigger({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          "text-left underline-offset-2 hover:underline hover:text-gold transition-colors cursor-pointer bg-transparent border-0 p-0 font-inherit " +
          className
        }
      >
        erfan@maison-estates.se
      </button>
      <EmailModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
