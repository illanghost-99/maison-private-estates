// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { AGENT_SYSTEM } from "@/lib/agent-prompt";

function parseAgent(raw: string) {
  const t = String(raw || "").trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      const j = JSON.parse(t.slice(start, end + 1));
      return {
        reply: String(j.reply || "").trim(),
        action: String(j.action || "none"),
        taskTitle: String(j.taskTitle || ""),
        taskPriority: Number(j.taskPriority || 3),
      };
    } catch {}
  }
  return { reply: t.replace(/[{}"]/g, " ").slice(0, 240), action: "none", taskTitle: "", taskPriority: 3 };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = String(body.text || "").trim();
    const audio = String(body.audio || "");
    const mime = String(body.mime || "audio/mp4");
    const p1 = Array.isArray(body.p1) ? body.p1 : [];
    const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
    if (!text && !audio) {
      return NextResponse.json({ reply: "Säg vad jag ska göra.", action: "none" });
    }

    const key = process.env.GEMINI_API_KEY;
    let parsed = { reply: "", action: "none", taskTitle: "", taskPriority: 3 };

    if (key) {
      const parts = [];
      if (text) parts.push({ text: "Erfan säger: " + text });
      if (audio) {
        parts.push({ text: "Lyssna. Transkribera tyst och svara i JSON." });
        parts.push({ inline_data: { mime_type: mime.split(";")[0], data: audio } });
      }
      const contents = [
        ...history.map((h) => ({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: String(h.content || "") }],
        })),
        { role: "user", parts },
      ];
      const ctx =
        AGENT_SYSTEM +
        (p1.length ? "\nÖPPNA VIKTIGA UPPGIFTER: " + p1.join("; ") : "");
      for (const model of ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-1.5-flash"]) {
        const res = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/" +
            model +
            ":generateContent?key=" +
            encodeURIComponent(key),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: ctx }] },
              contents,
              generationConfig: { maxOutputTokens: 220, temperature: 0.45 },
            }),
          }
        );
        if (!res.ok) continue;
        const data = await res.json();
        const raw = String(data.candidates?.[0]?.content?.parts?.[0]?.text || "").trim();
        if (!raw) continue;
        parsed = parseAgent(raw);
        if (parsed.reply) break;
      }
    }

    const low = text.toLowerCase();
    if (parsed.action === "none") {
      if (/boka|möte|visning|värdering|foto/.test(low)) parsed.action = "book";
      else if (/lägg in kund|ny kund/.test(low)) parsed.action = "crm";
      else if (/mejl|mail|uppfölj/.test(low)) parsed.action = "mail";
      else if (/lägg på listan|påminn|att göra|notera/.test(low)) parsed.action = "task";
    }
    if (!parsed.reply) {
      parsed.reply =
        parsed.action === "book" ? "Jag bokar det." :
        parsed.action === "crm" ? "Kunden är inne." :
        parsed.action === "mail" ? "Jag tar mejlen." :
        parsed.action === "task" ? "Det ligger på listan." :
        text ? "Okej. Jag hörde dig." : "Säg vad jag ska göra.";
    }

    return NextResponse.json({
      reply: parsed.reply,
      action: parsed.action,
      taskTitle: parsed.taskTitle || text.slice(0, 80),
      taskPriority: parsed.taskPriority === 1 || parsed.taskPriority === 2 ? parsed.taskPriority : 3,
      event: parsed.action === "book" ? { title: parsed.taskTitle || "Möte", notes: text, type: "möte" } : undefined,
      person: parsed.action === "crm" ? { firstName: "Kund", notes: text } : undefined,
    });
  } catch {
    return NextResponse.json({ reply: "Säg igen.", action: "none" });
  }
}
