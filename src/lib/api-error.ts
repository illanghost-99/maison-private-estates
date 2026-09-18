import { NextResponse } from "next/server";

export function jsonOk(data: Record<string, unknown>, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

export function jsonFail(message: string, extra: Record<string, unknown> = {}, status = 200) {
  return NextResponse.json({ ok: false, error: message, reply: extra.reply || "Något gick fel. Försök igen.", action: extra.action || "none", ...extra }, { status });
}

export async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try {
    return await promise;
  } finally {
    clearTimeout(t);
  }
}
