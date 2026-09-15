import { NextRequest, NextResponse } from "next/server";
import { classifyLead, flagMeta, sendTelegram } from "@/lib/telegram";
import { upsertLead } from "@/lib/lead-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const firstName = String(body.firstName || body.name || "").trim();
    const lastName = String(body.lastName || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const message = String(body.message || "").trim();
    const type = String(body.type || "meddelande").trim();
    const preferredTime = String(body.preferredTime || "").trim();
    const booking = Boolean(body.forceNotify || body.booking);

    if (!firstName || !phone) {
      return NextResponse.json(
        { error: "Förnamn och telefon krävs" },
        { status: 400 }
      );
    }

    const flag = classifyLead({ message: message || type, type, booking });
    const meta = flagMeta(flag);
    const id = "L" + Date.now();

    upsertLead({
      id,
      firstName,
      lastName,
      phone,
      email,
      type,
      message,
      flag,
      createdAt: new Date().toISOString(),
      calls: [],
      reminders: [],
    });

    const text = [
      meta.emoji + " " + meta.title,
      meta.hint,
      "",
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
      "ID: " + id,
      "Tryck Ring och logga – då vet agenten att du ringt.",
    ]
      .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
      .join("\n");

    const telegramSent = await sendTelegram(text, id, phone);

    return NextResponse.json({
      ok: true,
      id,
      flag,
      telegramSent,
    });
  } catch {
    return NextResponse.json({ error: "Serverfel" }, { status: 500 });
  }
}
