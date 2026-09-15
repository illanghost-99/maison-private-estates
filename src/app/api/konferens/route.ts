// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";

type Turn = { role: "user" | "assistant"; content: string };

const SYSTEM = `Du är Erfans personliga mäklarassistent i bilen. Svenska. Kort. Naturligt samtal.
Max två korta meningar. Ingen humor, inga emojis, ingen robotton.
Du hjälper Erfan Irandost, mäklare i Sollentuna.
Använd verktyg när han vill boka möte, lägga in kund eller skicka uppföljningsmejl.
Ring och SMS tar Erfan själv.
Om han bara pratar: svara på det han sa och fortsätt samtalet.`;

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

    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return NextResponse.json({
        reply: "OpenAI-nyckeln saknas i Vercel. Lägg OPENAI_API_KEY och gör Redeploy.",
        action: "none",
      });
    }

    const messages: { role: string; content: string | null; tool_calls?: unknown }[] = [
      {
        role: "system",
        content:
          SYSTEM +
          (p1.length ? " Viktigast idag: " + p1.join("; ") + "." : " Inga P1 just nu."),
      },
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
        temperature: 0.5,
        max_tokens: 120,
        messages,
        tools,
        tool_choice: "auto",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("openai", res.status, err.slice(0, 300));
      return NextResponse.json({
        reply: "Jag når inte GPT just nu. Kolla nyckel och credits.",
        action: "none",
      });
    }

    const data = await res.json();
    const msg = data.choices?.[0]?.message;
    const toolCalls = msg?.tool_calls as
      | { function: { name: string; arguments: string } }[]
      | undefined;

    if (toolCalls?.length) {
      const call = toolCalls[0];
      let args: Record<string, string> = {};
      try {
        args = JSON.parse(call.function.arguments || "{}");
      } catch {
        args = {};
      }
      if (call.function.name === "boka_mote") {
        return NextResponse.json({
          reply: "Jag bokar " + (args.namn || "kunden") + (args.när ? " " + args.när : "") + ".",
          action: "book",
          event: {
            title: (args.typ || "Möte") + " " + (args.namn || ""),
            person: args.namn || "",
            phone: args.telefon || "",
            email: args.epost || "",
            when: args.när || "",
            notes: args.anteckning || text,
            type: args.typ || "möte",
          },
        });
      }
      if (call.function.name === "lagg_in_kund") {
        return NextResponse.json({
          reply: "Kunden " + (args.fornamn || "") + " är inne i CRM.",
          action: "crm",
          person: {
            firstName: args.fornamn || "Kund",
            lastName: args.efternamn || "",
            phone: args.telefon || "",
            email: args.epost || "",
            notes: args.anteckning || text,
          },
        });
      }
      if (call.function.name === "skicka_uppfoljning") {
        return NextResponse.json({
          reply: "Jag skickar dagens uppföljningsmejl.",
          action: "mail",
        });
      }
    }

    const reply = String(msg?.content || "").trim() || "Okej. Jag lyssnar.";
    return NextResponse.json({ reply, action: "none" });
  } catch {
    return NextResponse.json({ reply: "Säg igen.", action: "none" });
  }
}
