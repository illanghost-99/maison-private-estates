import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export interface StoredLead {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  type: string;
  message: string;
  flag: "hot" | "call" | "overdue";
  createdAt: string;
  calls: { at: string; source: string }[];
  reminders: { at: string }[];
}

const FILE = join("/tmp", "maison-leads.json");

function readAll(): StoredLead[] {
  try {
    if (!existsSync(FILE)) return [];
    return JSON.parse(readFileSync(FILE, "utf8")) as StoredLead[];
  } catch {
    return [];
  }
}
function writeAll(rows: StoredLead[]) {
  try {
    mkdirSync("/tmp", { recursive: true });
    writeFileSync(FILE, JSON.stringify(rows));
  } catch {}
}

export function upsertLead(lead: StoredLead) {
  const rows = readAll();
  const i = rows.findIndex((r) => r.id === lead.id);
  if (i >= 0) rows[i] = lead;
  else rows.unshift(lead);
  writeAll(rows.slice(0, 200));
  return lead;
}

export function getLead(id: string) {
  return readAll().find((r) => r.id === id);
}

export function logCall(id: string, source = "telegram") {
  const rows = readAll();
  const lead = rows.find((r) => r.id === id);
  if (!lead) return null;
  lead.calls = lead.calls || [];
  lead.calls.push({ at: new Date().toISOString(), source });
  writeAll(rows);
  return lead;
}

export function overdueLeads(hours = 48) {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  return readAll().filter((l) => {
    const created = new Date(l.createdAt).getTime();
    const called = (l.calls || []).length > 0;
    const reminded = (l.reminders || []).length > 0;
    return !called && !reminded && created <= cutoff;
  });
}

export function markReminded(id: string) {
  const rows = readAll();
  const lead = rows.find((r) => r.id === id);
  if (!lead) return;
  lead.reminders = lead.reminders || [];
  lead.reminders.push({ at: new Date().toISOString() });
  writeAll(rows);
}
