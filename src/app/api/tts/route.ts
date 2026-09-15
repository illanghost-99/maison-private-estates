// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";

async function speak(text: string) {
  const key = process.env.OPENAI_API_KEY;
  const input = (text || "Hej.").slice(0, 400);
  if (key) {
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1-hd",
        voice: "echo",
        speed: 1.02,
        input,
        response_format: "mp3",
      }),
    });
    if (res.ok) {
      const buf = await res.arrayBuffer();
      return new NextResponse(buf, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "no-store",
        },
      });
    }
  }
  return NextResponse.json({ error: "tts" }, { status: 502 });
}

export async function GET(req: NextRequest) {
  return speak(req.nextUrl.searchParams.get("q") || "Hej.");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return speak(String(body.text || "Hej."));
  } catch {
    return speak("Hej.");
  }
}
