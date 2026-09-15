// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";

type Turn = { role: "user" | "assistant"; content: string };

const SYSTEM = `Du är Erfans kollega i luren. Man, lugn, rak. Ni jobbar ihop.
Svenska. Korta meningar. Vardagsspråk. Inga emojis. Inga listor.
Svara på det han precis sa. Max två meningar.
Om han vill boka möte, lägga in kund eller skicka mejl: bekräfta kort.
Du ringer och smsar inte.`;

const MODELS = [
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-flash-latest",
];

function actionFrom(text: string) {
  const t = text.toLowerCase();
  if (/skicka.*(mejl|mail)|uppfölj/.test(t)) return "mail";
  if (/boka|nytt möte|lägg in möte/.test(t)) return "book";
  if (/lägg in kund|ny kund/.test(t)) return "crm";
  return "none";
}

async function geminiReply(key: string, text: string, history: Turn[], p1: string[]) {
  const contents = [
    ...history.slice(-8).map((h) => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.content }],
    })),
    { role: "user", parts: [{ text }] },
  ];
  const body = {
    systemInstruction: {
      parts: [{ text: SYSTEM + (p1.length ? " Idag först: " + p1[0] : "") }],
    },
    contents,
    generationConfig: { maxOutputTokens: 140, temperature: 0.55 },
  };
  for (const model of MODELS) {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" +
        model +
        ":generateContent?key=" +
        encodeURIComponent(key),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) continue;
    const data = await res.json();
    const reply = String(data.candidates?.[0]?.content?.parts?.[0]?.text || "").trim();
    if (reply) return reply;
  }
  return "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = String(body.text || "").trim();
    const audioB64 = String(body.audio || "");
    const mime = String(body.mime || "audio/mp4");
    const p1: string[] = Array.isArray(body.p1) ? body.p1 : [];
    const history: Turn[] = Array.isArray(body.history) ? body.history.slice(-10) : [];
    if (!text && !audioB64) return NextResponse.json({ reply: "Säg igen.", action: "none" });

    const act = actionFrom(text);
    const key = process.env.GEMINI_API_KEY;
    let reply = "";
    if (key && audioB64) {
      try {
        const g = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
            encodeURIComponent(key),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: SYSTEM }] },
              contents: [
                {
                  role: "user",
                  parts: [
                    { text: "Lyssna. Svara kort på svenska på det jag säger." },
                    { inline_data: { mime_type: mime, data: audioB64 } },
                  ],
                },
              ],
              generationConfig: { maxOutputTokens: 140, temperature: 0.5 },
            }),
          }
        );
        if (g.ok) {
          const data = await g.json();
          reply = String(data.candidates?.[0]?.content?.parts?.[0]?.text || "").trim();
        }
      } catch {
        reply = "";
      }
    }
    if (key && !reply && text) {
      try {
        reply = await geminiReply(key, text, history, p1);
      } catch {
        reply = "";
      }
    }

    if (!reply) {
      if (act === "mail") reply = "Då skickar jag mejlen.";
      else if (act === "book") reply = "Jag bokar det.";
      else if (act === "crm") reply = "Kunden är inne.";
      else if (/vad ska jag|dagens|viktigt/.test(text.toLowerCase()))
        reply = p1.length ? "Först: " + p1[0] + "." : "Inget akut.";
      else if (/hej|tjena|hallå|hör du/.test(text.toLowerCase())) reply = "Här. Jag lyssnar.";
      else reply = "Uppfattat. Ska jag boka, lägga in kund eller skicka mejl?";
    }

    const payload: Record<string, unknown> = { reply, action: act, gemini: Boolean(key && reply) };
    if (act === "book") payload.event = { title: "Möte via konferens", notes: text, type: "möte" };
    if (act === "crm") payload.person = { firstName: "Kund", notes: text };
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ reply: "Säg igen.", action: "none" });
  }
}
