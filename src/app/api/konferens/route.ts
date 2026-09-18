// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { AGENT_SYSTEM } from "@/lib/agent-prompt";

function actionOf(text: string) {
  const t = text.toLowerCase();
  if (/boka|möte|visning|värdering|fotografering/.test(t)) return "book";
  if (/lägg in kund|ny kund/.test(t)) return "crm";
  if (/mejl|mail|uppfölj/.test(t)) return "mail";
  if (/lägg på listan|påminn|notera att|att göra/.test(t)) return "task";
  return "none";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = String(body.text || "").trim();
    const audio = String(body.audio || "");
    const mime = String(body.mime || "audio/mp4");
    const p1 = Array.isArray(body.p1) ? body.p1 : [];
    const history = Array.isArray(body.history) ? body.history.slice(-6) : [];
    if (!text && !audio) {
      return NextResponse.json({ reply: "Säg vad jag ska göra.", action: "none" });
    }

    const action = actionOf(text);
    const key = process.env.GEMINI_API_KEY;
    let reply = "";

    if (key) {
      const parts = [];
      if (text) parts.push({ text });
      if (audio) {
        parts.push({ text: "Lyssna och svara kort på svenska." });
        parts.push({ inline_data: { mime_type: String(mime).split(";")[0], data: audio } });
      }
      const contents = [
        ...history.map((h) => ({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: String(h.content || "") }],
        })),
        { role: "user", parts: parts.length ? parts : [{ text }] },
      ];
      const sys =
        AGENT_SYSTEM.replace("Svara BARA med JSON", "Svara i vanlig svenska. Ingen JSON.") +
        (p1.length ? " Viktigast idag: " + p1.slice(0, 3).join(". ") + "." : " Inget akut på listan.");
      for (const model of ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-1.5-flash", "gemini-flash-latest"]) {
        try {
          const res = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/" +
              model +
              ":generateContent?key=" +
              encodeURIComponent(key),
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: sys }] },
                contents,
                generationConfig: { maxOutputTokens: 120, temperature: 0.4 },
              }),
            }
          );
          if (!res.ok) continue;
          const data = await res.json();
          reply = String(data.candidates?.[0]?.content?.parts?.[0]?.text || "")
            .replace(/```json|```/g, "")
            .trim();
          if (reply.startsWith("{")) {
            try {
              const j = JSON.parse(reply);
              reply = String(j.reply || "");
            } catch {}
          }
          if (reply) break;
        } catch {}
      }
    }

    if (!reply) {
      if (/vad ska jag|idag|att göra|briefing/.test(text.toLowerCase())) {
        reply = p1.length
          ? "Börja med: " + p1[0] + "."
          : "Inget akut. Ring en het kund eller boka ett möte.";
      } else if (action === "book") reply = "Jag bokar det.";
      else if (action === "crm") reply = "Kunden är inne.";
      else if (action === "mail") reply = "Jag tar mejlen.";
      else if (action === "task") reply = "Det ligger på listan.";
      else reply = "Jag är med. Vad ska vi göra?";
    }

    return NextResponse.json({
      reply: reply.slice(0, 280),
      action,
      taskTitle: text.slice(0, 80),
      event: action === "book" ? { title: "Möte", notes: text, type: "möte" } : undefined,
    });
  } catch {
    return NextResponse.json({ reply: "Säg igen.", action: "none" });
  }
}
