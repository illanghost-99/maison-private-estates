import { NextRequest, NextResponse } from "next/server";

const TG_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN ||
  "8626574422:AAHPna-6XZy69W5_onJ0z9i5eQD7qS5wtss";
const TG_CHAT =
  process.env.TELEGRAM_CHAT_ID || "8662954140";

function scoreMessage(message: string, fullName: string) {
  const t = (message + " " + fullName).toLowerCase();
  let score = 40;
  const hot = [
    "köpa", "köper", "bud", "visning", "boka", "värdering", "sälja", "säljer",
    "intresserad", "intresse", "snarast", "idag", "imorgon", "ring", "återkom",
    "lägenhet", "villa", "sollentuna", "edsviken", "viby", "möte", "kontakta",
  ];
  for (const w of hot) if (t.includes(w)) score += 8;
  if (message.trim().length > 80) score += 10;
  score = Math.min(99, score);
  const serious = score >= 60;
  return {
    score,
    serious,
    reason: serious
      ? "Seriöst intresse – kontakta snarast"
      : "Förfrågan via hemsidan",
  };
}

async function sendTelegram(text: string) {
  const res = await fetch(
    "https://api.telegram.org/bot" + TG_TOKEN + "/sendMessage",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TG_CHAT,
        text,
        disable_web_page_preview: true,
      }),
    }
  );
  return res.ok;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const firstName = String(body.firstName || body.name || "").trim();
    const lastName = String(body.lastName || "").trim();
    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const message = String(body.message || "").trim();
    const type = String(body.type || "meddelande").trim();
    const preferredTime = String(body.preferredTime || "").trim();
    const forceNotify = Boolean(body.forceNotify || body.booking);

    if (!firstName || !phone) {
      return NextResponse.json(
        { error: "Förnamn och telefon krävs" },
        { status: 400 }
      );
    }

    const { score, serious, reason } = scoreMessage(
      message || type + " " + preferredTime,
      fullName
    );

    const shouldNotify = forceNotify || serious || type !== "meddelande";

    const text = [
      "🏠 Maison AI",
      forceNotify || type !== "meddelande" ? "📅 Bokning / mötesförfrågan" : "✉️ Nytt meddelande",
      "",
      "⚠️ " + reason,
      "Score: " + score,
      "Typ: " + type,
      preferredTime ? "Önskad tid: " + preferredTime : "",
      "",
      "Förnamn: " + firstName,
      "Efternamn: " + (lastName || "–"),
      "Telefon: " + phone,
      "E-post: " + (email || "–"),
      "",
      "Meddelande:",
      message || "–",
      "",
      shouldNotify ? "→ Kontakta kunden snarast." : "→ Loggad i inbox.",
    ]
      .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
      .join("\n");

    let telegramSent = false;
    if (shouldNotify) {
      telegramSent = await sendTelegram(text);
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
