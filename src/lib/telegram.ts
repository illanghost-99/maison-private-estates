export const TG_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN ||
  "8626574422:AAHPna-6XZy69W5_onJ0z9i5eQD7qS5wtss";
export const TG_CHAT = process.env.TELEGRAM_CHAT_ID || "8662954140";
export const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://maison-private-estates.vercel.app";

export type LeadFlag = "hot" | "call" | "overdue";

export function classifyLead(input: {
  message: string;
  type: string;
  booking?: boolean;
}): LeadFlag {
  const t = (input.message + " " + input.type).toLowerCase();
  const hotWords = [
    "köpa", "köper", "boka", "möte", "visning", "värdering", "bud",
    "snarast", "idag", "imorgon", "sälja", "säljer",
  ];
  if (input.booking || input.type !== "meddelande") return "hot";
  if (hotWords.some((w) => t.includes(w))) return "hot";
  return "call";
}

export function flagMeta(flag: LeadFlag) {
  if (flag === "hot") {
    return {
      emoji: "✅",
      title: "Otroligt seriös – kontakta omedelbart",
      hint: "Vill köpa, boka möte eller gå på visning.",
    };
  }
  if (flag === "overdue") {
    return {
      emoji: "🅱️",
      title: "Kunden har väntat 2–3 dagar",
      hint: "Samma kund som tidigare. Ring nu – inget har tagits bort.",
    };
  }
  return {
    emoji: "📳",
    title: "Ring upp – ingen stress",
    hint: "Frågor om objekt, budget eller allmänt intresse.",
  };
}

export async function sendTelegram(
  text: string,
  leadId?: string,
  phone?: string
) {
  const body: Record<string, unknown> = {
    chat_id: TG_CHAT,
    text,
    disable_web_page_preview: true,
  };
  if (leadId && phone) {
    const url =
      SITE +
      "/api/call-log?id=" +
      encodeURIComponent(leadId) +
      "&phone=" +
      encodeURIComponent(phone);
    body.reply_markup = {
      inline_keyboard: [[{ text: "📞 Ring och logga", url }]],
    };
  }
  const res = await fetch(
    "https://api.telegram.org/bot" + TG_TOKEN + "/sendMessage",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  return res.ok;
}
