import { NextRequest, NextResponse } from "next/server";

type Turn = { role: "user" | "assistant"; content: string };

const SYSTEM = `Du är Erfans personliga mäklaragent i konferens. Svenska. Kort. Som ett samtal i bilen.
Max 2 korta meningar. Inte robot. Inte humor. Inte emoji.
Du får: skicka mejl, lägga in kund, boka möte, gå igenom dagens lista.
Du får INTE ringa eller sms:a. Säg att Erfan tar det.
Om han frågar vad som är viktigt, använd P1-listan.
Svara på det han nyss sa. Fortsätt samtalet.`;

function localReply(text: string, p1: string[], _history: Turn[]) {
  const t = text.toLowerCase();
  if (/skicka.*(mejl|mail)|uppfölj/.test(t)) return { reply: "Då skickar jag uppföljningsmejlen nu.", action: "mail" };
  if (/boka|nytt möte|lägg in möte/.test(t)) return { reply: "Jag lägger in mötet i kalendern.", action: "book" };
  if (/lägg in kund|ny kund/.test(t)) return { reply: "Kunden är inne.", action: "crm" };
  if (/vad ska jag|dagens|viktigt|lista/.test(t)) {
    return {
      reply: p1.length ? "Först: " + p1[0] + ". Sen tar vi resten." : "Inget akut. Vad vill du att jag gör?",
      action: "brief",
    };
  }
  if (/ring|sms/.test(t)) return { reply: "Det ringer du. Jag tar mejl och kalender.", action: "none" };
  if (/hej|tjena|hallå|hör du/.test(t)) return { reply: "Här. Jag lyssnar.", action: "none" };
  if (/tack|bra|ok|okej/.test(t)) return { reply: "Kör.", action: "none" };
  return { reply: "Uppfattat, " + text.slice(0, 60) + ". Ska jag göra något med det?", action: "none" };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = String(body.text || "").trim();
    const p1: string[] = Array.isArray(body.p1) ? body.p1 : [];
    const history: Turn[] = Array.isArray(body.history) ? body.history.slice(-8) : [];
    if (!text) return NextResponse.json({ reply: "Säg igen.", action: "none" });

    const key = process.env.OPENAI_API_KEY;
    if (key) {
      const messages = [
        { role: "system", content: SYSTEM + (p1.length ? " P1 idag: " + p1.join("; ") : "") },
        ...history.map((h) => ({ role: h.role, content: h.content })),
        { role: "user", content: text },
      ];
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.4,
          max_tokens: 80,
          messages,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const reply = String(data.choices?.[0]?.message?.content || "").trim() || "Okej.";
        let action = "none";
        const low = (text + " " + reply).toLowerCase();
        if (/mejl|mail/.test(low)) action = "mail";
        if (/boka|möte/.test(low)) action = "book";
        if (/kund/.test(low)) action = "crm";
        return NextResponse.json({ reply, action });
      }
    }

    return NextResponse.json(localReply(text, p1, history));
  } catch {
    return NextResponse.json({ reply: "Säg igen.", action: "none" });
  }
}
