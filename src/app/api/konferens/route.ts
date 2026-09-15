// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";

const SYSTEM = `Du är Erfans kollega. Svenska. Korta meningar. Rak. Ingen emoji.
Bekräfta bokning, kund eller mejl om han ber om det. Ring inte.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = String(body.text || "").trim();
    const audio = String(body.audio || "");
    const mime = String(body.mime || "audio/mp4");
    const p1 = Array.isArray(body.p1) ? body.p1 : [];
    const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
    if (!text && !audio) {
      return NextResponse.json({ reply: "Säg eller skriv något.", action: "none" });
    }

    const t = (text || "").toLowerCase();
    let action = "none";
    if (/mejl|mail|uppfölj/.test(t)) action = "mail";
    if (/boka|möte/.test(t)) action = "book";
    if (/kund/.test(t)) action = "crm";

    const key = process.env.GEMINI_API_KEY;
    let reply = "";

    if (key) {
      const parts = [];
      if (text) parts.push({ text });
      if (audio) {
        parts.push({ text: "Lyssna på ljudet och svara kort på svenska." });
        parts.push({ inline_data: { mime_type: mime.split(";")[0], data: audio } });
      }
      const contents = [
        ...history.map((h) => ({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: String(h.content || "") }],
        })),
        { role: "user", parts },
      ];
      for (const model of ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash"]) {
        const res = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/" +
            model +
            ":generateContent?key=" +
            encodeURIComponent(key),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: SYSTEM + (p1[0] ? " Först idag: " + p1[0] : "") }],
              },
              contents,
              generationConfig: { maxOutputTokens: 160, temperature: 0.5 },
            }),
          }
        );
        if (!res.ok) continue;
        const data = await res.json();
        reply = String(data.candidates?.[0]?.content?.parts?.[0]?.text || "").trim();
        if (reply) break;
      }
    }

    if (!reply) {
      if (action === "mail") reply = "Då skickar jag mejlen.";
      else if (action === "book") reply = "Jag bokar det.";
      else if (action === "crm") reply = "Kunden är inne.";
      else reply = text ? "Uppfattat." : "Skriv i fältet om mikrofonen strular.";
    }

    return NextResponse.json({
      reply,
      action,
      event: action === "book" ? { title: "Möte", notes: text, type: "möte" } : undefined,
      person: action === "crm" ? { firstName: "Kund", notes: text } : undefined,
    });
  } catch {
    return NextResponse.json({ reply: "Säg igen.", action: "none" });
  }
}
