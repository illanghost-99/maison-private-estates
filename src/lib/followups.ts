export type FollowupKind = "tack" | "paminelse" | "visning" | "varde" | "tyst";

export interface Followup {
  id: string;
  kind: FollowupKind;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  body: string;
  dueAt: string;
  status: "scheduled" | "ready" | "sent" | "skipped";
  source: string;
}

export function hoursFromNow(h: number) {
  return new Date(Date.now() + h * 60 * 60 * 1000).toISOString();
}

export function buildFollowups(input: {
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  type?: string;
  source?: string;
}): Followup[] {
  const name = input.firstName || "du";
  const last = input.lastName || "";
  const base = {
    firstName: input.firstName,
    lastName: last,
    email: input.email,
    phone: input.phone,
    source: input.source || "webb",
  };
  const t = (input.type || "").toLowerCase();
  const items: Followup[] = [
    {
      ...base,
      id: "f-tack-" + Date.now(),
      kind: "tack",
      subject: "Tack för att du hörde av dig",
      body:
        "Hej " +
        name +
        ",\n\nTack för att du hörde av dig. Jag återkommer så snart jag kan med ett konkret nästa steg.\n\nVänliga hälsningar\nErfan Irandost\n073-633 46 41",
      dueAt: hoursFromNow(2),
      status: "scheduled",
    },
    {
      ...base,
      id: "f-pam-" + Date.now(),
      kind: "paminelse",
      subject: "Kort avstämning",
      body:
        "Hej " +
        name +
        ",\n\nVille bara stämma av om du fortfarande vill ta ett samtal. Jag har tid senare i veckan.\n\nSäg vad som passar.\n\nErfan Irandost\n073-633 46 41",
      dueAt: hoursFromNow(48),
      status: "scheduled",
    },
  ];
  if (t.includes("visning")) {
    items.push({
      ...base,
      id: "f-vis-" + Date.now(),
      kind: "visning",
      subject: "Inför visningen",
      body:
        "Hej " +
        name +
        ",\n\nSer fram emot visningen. Hör av dig om tiden behöver justeras.\n\nErfan Irandost",
      dueAt: hoursFromNow(24),
      status: "scheduled",
    });
  }
  if (t.includes("värdering") || t.includes("varde")) {
    items.push({
      ...base,
      id: "f-val-" + Date.now(),
      kind: "varde",
      subject: "Inför värderingen",
      body:
        "Hej " +
        name +
        ",\n\nInför värderingen räcker det att bostaden är tillgänglig som vanligt. Jag hör av mig om exakt tid.\n\nErfan Irandost",
      dueAt: hoursFromNow(20),
      status: "scheduled",
    });
  }
  return items;
}

export function dueNow(list: Followup[]) {
  const now = Date.now();
  return list.filter(
    (f) => f.status === "scheduled" && new Date(f.dueAt).getTime() <= now
  );
}
