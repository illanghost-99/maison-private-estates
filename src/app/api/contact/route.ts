import { NextRequest, NextResponse } from "next/server";

function scoreMessage(message: string, name: string): { score: number; serious: boolean; reason: string } {
  const t = (message + " " + name).toLowerCase();
  let score = 40;
  const hot = [
    "köpa", "köper", "bud", "visning", "boka", "värdering", "sälja", "säljer",
    "intresserad", "intresse", "snarast", "idag", "imorgon", "ring", "återkom",
    "lägenhet", "villa", "sollentuna", "edsviken", "viby", "möte", "kontakta",
  ];
  const mild = ["info", "information", "undrar", "kanske", "titta", "fråga"];
  for (const w of hot) if (t.includes(w)) score += 8;
  for (const w of mild) if (t.includes(w)) score += 2;
  if (message.trim().length > 80) score += 10;
  if (message.trim().length > 160) score += 5;
  if (/\d{2,}/.test(message)) score += 5; // ev. budget/rum
  score = Math.min(99, score);
  const serious = score >= 65;
  const reason = serious
    ? "Seriöst intresse – prioritetsavisering"
    : "Standardförfrågan – loggad i inbox";
  return { score, serious, reason };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const message = String(body.message || "").trim();

    if (!name || !email || !phone || !message) {
      return NextResponse.json({ error: "Fyll i alla fält" }, { status: 400 });
    }
    if (!email.includes("@")) {
      return NextResponse.json({ error: "Ogiltig e-post" }, { status: 400 });
    }

    const { score, serious, reason } = scoreMessage(message, name);

    let telegramSent = false;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (serious && token && chatId) {
      const text = [
        "🏠 Maison AI – prioritetslead",
        "",
        "⚠️ " + reason,
        "Score: " + score,
        "",
        "Namn: " + name,
        "Telefon: " + phone,
        "E-post: " + email,
        "",
        "Meddelande:",
        message,
        "",
        "→ Kontakta kunden snarast.",
      ].join("\n");

      const tg = await fetch(
        "https://api.telegram.org/bot" + token + "/sendMessage",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            disable_web_page_preview: true,
          }),
        }
      );
      telegramSent = tg.ok;
    }

    return NextResponse.json({
      ok: true,
      score,
      serious,
      reason,
      telegramSent,
    });
  } catch {
    return NextResponse.json({ error: "Serverfel" }, { status: 500 });
  }
}
