import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "Hej.";
  const url =
    "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=sv&q=" +
    encodeURIComponent(q.slice(0, 180));
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "tts" }, { status: 502 });
    }
    const buf = await res.arrayBuffer();
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "tts" }, { status: 502 });
  }
}
