export type Priority = 1 | 2 | 3;
export type TaskOwner = "erfan" | "agent";
export type TaskStatus = "open" | "doing" | "done";

export interface WorkTask {
  id: string;
  title: string;
  why: string;
  priority: Priority;
  owner: TaskOwner;
  status: TaskStatus;
  due?: string;
  relatedName?: string;
  agentDraft?: string;
}

export interface CrmPerson {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  stage: "ny" | "kontaktad" | "möte" | "aktiv" | "vunnen" | "pausad";
  intent: "köpa" | "sälja" | "båda" | "okänt";
  score: number;
  area: string;
  lastTouch: string;
  nextStep: string;
  notes: string;
}

export interface CalEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: "möte" | "visning" | "värdering" | "fotografering" | "uppföljning" | "admin";
  person?: string;
  location?: string;
  notes?: string;
}

export const defaultTasks: WorkTask[] = [
  {
    id: "t1",
    title: "Ring Maria Holm – värdering Tureberg",
    why: "Hög säljsignal. Svar inom 2 timmar ökar chansen att få uppdraget.",
    priority: 1,
    owner: "erfan",
    status: "open",
    due: "Idag förmiddag",
    relatedName: "Maria Holm",
  },
  {
    id: "t2",
    title: "Bekräfta kundmöte med Johan Svensson",
    why: "Intresserad av Edsviken/Viby. Ett bekräftat möte idag låser in pipeline.",
    priority: 1,
    owner: "erfan",
    status: "open",
    due: "Idag",
    relatedName: "Johan Svensson",
  },
  {
    id: "t3b",
    title: "Fotografering – boka fotograf / var på plats",
    why: "Bra bilder säljer. Blockera tid i kalendern och se till att bostaden är stylad.",
    priority: 1,
    owner: "erfan",
    status: "open",
    due: "Innan visning",
  },
  {
    id: "t3",
    title: "Förbered nästa visning – kort briefing",
    why: "3 minuters förberedelse ger tydligare samtal och fler seriösa följdfrågor.",
    priority: 2,
    owner: "erfan",
    status: "open",
    due: "Innan nästa visning",
  },
  {
    id: "t4",
    title: "Skicka tackmejl efter senaste mötet",
    why: "Håller relationen varm. Agenten kan skriva utkastet, du godkänner.",
    priority: 3,
    owner: "agent",
    status: "open",
    relatedName: "Erik Lindqvist",
    agentDraft:
      "Hej Erik,\n\nTack för ett bra samtal. Som vi sa går jag igenom alternativen i Edsviken och Viby och återkommer med ett konkret nästa steg.\n\nHör av dig om något dyker upp innan dess.\n\nVänliga hälsningar\nErfan Irandost",
  },
  {
    id: "t5",
    title: "Skriv kort utvärdering av gårdagens möte",
    why: "Dokumentation gör nästa samtal bättre och lär agenten din stil.",
    priority: 3,
    owner: "agent",
    status: "open",
    relatedName: "Anna Bergström",
    agentDraft:
      "Utvärdering – möte Anna Bergström\n\nMål: 3–4 rok i Häggvik/Rotebro, budget ca 2,5–5 MSEK.\nSignal: Intresserad men vill inte stressa. Föredrar kvällstid.\nNästa steg: Skicka 2–3 exempelobjekt och boka visning när rätt läge dyker upp.\nRisk: Kan tappa momentum om vi väntar mer än 5 dagar.",
  },
  {
    id: "t6",
    title: "Påminnelse till leads som inte fått svar",
    why: "Tysta leads kyls snabbt. Agenten kan skicka en mjuk uppföljning.",
    priority: 3,
    owner: "agent",
    status: "open",
    agentDraft:
      "Hej,\n\nVille bara stämma av om du fortfarande vill ta ett kort samtal om bostaden. Jag har tid imorgon eftermiddag eller torsdag förmiddag.\n\nSäg vad som passar.\n\nErfan",
  },
  {
    id: "t7",
    title: "Checklista inför fotografering",
    why: "Agenten tar fram listan. Du ser till att säljaren är redo när fotografen kommer.",
    priority: 3,
    owner: "agent",
    status: "open",
    agentDraft:
      "Inför fotografering\n\n– Boka fotograf och blockera 2 timmar i kalendern\n– Be säljaren städa, tända lampor, ta bort personliga saker\n– Kolla väder/ljus, gärna förmiddag\n– Efteråt: välj 8–12 bilder, agenten kan skriva bildtexter",
  },
];

export const defaultCrm: CrmPerson[] = [
  {
    id: "c1",
    firstName: "Maria",
    lastName: "Holm",
    phone: "073-111 22 33",
    email: "maria.holm@email.com",
    stage: "ny",
    intent: "sälja",
    score: 92,
    area: "Tureberg",
    lastTouch: "Idag via chatt",
    nextStep: "Ring för värdering",
    notes: "Vill ha värdering. Hög prioritet.",
  },
  {
    id: "c2",
    firstName: "Johan",
    lastName: "Svensson",
    phone: "070-555 12 34",
    email: "johan.s@email.com",
    stage: "kontaktad",
    intent: "köpa",
    score: 85,
    area: "Edsviken / Viby",
    lastTouch: "Igår",
    nextStep: "Boka möte",
    notes: "Söker större bostad 5–6 MSEK.",
  },
  {
    id: "c3",
    firstName: "Erik",
    lastName: "Lindqvist",
    phone: "070-123 45 67",
    email: "erik.lindqvist@email.com",
    stage: "möte",
    intent: "köpa",
    score: 80,
    area: "Edsviken",
    lastTouch: "2 dagar sedan",
    nextStep: "Skicka tackmejl + 2 objekt",
    notes: "Familj. Vill ha konkret nästa steg.",
  },
  {
    id: "c4",
    firstName: "Anna",
    lastName: "Bergström",
    phone: "073-987 65 43",
    email: "anna.bergstrom@email.com",
    stage: "aktiv",
    intent: "båda",
    score: 65,
    area: "Häggvik",
    lastTouch: "4 dagar sedan",
    nextStep: "Uppföljning denna vecka",
    notes: "Kan både sälja och köpa. Inte bråttom.",
  },
];

export function defaultWeekEvents(): CalEvent[] {
  const now = new Date();
  const at = (dayOffset: number, h: number, m = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  const end = (dayOffset: number, h: number, m = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  return [
    {
      id: "e1",
      title: "Kundmöte – Johan Svensson",
      start: at(0, 10),
      end: end(0, 11),
      type: "möte",
      person: "Johan Svensson",
      location: "Kontor / video",
    },
    {
      id: "e2",
      title: "Värdering – Tureberg",
      start: at(1, 13),
      end: end(1, 14, 30),
      type: "värdering",
      person: "Maria Holm",
      location: "Tureberg",
    },
    {
      id: "e3",
      title: "Uppföljning – Erik Lindqvist",
      start: at(2, 16),
      end: end(2, 16, 30),
      type: "uppföljning",
      person: "Erik Lindqvist",
    },
    {
      id: "e4",
      title: "Fotografering",
      start: at(1, 9),
      end: end(1, 11),
      type: "fotografering",
      person: "Säljare",
      location: "Enligt objektsadress",
      notes: "Styling + foto. Blockera restid.",
    },
  ];
}
