import { NextResponse } from "next/server";
import { overdueLeads, markReminded, getLead } from "@/lib/lead-store";
import { flagMeta, sendTelegram } from "@/lib/telegram";

export async function GET() {
  const stale = overdueLeads(48);
  let sent = 0;
  for (const lead of stale) {
    const meta = flagMeta("overdue");
    const text = [
      meta.emoji + " " + meta.title,
      meta.hint,
      "",
      "Detta är samma kund som tidigare notis.",
      "Typ: " + lead.type,
      "",
      "Förnamn: " + lead.firstName,
      "Efternamn: " + (lead.lastName || "–"),
      "Telefon: " + lead.phone,
      "E-post: " + (lead.email || "–"),
      "",
      "Ursprungligt meddelande:",
      lead.message || "–",
      "",
      "ID: " + lead.id,
    ].join("\n");
    const ok = await sendTelegram(text, lead.id, lead.phone);
    if (ok) {
      markReminded(lead.id);
      sent += 1;
    }
  }
  return NextResponse.json({ checked: stale.length, sent });
}

export async function POST() {
  return GET();
}
