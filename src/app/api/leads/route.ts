import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";

export async function GET() {
  try {
    const file = "/tmp/maison-leads.json";
    const rows = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : [];
    return NextResponse.json({ leads: rows });
  } catch {
    return NextResponse.json({ leads: [] });
  }
}
