// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";

type Turn = { role: "user" | "assistant"; content: string };

const SYSTEM = `Du är Erfans kollega i luren. Man, 30, lugn, rak. Ni känner varandra.
Prata som en människa i bilen: korta meningar, vardagssvenska, inga listor, inga emojis.
Svara på precis det han sa. Ställ en följdfråga bara om du saknar namn, tid eller telefon.
Hjälp honom sälja mer: möten, uppföljning, prioritering.
Använd verktyg när han vill boka möte, lägga in kund eller skicka mejl.
Du ringer och smsar inte. Det gör han.
Inte säljcoach. Inte robot. Inte "hur kan jag hjälpa dig idag".`;

const tools = [
  {
    type: "function",
    function: {
      name: "boka_mote",
      description: "Lägg ett kundmöte i kalendern.",
      parameters: {
        type: "object",
        properties: {
          namn: { type: "string" },
          telefon: { type: "string" },
          epost: { type: "string" },
          när: { type: "string", description: "Tid i klartext, t.ex. imorgon 10" },
          typ: { type: "string", enum: ["möte", "visning", "värdering", "fotografering"] },
          anteckning: { type: "string" },
        },
        required: ["namn"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "lagg_in_kund",
      description: "Lägg en kund i CRM.",
      parameters: {
        type: "object",
        properties: {
          fornamn: { type: "string" },
          efternamn: { type: "string" },
          telefon: { type: "string" },
          epost: { type: "string" },
          anteckning: { type: "string" },
        },
        required: ["fornamn"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "skicka_uppfoljning",
      description: "Skicka dagens uppföljningsmejl.",
      parameters: { type: "object", properties: {} },
    },
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = String(body.text || "").trim();
    const p1: string[] = Array.isArray(body.p1) ? body.p1 : [];
    const history: Turn[] = Array.isArray(body.history) ? body.history.slice(-10) : [];
    if (!text) return NextResponse.json({ reply: "Säg igen.", action: "none" });

    const t = text.toLowerCase();
    if (/skicka.*(mejl|mail)|uppfölj/.test(t))
      return NextResponse.json({ reply: "Då skickar jag mejlen.", action: "mail" });
    if (/boka|nytt möte|lägg in möte/.test(t))
      return NextResponse.json({
        reply: "Jag bokar det.",
        action: "book",
        event: { title: "Möte via konferens", notes: text, type: "möte" },
      });
    if (/lägg in kund|ny kund/.test(t))
      return NextResponse.json({
        reply: "Kunden är inne.",
        action: "crm",
        person: { firstName: "Kund", notes: text },
      });
    if (/vad ska jag|dagens|viktigt|lista/.test(t))
      return NextResponse.json({
        reply: p1.length ? "Först: " + p1[0] + "." : "Inget akut just nu.",
        action: "brief",
      });
    if (/ring|sms/.test(t))
      return NextResponse.json({ reply: "Det tar du.", action: "none" });
    if (/hej|tjena|hallå|hör du/.test(t))
      return NextResponse.json({ reply: "Här. Jag lyssnar.", action: "none" });

    const gemini = process.env.GEMINI_API_KEY;
    if (gemini) {
      const contents = [
        ...history.map((h) => ({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }],
        })),
        { role: "user", parts: [{ text }] },
      ];
      const g = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + gemini,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: SYSTEM + (p1.length ? " Viktigast idag: " + p1.join("; ") + "." : "") }],
            },
            contents,
            generationConfig: { maxOutputTokens: 120, temperature: 0.6 },
          }),
        }
      );
      if (g.ok) {
        const data = await g.json();
        const reply = String(data.candidates?.[0]?.content?.parts?.[0]?.text || "").trim();
        if (reply) return NextResponse.json({ reply, action: "none" });
      }
    }

    return NextResponse.json({
      reply: "Uppfattat. Ska jag boka, lägga in kund eller skicka mejl?",
      action: "none",
    });

  } catch {
    return NextResponse.json({ reply: "Säg igen.", action: "none" });
  }
}
