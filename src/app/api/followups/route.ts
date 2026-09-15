import { NextRequest, NextResponse } from "next/server";
import { sendTelegram } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim();
    const subject = String(body.subject || "").trim();
    const text = String(body.body || "").trim();
    const name = String(body.firstName || "Kund");
    if (!email || !subject || !text) {
      return NextResponse.json({ error: "Saknar fält" }, { status: 400 });
    }

    let emailed = false;
    const key = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM || "Erfan Irandost <erfan@maison-estates.se>";
    if (key) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to: [email], subject, text }),
      });
      emailed = res.ok;
    }

    await sendTelegram(
      "📧 Uppföljningsmejl " +
        (emailed ? "skickat" : "redo att skickas") +
        "\n\nTill: " +
        name +
        "\nE-post: " +
        email +
        "\nÄmne: " +
        subject +
        "\n\n" +
        text.slice(0, 500)
    );

    return NextResponse.json({
      ok: true,
      emailed,
      mailto:
        "mailto:" +
        encodeURIComponent(email) +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(text),
    });
  } catch {
    return NextResponse.json({ error: "Serverfel" }, { status: 500 });
  }
}
