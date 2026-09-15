"use client";

import { useState } from "react";
import { Calendar, CheckCircle2, MapPin, User, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BokaVarderingPage() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    type: "lagenhet",
    message: "",
    preferredDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSending(true);
    const parts = form.name.trim().split(/\s+/);
    const firstName = parts[0] || form.name;
    const lastName = parts.slice(1).join(" ") || "–";
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email: form.email,
          phone: form.phone,
          type: "värdering / möte",
          preferredTime: form.preferredDate,
          message:
            (form.message || "Bokning via formulär") +
            (form.address ? "\nAdress: " + form.address : "") +
            "\nBostadstyp: " + form.type,
          booking: true,
          forceNotify: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kunde inte skicka");
      const { pushToCrm } = await import("@/lib/crm-client");
      pushToCrm({
        firstName,
        lastName,
        phone: form.phone,
        email: form.email,
        message: form.message || "Bokning via formulär",
        flag: "hot",
        source: "Bokningsformulär",
        type: "värdering / möte",
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte skicka");
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-28 pb-20 min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="h-16 w-16 rounded-full bg-gold/15 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-gold" />
          </div>
          <h1 className="font-display text-3xl text-white mb-4">
            Tack för din förfrågan
          </h1>
          <p className="text-gray-400 mb-8">
            Vi har tagit emot din bokningsförfrågan. En av våra mäklare
            återkommer inom 24 timmar för att bekräfta tid och detaljer.
          </p>
          <Button onClick={() => setSubmitted(false)} variant="outline">
            Skicka en till
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-gold text-sm tracking-[0.2em] uppercase mb-3">
            Kostnadsfri
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-white mb-4">
            Boka värdering
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Få en professionell och diskret värdering av din bostad. Vi återkommer
            inom 24 timmar.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-black-card border border-gold/15 p-8 space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                <User className="inline h-3.5 w-3.5 mr-1.5 text-gold" />
                Namn *
              </label>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-gold/40 transition-colors"
                placeholder="Ditt fullständiga namn"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                <Mail className="inline h-3.5 w-3.5 mr-1.5 text-gold" />
                E-post *
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-gold/40 transition-colors"
                placeholder="namn@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                <Phone className="inline h-3.5 w-3.5 mr-1.5 text-gold" />
                Telefon *
              </label>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-gold/40 transition-colors"
                placeholder="070-123 45 67"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Typ av bostad
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/40 transition-colors"
              >
                <option value="lagenhet">Lägenhet</option>
                <option value="villa">Villa</option>
                <option value="radhus">Radhus</option>
                <option value="parhus">Parhus</option>
                <option value="fritidshus">Fritidshus</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              <MapPin className="inline h-3.5 w-3.5 mr-1.5 text-gold" />
              Adress *
            </label>
            <input
              required
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-gold/40 transition-colors"
              placeholder="Gatuadress, postnummer och ort"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              <Calendar className="inline h-3.5 w-3.5 mr-1.5 text-gold" />
              Önskat datum
            </label>
            <input
              type="date"
              value={form.preferredDate}
              onChange={(e) =>
                setForm({ ...form, preferredDate: e.target.value })
              }
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/40 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Meddelande
            </label>
            <textarea
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-gold/40 transition-colors resize-none"
              placeholder="Berätta gärna mer om bostaden eller dina önskemål..."
            />
          </div>

          <div className="pt-2">
            {error && <p className="text-sm text-danger text-center mb-3">{error}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={sending}>
              {sending ? "Skickar…" : "Skicka förfrågan"}
            </Button>
            <p className="text-[11px] text-gray-600 text-center mt-4">
              Genom att skicka godkänner du att vi behandlar dina uppgifter
              enligt vår integritetspolicy. Vi kontaktar dig endast angående
              denna förfrågan.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
