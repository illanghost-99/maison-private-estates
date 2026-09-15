import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = String(body.text || "").trim();
    const p1 = Array.isArray(body.p1) ? body.p1.join(". ") : "";
    const t = text.toLowerCase();

    let action: "none" | "mail" | "book" | "crm" | "brief" = "none";
    let reply = "";

    if (!text) {
      reply = "Jag hörde inget. Säg igen.";
    } else if (/skicka.*(mejl|mail)|skicka alla|uppfölj/.test(t)) {
      action = "mail";
      reply = "Okej, jag skickar dagens uppföljningsmejl nu.";
    } else if (/boka|nytt möte|lägg in möte/.test(t)) {
      action = "book";
      reply = "Jag bokar det. Kolla kalendern sen.";
    } else if (/lägg in kund|ny kund|crm/.test(t)) {
      action = "crm";
      reply = "Kunden är inne i systemet.";
    } else if (/vad ska jag|vad har jag|dagens|briefing|viktigt/.test(t)) {
      action = "brief";
      reply = p1
        ? "Viktigast just nu: " + p1 + ". Resten kan jag ta."
        : "Inget akut på listan. Säg vad vi gör.";
    } else if (/ring|sms/.test(t)) {
      reply = "Samtal och sms tar du. Jag tar mejl, kalender och CRM.";
    } else if (/hej|tjena|hallå|hör du/.test(t)) {
      reply = "Ja, jag är här. Vad gör vi?";
    } else if (/tack|bra|ok|okej/.test(t)) {
      reply = "Toppen. Nästa?";
    } else if (/fotografering|foto/.test(t)) {
      reply = "Fotografering ligger som en grej att boka. Säg till om jag ska lägga tid i kalendern.";
    } else {
      reply =
        "Jag hörde: " +
        text.slice(0, 80) +
        ". Säg om jag ska skicka mejl, boka möte eller lägga in en kund.";
    }

    return NextResponse.json({ reply, action });
  } catch {
    return NextResponse.json({ reply: "Något strulade. Säg igen.", action: "none" });
  }
}
