import { NextRequest, NextResponse } from "next/server";
import { getLead, logCall } from "@/lib/lead-store";
import { sendTelegram } from "@/lib/telegram";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") || "";
  const phone = req.nextUrl.searchParams.get("phone") || "";
  const lead = id ? logCall(id, "telegram-knapp") : null;
  const name = lead
    ? lead.firstName + " " + (lead.lastName || "")
    : "Kund";
  const tel = (lead?.phone || phone).replace(/\s/g, "");

  if (lead || phone) {
    await sendTelegram(
      "📞 Samtal loggat (inget raderat)\n\nNamn: " +
        name.trim() +
        "\nTelefon: " +
        tel +
        (id ? "\nID: " + id : "") +
        "\nTid: " +
        new Date().toLocaleString("sv-SE")
    );
  }

  const html = `<!doctype html>
<html lang="sv"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Ringer…</title>
</head>
<body style="font-family:sans-serif;background:#0a0a0a;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
<div style="text-align:center;padding:24px">
<p style="color:#c9a84c">Samtalet är loggat</p>
<p>${name}</p>
<p><a href="tel:${tel}" style="color:#c9a84c;font-size:20px">${tel}</a></p>
<p style="color:#888;font-size:13px">Tryck på numret om samtalet inte startar själv.</p>
</div>
<script>if (${JSON.stringify(!!tel)}) setTimeout(function(){ location.href = "tel:${tel}"; }, 300);</script>
</body></html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "");
  const lead = id ? logCall(id, "admin") : null;
  return NextResponse.json({ ok: !!lead, lead });
}
